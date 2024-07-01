import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Displays how long the bot has been online'),
  category: 'Utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const uptime = process.uptime();
    
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor(uptime / 3600) % 24;
    const minutes = Math.floor(uptime / 60) % 60;
    const seconds = Math.floor(uptime % 60);

    const embed = new EmbedBuilder()
      .setColor('#FF1493')  // Deep Pink
      .setTitle('🕒 Bot Uptime')
      .setDescription('Here\'s how long I\'ve been online:')
      .addFields(
        { name: 'Days', value: days.toString(), inline: true },
        { name: 'Hours', value: hours.toString(), inline: true },
        { name: 'Minutes', value: minutes.toString(), inline: true },
        { name: 'Seconds', value: seconds.toString(), inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Uptime since last restart' });

    await interaction.reply({ embeds: [embed] });
  },
};