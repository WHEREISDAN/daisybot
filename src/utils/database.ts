import { PrismaClient } from '@prisma/client'
import { AutoModConfig, AutoModUpdateData } from '../types/autoMod';
import { logger } from './logger';

const prisma = new PrismaClient()

async function connectDatabase() {
    logger.warn('Attempting to connect to the database...')
    try {
        await prisma.$connect();
    } catch (error) {
        logger.error('Failed to connect to the database:', error)
        process.exit(1)
    }
}

// Call this function when your application starts
connectDatabase()

// Gracefully disconnect when the application shuts down
process.on('SIGINT', async () => {
    await prisma.$disconnect()
    logger.info('Disconnected from the database')
    process.exit(0)
})

export async function getOrCreateGlobalProfile(userId: string) {
    try {
        await prisma.user.upsert({
            where: { id: userId },
            update: {}, // No update needed
            create: { id: userId },
        });

        const profile = await prisma.globalProfile.upsert({
            where: { userId },
            update: {}, // If it exists, don't update anything
            create: { userId },
        });
        logger.info(`Global profile handled for user ${userId}`);
        return profile;
    } catch (error) {
        logger.error(`Error in getOrCreateGlobalProfile for user ${userId}:`, error);
        throw error;
    }
}

export async function getOrCreateServerProfile(userId: string, guildId: string) {
    try {
        let profile = await prisma.serverProfile.findUnique({
            where: {
                userId_guildId: {
                    userId: userId,
                    guildId: guildId
                }
            }
        });

        if (!profile) {
            profile = await prisma.serverProfile.create({
                data: {
                    userId: userId,
                    guildId: guildId
                }
            });
            logger.info(`Created new server profile for user ${userId} in guild ${guildId}`);
        } else {
            logger.info(`Retrieved existing server profile for user ${userId} in guild ${guildId}`);
        }

        return profile;
    } catch (error) {
        logger.error(`Error in getOrCreateServerProfile for user ${userId} in guild ${guildId}:`, error);
        throw error;
    }
}

export async function updateGlobalProfile(userId: string, data: { xp?: number; level?: number; bio?: string | null }) {
    return prisma.globalProfile.update({
        where: { userId },
        data,
    });
}

export async function updateServerProfile(userId: string, guildId: string, data: { xp?: number; level?: number; nickname?: string | null }) {
    return prisma.serverProfile.update({
        where: { userId_guildId: { userId, guildId } },
        data,
    });
}

export async function addInfraction(userId: string, type: 'kicks' | 'bans' | 'warns' | 'mutes') {
    const profile = await getOrCreateGlobalProfile(userId);
    const reputation = profile.reputation as Record<string, number>;
    const newCount = (reputation[type] || 0) + 1;
    reputation[type] = newCount;
    await prisma.globalProfile.update({
        where: { userId },
        data: { reputation },
    });
}

export async function addReputation(userId: string, change: 1 | -1, reason: string) {
    const profile = await getOrCreateGlobalProfile(userId);
    const reputation = profile.reputation as Array<{ change: number; reason: string }>;
    const newReputation = [...reputation, { change, reason }];
    await prisma.globalProfile.update({
        where: { userId },
        data: { reputation: newReputation },
    });
}

export async function setWelcomeChannel(guildId: string, channelId: string, guildName: string) {
    try {
        await prisma.guild.upsert({
            where: { id: guildId },
            update: { welcomeChannelId: channelId },
            create: {
                id: guildId,
                name: guildName,  // Include the name field
                welcomeChannelId: channelId
            }
        });
        logger.info(`Set welcome channel for guild ${guildId} to ${channelId}`);
    } catch (error) {
        logger.error(`Error setting welcome channel for guild ${guildId}:`, error);
        throw error;
    }
}

export async function getWelcomeChannel(guildId: string): Promise<string | null> {
    try {
        const guild = await prisma.guild.findUnique({
            where: { id: guildId },
            select: { welcomeChannelId: true }
        });
        return guild?.welcomeChannelId || null;
    } catch (error) {
        logger.error(`Error getting welcome channel for guild ${guildId}:`, error);
        throw error;
    }
}

