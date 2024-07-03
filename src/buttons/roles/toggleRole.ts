import { ButtonInteraction, GuildMember, Role } from 'discord.js';
import { Button } from '../../types/button';
import { logger } from '../../utils/logger';

export const button: Button = {
  data: {
    name: 'toggleRole',
  },
  async execute(interaction: ButtonInteraction, args: string[]) {
    if (!interaction.guild) {
      await interaction.reply({ content: 'This button can only be used in a server.', ephemeral: true });
      return;
    }

    const [roleId] = args;
    const role = await interaction.guild.roles.fetch(roleId);

    if (!role) {
      await interaction.reply({ content: 'The role associated with this button no longer exists.', ephemeral: true });
      return;
    }

    const member = interaction.member as GuildMember;

    try {
      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role);
        await interaction.reply({ content: `Removed the ${role.name} role.`, ephemeral: true });
      } else {
        await member.roles.add(role);
        await interaction.reply({ content: `Added the ${role.name} role.`, ephemeral: true });
      }
    } catch (error) {
      logger.error(`Error toggling role for ${member.user.tag}:`, error);
      await interaction.reply({ content: 'An error occurred while managing your role.', ephemeral: true });
    }
  },
};