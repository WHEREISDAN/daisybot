import { GuildMember, AttachmentBuilder, TextChannel, Role } from 'discord.js';
import { getOrCreateGlobalProfile, getOrCreateServerProfile } from '../../utils/database';
import prisma from '../../utils/database';
import { generateWelcomeImage } from '../../utils/imageGenerator';
import { logger } from '../../utils/logger';
import { logManager } from '../../utils/logManager';
import { log } from 'console';

module.exports = {
    name: 'guildMemberAdd',
    async execute(member: GuildMember) {
        try {
            // Create or get profiles
            await getOrCreateGlobalProfile(member.id);
            await getOrCreateServerProfile(member.id, member.guild.id);

            // Apply auto roles
            await applyAutoRoles(member);

            // Generate welcome image
            const welcomeImage = await generateWelcomeImage(member.user.username, member.user.displayAvatarURL({ extension: 'png', size: 256 }));
            const attachment = new AttachmentBuilder(welcomeImage, { name: 'welcome.png' });

            // Get the configured welcome channel
            const guildConfig = await prisma.guild.findUnique({
                where: { id: member.guild.id }
            });

            const welcomeChannelId = guildConfig?.welcomeChannelId;
            const welcomeChannel = welcomeChannelId
                ? member.guild.channels.cache.get(welcomeChannelId) as TextChannel | undefined
                : undefined;

            if (welcomeChannel && welcomeChannel.isTextBased()) {
                await welcomeChannel.send({
                    content: `Welcome to the server, ${member}! We're glad to have you here.`,
                    files: [attachment]
                });
                logger.info(`Welcomed new member ${member.user.tag} in guild ${member.guild.name}`);
            } else {
                logger.warn(`No welcome channel configured for guild ${member.guild.name}`);
            }

            logManager.logMemberAdd(member);
        } catch (error) {
            logger.error(`Error in guildMemberAdd event for ${member.user.tag}:`, error);
        }
    },
};

async function applyAutoRoles(member: GuildMember) {
    try {
        const guild = await prisma.guild.findUnique({
            where: { id: member.guild.id }
        });

        if (guild && guild.autoRoles.length > 0) {
            const rolesToAdd = guild.autoRoles
                .map((roleId: string) => member.guild.roles.cache.get(roleId))
                .filter((role: any): role is Role => role !== undefined);

            if (rolesToAdd.length > 0) {
                await member.roles.add(rolesToAdd);
                logger.info(`Applied ${rolesToAdd.length} auto roles to ${member.user.tag} in guild ${member.guild.name}`);
            } else {
                logger.warn(`No valid auto roles found for ${member.user.tag} in guild ${member.guild.name}`);
            }
        }
    } catch (error) {
        logger.error(`Error applying auto roles to ${member.user.tag}:`, error);
    }
}