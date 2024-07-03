import { ButtonInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Button } from '../../types/button';
import { generateHelpEmbed } from '../../utils/helpUtils';
import { CustomClient } from '../../types/customClient';

export const button: Button = {
  data: {
    name: 'helpPrev',
  },
  async execute(interaction: ButtonInteraction, args: string[]) {
    const client = interaction.client as CustomClient;
    const [totalPages] = args.map(Number);
    let currentPage = Number(interaction.message.embeds[0].footer?.text.split(' ')[1]) - 1;
    currentPage = Math.max(0, currentPage - 1);

    const embed = generateHelpEmbed(client, currentPage);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`helpPrev:${totalPages}`)
          .setLabel('◀ Previous')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId(`helpNext:${totalPages}`)
          .setLabel('Next ▶')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === totalPages - 1)
      );

    await interaction.update({ embeds: [embed], components: [row] });
  },
};