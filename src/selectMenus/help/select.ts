import { StringSelectMenuInteraction, EmbedBuilder } from 'discord.js';
import { CustomClient } from '../../types/customClient';

module.exports = {
  name: 'help:select',
  async execute(interaction: StringSelectMenuInteraction) {
    const client = interaction.client as CustomClient;
    const commandName = interaction.values[0];
    const command = client.commands.get(commandName);

    if (!command) {
      await interaction.reply({ content: 'Command not found', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Command: ${command.data.name}`)
      .setDescription(command.data.description);

    await interaction.update({ embeds: [embed] });
  },
};