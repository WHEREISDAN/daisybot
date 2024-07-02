import { PrismaClient } from '@prisma/client'
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
        const profile = await prisma.serverProfile.upsert({
            where: { userId_guildId: { userId, guildId } },
            update: {}, // If it exists, don't update anything
            create: {
                userId,
                guildId,
            },
        });
        logger.info(`Server profile handled for user ${userId} in guild ${guildId}`);
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

export default prisma