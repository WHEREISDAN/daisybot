import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CustomClient } from '../../types/customClient';
import { generateHelpEmbed } from '../../utils/helpUtils';

const COMMANDS_PER_PAGE = 5;

const helpCommand = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows a list of available commands'),
  category: 'Utility',

  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client as CustomClient;
    const commands = Array.from(client.commands.values());
    const totalPages = Math.ceil(commands.length / COMMANDS_PER_PAGE);

    const embed = generateHelpEmbed(client, 0);

    const buttonsRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`helpPrev:${totalPages}`)
          .setLabel('◀ Previous')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`helpNext:${totalPages}`)
          .setLabel('Next ▶')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(totalPages <= 1)
      );

    await interaction.reply({
      embeds: [embed],
      components: totalPages > 1 ? [buttonsRow] : [],
    });
  },
};

export default helpCommand;