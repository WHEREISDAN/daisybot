import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import moment from 'moment-timezone';

// Define a list of common timezones
const commonTimezones = [
  { name: 'New York (EST/EDT)', value: 'America/New_York' },
  { name: 'Los Angeles (PST/PDT)', value: 'America/Los_Angeles' },
  { name: 'London (GMT/BST)', value: 'Europe/London' },
  { name: 'Paris (CET/CEST)', value: 'Europe/Paris' },
  { name: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { name: 'Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
  { name: 'Dubai (GST)', value: 'Asia/Dubai' },
  { name: 'Moscow (MSK)', value: 'Europe/Moscow' },
  { name: 'Singapore (SGT)', value: 'Asia/Singapore' },
  { name: 'São Paulo (BRT/BRST)', value: 'America/Sao_Paulo' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timezone')
    .setDescription('Get the current time in a specific timezone')
    .addStringOption(option =>
      option.setName('zone')
        .setDescription('Choose a timezone')
        .setRequired(true)
        .addChoices(...commonTimezones)
    ),
  category: 'Utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const zone = interaction.options.getString('zone', true);
    const time = moment().tz(zone);
    const offset = time.format('Z');
    const abbreviation = time.zoneAbbr();

    const embed = new EmbedBuilder()
      .setColor('#FF1493')  // Deep Pink
      .setTitle(`🕰️ Time in ${zone}`)
      .addFields(
        { name: 'Current Time', value: time.format('YYYY-MM-DD HH:mm:ss'), inline: false },
        { name: 'Day of Week', value: time.format('dddd'), inline: true },
        { name: 'UTC Offset', value: offset, inline: true },
        { name: 'Abbreviation', value: abbreviation, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Timezone information provided by moment-timezone' });

    await interaction.reply({ embeds: [embed] });
  },
};