import { Events, GuildMember } from 'discord.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

module.exports = {
  name: 'guildMemberRemove', // Ensure this matches the event name
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

      console.log(`Removed server profile for user ${member.user.tag} from guild ${member.guild.name}`);
    } catch (error) {
      console.error(`Error removing server profile for user ${member.user.tag}:`, error);
    }
  },
};