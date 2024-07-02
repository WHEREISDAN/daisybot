import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel, ChannelType } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel to prevent members from sending messages')
    .addChannelOption(option => 
      option.setName('channel')
        .setDescription('The channel to lock (defaults to current channel)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for locking the channel')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  category: 'Moderation',
  async execute(interaction: ChatInputCommandInteraction) {
    const channel = (interaction.options.getChannel('channel') as TextChannel) || interaction.channel;
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!(channel instanceof TextChannel)) {
      return await interaction.reply({ content: 'This command can only be used on text channels.', ephemeral: true });
    }

    try {
      await channel.permissionOverwrites.edit(interaction.guild!.roles.everyone, {
        SendMessages: false
      });
      
      await channel.send(`🔒 This channel has been locked by ${interaction.user}. Reason: ${reason}`);
      await interaction.reply({ content: `Successfully locked ${channel}.`, ephemeral: true });
    } catch (error) {
      console.error('Error locking channel:', error);
      await interaction.reply({ content: 'There was an error trying to lock the channel.', ephemeral: true });
    }
  },
};