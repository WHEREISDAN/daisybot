import { Guild } from 'discord.js';
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
      console.log(`Bot left a guild: ${guild.name}`);
    } catch (error) {
      console.error('Error removing guild from database:', error);
    }
  },
};