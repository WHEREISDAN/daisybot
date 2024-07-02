import { GuildMember } from 'discord.js';
import { getOrCreateGlobalProfile, getOrCreateServerProfile } from '../../utils/database';
import { logger } from '../../utils/logger';

module.exports = {
  name: 'guildMemberAdd', // Changed from 'GuildMemberAdd' to 'guildMemberAdd'
  async execute(member: GuildMember) {
    try {
      console.log('Adding server profile for user', member.user.tag, 'to guild', member.guild.name);

      // Create or get global profile
      await getOrCreateGlobalProfile(member.id);

      // Create or get server profile
      await getOrCreateServerProfile(member.id, member.guild.id);

      logger.info(`Created/updated profiles for user ${member.user.tag} in guild ${member.guild.name}`);
    } catch (error) {
      logger.error(`Error creating/updating profiles for user ${member.user.tag}:`, error);
    }
  },
};