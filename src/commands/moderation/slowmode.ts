import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel, CategoryChannel, ChannelType, Collection } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode for a channel or category')
    .addIntegerOption(option =>
      option.setName('delay')
        .setDescription('Slowmode delay in seconds (0-21600)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel or category to set slowmode (current channel if not specified)')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildCategory)
    )
    .addBooleanOption(option =>
      option.setName('global')
        .setDescription('Set slowmode for all text channels in the server')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  category: 'Moderation',
  async execute(interaction: ChatInputCommandInteraction) {
    const delay = interaction.options.getInteger('delay', true);
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const global = interaction.options.getBoolean('global') || false;

    if (!(channel instanceof TextChannel) && !(channel instanceof CategoryChannel)) {
      await interaction.reply({ content: 'Invalid channel type. Please specify a text channel or category.', ephemeral: true });
      return;
    }

    if (global) {
      await this.globalSlowmode(interaction, delay);
    } else if (channel instanceof CategoryChannel) {
      await this.categorySlowmode(interaction, channel, delay);
    } else {
      await this.channelSlowmode(interaction, channel, delay);
    }
  },

  async channelSlowmode(interaction: ChatInputCommandInteraction, channel: TextChannel, delay: number) {
    try {
      await channel.setRateLimitPerUser(delay, `Slowmode set by ${interaction.user.tag}`);
      await interaction.reply({ content: `Slowmode set to ${delay} seconds in ${channel}.`, ephemeral: true });
    } catch (error) {
      console.error('Error setting slowmode:', error);
      await interaction.reply({ content: 'An error occurred while setting slowmode.', ephemeral: true });
    }
  },

  async categorySlowmode(interaction: ChatInputCommandInteraction, category: CategoryChannel, delay: number) {
    const failed: string[] = [];
    const textChannels = category.children.cache.filter(channel => channel.type === ChannelType.GuildText) as Collection<string, TextChannel>;

    for (const channel of textChannels.values()) {
      try {
        await channel.setRateLimitPerUser(delay, `Slowmode set by ${interaction.user.tag}`);
      } catch {
        failed.push(channel.toString());
      }
    }

    if (failed.length) {
      await interaction.reply({ content: `Slowmode set in the category, but failed for these channels: ${failed.join(', ')}`, ephemeral: true });
    } else {
      await interaction.reply({ content: `Slowmode set to ${delay} seconds for all channels in the category.`, ephemeral: true });
    }
  },

  async globalSlowmode(interaction: ChatInputCommandInteraction, delay: number) {
    if (!interaction.guild) {
      await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
      return;
    }

    const failed: string[] = [];
    const textChannels = interaction.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText) as Collection<string, TextChannel>;

    if (textChannels.size > 50) {
      await interaction.reply({ content: `Setting slowmode for ${textChannels.size} channels. This may take a while...`, ephemeral: true });
    }

    for (const channel of textChannels.values()) {
      if (channel.rateLimitPerUser !== delay && channel.permissionsFor(interaction.guild.members.me!)?.has(PermissionFlagsBits.ManageChannels)) {
        try {
          await channel.setRateLimitPerUser(delay, `Global slowmode set by ${interaction.user.tag}`);
        } catch {
          failed.push(channel.toString());
        }
      }
    }

    if (failed.length) {
      await interaction.followUp({ content: `Slowmode set globally, but failed for these channels: ${failed.join(', ')}`, ephemeral: true });
    } else {
      await interaction.followUp({ content: `Slowmode set to ${delay} seconds for all channels in the server.`, ephemeral: true });
    }
  }
};