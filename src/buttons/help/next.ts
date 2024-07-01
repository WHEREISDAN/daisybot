import { ButtonInteraction } from 'discord.js';

export default {
  name: 'help:next',
  async execute(interaction: ButtonInteraction) {
    // The logic is now handled in the help command
    // This is just a placeholder to ensure the button is registered
    await interaction.deferUpdate();
  },
};