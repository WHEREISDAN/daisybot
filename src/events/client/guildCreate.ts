import { Guild } from 'discord.js';
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
      console.log(`Bot joined a new guild: ${guild.name}`);
    } catch (error) {
      console.error('Error saving guild to database:', error);
    }
  },
};