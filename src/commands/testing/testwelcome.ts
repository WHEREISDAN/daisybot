import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { generateWelcomeImage } from '../../utils/imageGenerator';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('testwelcome')
    .setDescription('Test the welcome image generation')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to generate the welcome image for (defaults to you)')
        .setRequired(false)),
  category: 'Utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user') || interaction.user;

    try {
      const welcomeImage = await generateWelcomeImage(
        user.username,
        user.displayAvatarURL({ extension: 'png', size: 256 })
      );

      const attachment = new AttachmentBuilder(welcomeImage, { name: 'welcome_test.png' });

      await interaction.reply({
        content: `Here's how the welcome image would look for ${user.username}:`,
        files: [attachment]
      });
    } catch (error) {
      console.error('Error generating test welcome image:', error);
      await interaction.reply({
        content: 'There was an error generating the test welcome image.',
        ephemeral: true
      });
    }
  },
};