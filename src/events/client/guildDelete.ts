import { Guild } from 'discord.js';
import { logger } from '../../utils/logger';
import prisma from '../../utils/database';

module.exports = {
  name: 'guildDelete',
  async execute(guild: Guild) {
    try {
      await prisma.guild.delete({
        where: {
          id: guild.id,
        },
      });
      logger.warn(`Bot left a guild: ${guild.name}`);
    } catch (error) {
      logger.error('Error removing guild from database:', error);
    }
  },
};