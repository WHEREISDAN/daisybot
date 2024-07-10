import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, ChannelType, Client } from 'discord.js';
import { TwitchManager } from '../../utils/twitchManager';
import { getTwitchNotifyChannel, setTwitchNotifyChannel } from '../../utils/database';
import { logger } from '../../utils/logger';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('twitch')
    .setDescription('Manage Twitch streamers and notifications')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a Twitch streamer to notify when they go live')
        .addStringOption(option => 
          option.setName('username')
            .setDescription('The Twitch username to add')
            .setRequired(true))
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('The channel to send notifications to (optional, uses default if not specified)')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Remove a Twitch streamer from notifications')
        .addStringOption(option => 
          option.setName('username')
            .setDescription('The Twitch username to remove')
            .setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('setchannel')
        .setDescription('Set the default channel for Twitch notifications')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('The channel to send notifications to')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  category: 'Twitch',
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) {
      await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
      return;
    }

    const twitchManager = new TwitchManager(
      undefined as unknown as Client,
      process.env.TWITCH_CLIENT_ID!,
      process.env.TWITCH_CLIENT_SECRET!
    );

    const subcommand = interaction.options.getSubcommand();

    try {
      switch (subcommand) {
        case 'add':
          await handleAddStreamer(interaction, twitchManager);
          break;
        case 'delete':
          await handleDeleteStreamer(interaction, twitchManager);
          break;
        case 'setchannel':
          await handleSetChannel(interaction);
          break;
        default:
          await interaction.reply({ content: 'Unknown subcommand.', ephemeral: true });
      }
    } catch (error) {
      logger.error(`Error in Twitch command (${subcommand}):`, error);
      await interaction.reply({ content: `There was an error processing your request. Please try again later.`, ephemeral: true });
    }
  },
};

async function handleAddStreamer(interaction: ChatInputCommandInteraction, twitchManager: TwitchManager) {
  logger.debug('Entering handleAddStreamer');
  const username = interaction.options.getString('username', true);
  let channelId = interaction.options.getChannel('channel')?.id;

  logger.debug(`Username: ${username}, Channel ID: ${channelId}`);

  if (!channelId) {
    channelId = await getTwitchNotifyChannel(interaction.guildId!) || '';
    logger.debug(`Retrieved default channel ID: ${channelId}`);
    if (!channelId) {
      await interaction.reply({ content: 'No default notification channel set. Please specify a channel or set a default with `/twitch setchannel`.', ephemeral: true });
      return;
    }
  }

  try {
    logger.debug('Calling twitchManager.addStreamer');
    await twitchManager.addStreamer(interaction.guildId!, username, channelId);
    const channel = await interaction.guild!.channels.fetch(channelId);
    await interaction.reply(`Successfully added Twitch streamer ${username}. Notifications will be sent to ${channel}.`);
    // logger.info(`Added Twitch streamer ${username} for guild ${interaction.guildId}`);
  } catch (error) {
    logger.error(`Error adding Twitch streamer ${username}:`, error);
    await interaction.reply({ content: 'There was an error adding the Twitch streamer. Please try again later.', ephemeral: true });
  }
}

async function handleDeleteStreamer(interaction: ChatInputCommandInteraction, twitchManager: TwitchManager) {
  const username = interaction.options.getString('username', true);
  try {
    await twitchManager.removeStreamer(interaction.guildId!, username);
    await interaction.reply(`Successfully removed Twitch streamer ${username} from notifications.`);
    logger.info(`Removed Twitch streamer ${username} for guild ${interaction.guildId}`);
  } catch (error) {
    logger.error(`Error removing Twitch streamer ${username}:`, error);
    await interaction.reply({ content: 'There was an error removing the Twitch streamer. Please try again later.', ephemeral: true });
  }
}

async function handleSetChannel(interaction: ChatInputCommandInteraction) {
  const channel = interaction.options.getChannel('channel', true);
  if (channel.type !== ChannelType.GuildText) {
    await interaction.reply({ content: 'Please select a text channel for notifications.', ephemeral: true });
    return;
  }

  try {
    await setTwitchNotifyChannel(interaction.guildId!, channel.id);
    await interaction.reply(`Successfully set ${channel} as the default Twitch notification channel.`);
    logger.info(`Set default Twitch notification channel for guild ${interaction.guildId} to ${channel.id}`);
  } catch (error) {
    logger.error(`Error setting default Twitch notification channel:`, error);
    await interaction.reply({ content: 'There was an error setting the default channel. Please try again later.', ephemeral: true });
  }
}