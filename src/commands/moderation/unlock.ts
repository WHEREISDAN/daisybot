import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel, ChannelType } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a channel to allow members to send messages')
    .addChannelOption(option => 
      option.setName('channel')
        .setDescription('The channel to unlock (defaults to current channel)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for unlocking the channel')
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
        SendMessages: null
      });
      
      await channel.send(`🔓 This channel has been unlocked by ${interaction.user}. Reason: ${reason}`);
      await interaction.reply({ content: `Successfully unlocked ${channel}.`, ephemeral: true });
    } catch (error) {
      console.error('Error unlocking channel:', error);
      await interaction.reply({ content: 'There was an error trying to unlock the channel.', ephemeral: true });
    }
  },
};