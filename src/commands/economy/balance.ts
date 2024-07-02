import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { getCurrency } from '../../utils/database';
import { generateBalanceImage } from '../../utils/imageGenerator';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your current balance'),
  category: 'Economy',
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const balance = await getCurrency(interaction.user.id);
      const balanceImage = await generateBalanceImage(
        interaction.user.username,
        interaction.user.displayAvatarURL({ extension: 'png', size: 256 }),
        balance
      );
      const attachment = new AttachmentBuilder(balanceImage, { name: 'balance.png' });
      
      await interaction.reply({ files: [attachment] });
    } catch (error) {
      console.error('Error in balance command:', error);
      await interaction.reply({ content: 'There was an error while checking your balance.', ephemeral: true });
    }
  },
};