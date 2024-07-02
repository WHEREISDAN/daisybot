import { GuildMember } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

module.exports = {
  name: 'guildMemberRemove',
  async execute(member: GuildMember) {
    try {
      // Remove server profile
      console.log('Removing server profile for user', member.user.tag, 'from guild', member.guild.name);
      await prisma.serverProfile.delete({
        where: {
          userId_guildId: {
            userId: member.id,
            guildId: member.guild.id,
          },
        },
      });

      logger.info(`Removed server profile for user ${member.user.tag} from guild ${member.guild.name}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid `prisma.serverProfile.delete()`')) {
        logger.info(`Server profile for user ${member.user.tag} not found in guild ${member.guild.name}`);
      } else {
        logger.error(`Error removing server profile for user ${member.user.tag}:`, error);
      }
    }
  },
};
