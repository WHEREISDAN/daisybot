import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js';
import { pollManager } from '../../utils/pollManager';
import { logger } from '../../utils/logger';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll with multiple options')
    .addStringOption(option => 
      option.setName('question')
        .setDescription('The question for the poll')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('options')
        .setDescription('Poll options separated by commas (e.g. Option1,Option2,Option3)')
        .setRequired(true))
    .addChannelOption(option => 
      option.setName('channel')
        .setDescription('The channel to post the poll in (default: current channel)')
        .addChannelTypes(ChannelType.GuildText))
    .addIntegerOption(option => 
      option.setName('duration')
        .setDescription('Duration of the poll in minutes (default: 60 minutes)')
        .setMinValue(1)
        .setMaxValue(1440)), // Max 24 hours
  category: 'Utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const question = interaction.options.getString('question', true);
    const optionsString = interaction.options.getString('options', true);
    const channel = (interaction.options.getChannel('channel') as TextChannel) || interaction.channel as TextChannel;
    const duration = interaction.options.getInteger('duration') || 60; // Default 60 minutes

    const options = optionsString.split(',').map(option => option.trim()).filter(option => option !== '');
    if (options.length < 2 || options.length > 5) {
      await interaction.reply({ content: 'Please provide between 2 and 5 options for the poll.', ephemeral: true });
      return;
    }

    const pollEmbed = new EmbedBuilder()
      .setColor('#FF69B4')
      .setTitle(`📊 Poll: ${question}`)
      .setDescription('Click on a button to vote!')
      .setFooter({ text: `Poll created by ${interaction.user.tag}` })
      .setTimestamp();

    const buttons = options.map((option, index) => 
      new ButtonBuilder()
        .setCustomId(`poll:${index}`)
        .setLabel(option)
        .setStyle(ButtonStyle.Primary)
    );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

    const pollMessage = await channel.send({
      embeds: [pollEmbed],
      components: [row]
    });

    pollManager.createPoll(pollMessage.id, channel.id, question, options, duration, interaction.user.id);

    await interaction.reply({ content: `Poll created in ${channel}. It will end in ${duration} minutes.`, ephemeral: true });

    // Add end poll button
    const endPollButton = new ButtonBuilder()
      .setCustomId(`endPoll:${pollMessage.id}`)
      .setLabel('End Poll Early')
      .setStyle(ButtonStyle.Danger);

    await interaction.followUp({
      content: 'Use this button to end the poll early:',
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(endPollButton)],
      ephemeral: true
    });
  },
};