import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { Button } from '../../types/button';
import { giveawayManager } from '../../utils/giveawayManager';
import { logger } from '../../utils/logger';

export const button: Button = {
  data: {
    name: 'enterGiveaway',
  },
  async execute(interaction: ButtonInteraction) {
    const giveaway = giveawayManager.getGiveaway(interaction.message.id);

    if (!giveaway) {
      await interaction.reply({ content: 'This giveaway is no longer active.', ephemeral: true });
      return;
    }

    if (giveawayManager.enterGiveaway(interaction.message.id, interaction.user.id)) {
      await interaction.reply({ content: 'You have entered the giveaway!', ephemeral: true });
      logger.info(`User ${interaction.user.tag} entered giveaway ${interaction.message.id}`);

      // Update participant count in the embed
      const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .addFields({ name: 'Participants', value: giveaway.participants.size.toString() });

      await interaction.message.edit({ embeds: [updatedEmbed] });
    } else {
      await interaction.reply({ content: 'You have already entered this giveaway.', ephemeral: true });
    }
  },
};