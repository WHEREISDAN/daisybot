import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, version as discordJSVersion } from 'discord.js';
import { version as tsVersion } from 'typescript';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Displays bot statistics'),
  category: 'Utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client;

    // Calculate uptime
    const uptime = process.uptime();
    const uptimeString = `${Math.floor(uptime / 86400)}d ${Math.floor(uptime / 3600) % 24}h ${Math.floor(uptime / 60) % 60}m ${Math.floor(uptime % 60)}s`;

    // Get memory usage
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

    const embed = new EmbedBuilder()
      .setColor('#FF69B4')  // Hot Pink
      .setTitle('📊 Bot Statistics')
      .addFields(
        { name: 'Servers', value: client.guilds.cache.size.toString(), inline: true },
        { name: 'Users', value: client.users.cache.size.toString(), inline: true },
        { name: 'Channels', value: client.channels.cache.size.toString(), inline: true },
        { name: 'Uptime', value: uptimeString, inline: true },
        { name: 'Memory Usage', value: `${memoryUsage.toFixed(2)} MB`, inline: true },
        { name: 'Discord.js Version', value: discordJSVersion, inline: true },
        { name: 'Node.js Version', value: process.version, inline: true },
        { name: 'TypeScript Version', value: tsVersion, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

    await interaction.reply({ embeds: [embed] });
  },
};