export async function getCurrency(userId: string): Promise<number> {
    try {
        const profile = await prisma.globalProfile.findUnique({
            where: { userId },
            select: { currency: true }
        });
        return profile?.currency ?? 0;
    } catch (error) {
        logger.error(`Error getting currency for user ${userId}:`, error);
        throw error;
    }
}

export async function addCurrency(userId: string, amount: number): Promise<number> {
    try {
        const updatedProfile = await prisma.globalProfile.upsert({
            where: { userId },
            update: { currency: { increment: amount } },
            create: { userId, currency: amount },
            select: { currency: true }
        });
        logger.info(`Added ${amount} currency to user ${userId}. New balance: ${updatedProfile.currency}`);
        return updatedProfile.currency;
    } catch (error) {
        logger.error(`Error adding currency for user ${userId}:`, error);
        throw error;
    }
}

export async function removeCurrency(userId: string, amount: number): Promise<number> {
    try {
        const profile = await prisma.globalProfile.findUnique({
            where: { userId },
            select: { currency: true }
        });

        if (!profile || profile.currency < amount) {
            throw new Error('Insufficient funds');
        }

        const updatedProfile = await prisma.globalProfile.update({
            where: { userId },
            data: { currency: { decrement: amount } },
            select: { currency: true }
        });

        logger.info(`Removed ${amount} currency from user ${userId}. New balance: ${updatedProfile.currency}`);
        return updatedProfile.currency;
    } catch (error) {
        logger.error(`Error removing currency for user ${userId}:`, error);
        throw error;
    }
}

function xpForNextLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.1, level));
}

export async function addXP(userId: string, xpToAdd: number): Promise<{ newXP: number, newLevel: number, didLevelUp: boolean }> {
    try {
        const profile = await prisma.globalProfile.findUnique({
            where: { userId },
            select: { xp: true, level: true }
        });

        if (!profile) {
            throw new Error('Profile not found');
        }

        let newXP = profile.xp + xpToAdd;
        let newLevel = profile.level;
        let didLevelUp = false;

        while (newXP >= xpForNextLevel(newLevel)) {
            newXP -= xpForNextLevel(newLevel);
            newLevel++;
            didLevelUp = true;
        }

        await prisma.globalProfile.update({
            where: { userId },
            data: { xp: newXP, level: newLevel }
        });

        logger.info(`User ${userId} gained ${xpToAdd} XP. New XP: ${newXP}, New Level: ${newLevel}`);
        return { newXP, newLevel, didLevelUp };
    } catch (error) {
        logger.error(`Error adding XP for user ${userId}:`, error);
        throw error;
    }
}

export async function getXPAndLevel(userId: string): Promise<{ xp: number, level: number, xpForNext: number }> {
    try {
        const profile = await prisma.globalProfile.findUnique({
            where: { userId },
            select: { xp: true, level: true }
        });

        if (!profile) {
            throw new Error('Profile not found');
        }

        const xpForNext = xpForNextLevel(profile.level);
        return { ...profile, xpForNext };
    } catch (error) {
        logger.error(`Error getting XP and level for user ${userId}:`, error);
        throw error;
    }
}

export async function getAutoModConfig(guildId: string): Promise<AutoModConfig | null> {
    try {
        const config = await prisma.autoMod.findUnique({
            where: { guildId },
        });
        return config as AutoModConfig | null;
    } catch (error) {
        logger.error(`Error getting Auto Mod config for guild ${guildId}:`, error);
        throw error;
    }
}

export async function updateAutoModConfig(guildId: string, data: AutoModUpdateData): Promise<AutoModConfig> {
    try {
        const config = await prisma.autoMod.upsert({
            where: { guildId },
            update: data,
            create: { guildId, ...data },
        });
        logger.info(`Updated Auto Mod config for guild ${guildId}`);
        return config as AutoModConfig;
    } catch (error) {
        logger.error(`Error updating Auto Mod config for guild ${guildId}:`, error);
        throw error;
    }
}


export default prisma