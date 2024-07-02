import { GuildMember, AttachmentBuilder, TextChannel } from 'discord.js';
import { getOrCreateGlobalProfile, getOrCreateServerProfile } from '../../utils/database';
import prisma from '../../utils/database';
import { generateWelcomeImage } from '../../utils/imageGenerator';
import { logger } from '../../utils/logger';

module.exports = {
    name: 'guildMemberAdd', // Changed from 'GuildMemberAdd' to 'guildMemberAdd'
    async execute(member: GuildMember) {
        try {
            // Create or get profiles
            await getOrCreateGlobalProfile(member.id);
            await getOrCreateServerProfile(member.id, member.guild.id);

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
        } catch (error) {
            logger.error(`Error in GuildMemberAdd event for ${member.user.tag}:`, error);
        }
    },
};