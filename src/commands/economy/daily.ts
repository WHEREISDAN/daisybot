import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { addCurrency, getCurrency } from '../../utils/database';
import { generateDailyImage } from '../../utils/imageGenerator';

const DAILY_AMOUNT = 100; // Amount of currency to give daily
const COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const userCooldowns = new Map<string, number>();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily reward'),
  category: 'Economy',
  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const now = Date.now();
    const cooldownExpiration = userCooldowns.get(userId) ?? 0;

    if (now < cooldownExpiration) {
      const remainingTime = (cooldownExpiration - now) / 1000; // Convert to seconds
      const hours = Math.floor(remainingTime / 3600);
      const minutes = Math.floor((remainingTime % 3600) / 60);
      return interaction.reply(`You can claim your daily reward again in ${hours}h ${minutes}m.`);
    }

    try {
      const newBalance = await addCurrency(userId, DAILY_AMOUNT);
      userCooldowns.set(userId, now + COOLDOWN);

      const dailyImage = await generateDailyImage(
        interaction.user.username,
        interaction.user.displayAvatarURL({ extension: 'png', size: 256 }),
        DAILY_AMOUNT,
        newBalance
      );
      const attachment = new AttachmentBuilder(dailyImage, { name: 'daily_reward.png' });
      
      await interaction.reply({ files: [attachment] });
    } catch (error) {
      console.error('Error in daily command:', error);
      await interaction.reply({ content: 'There was an error while claiming your daily reward.', ephemeral: true });
    }
  },
};