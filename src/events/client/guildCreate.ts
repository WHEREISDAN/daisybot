import { Guild } from 'discord.js';
import { logger } from '../../utils/logger';
import prisma from '../../utils/database';

module.exports = {
  name: 'guildCreate',
  async execute(guild: Guild) {
    try {
      await prisma.guild.create({
        data: {
          id: guild.id,
          name: guild.name,
        },
      });
      logger.info(`Bot joined a new guild: ${guild.name}`);
    } catch (error) {
      logger.error('Error saving guild to database:', error);
    }
  },
};