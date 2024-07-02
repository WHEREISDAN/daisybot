import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { getXPAndLevel } from '../../utils/database';
import { generateLevelUpImage } from '../../utils/imageGenerator';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Check your current level and XP'),
  category: 'Level',
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const { xp, level, xpForNext } = await getXPAndLevel(interaction.user.id);
      const levelImage = await generateLevelUpImage(
        interaction.user.username,
        interaction.user.displayAvatarURL({ extension: 'png', size: 256 }),
        level,
        xp,
        xpForNext
      );
      const attachment = new AttachmentBuilder(levelImage, { name: 'level.png' });
      
      await interaction.reply({ files: [attachment] });
    } catch (error) {
      console.error('Error in level command:', error);
      await interaction.reply({ content: 'There was an error while checking your level.', ephemeral: true });
    }
  },
};