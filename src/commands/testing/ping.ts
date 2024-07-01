import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  category: 'Utility', // Add the category property
  async execute(interaction: CommandInteraction) {
    await interaction.reply('Pong!');
  },
};