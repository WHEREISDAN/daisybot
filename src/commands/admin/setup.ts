import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel, ChannelType } from 'discord.js';
import prisma from '../../utils/database';
import { getOrCreateLogConfig } from '../../utils/database';
import { logger } from '../../utils/logger';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure various bot settings')
    .addSubcommand(subcommand =>
      subcommand
        .setName('welcome')
        .setDescription('Set the channel for welcome messages')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('The channel to send welcome messages')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('prefix')
        .setDescription('Set the bot prefix for this server')
        .addStringOption(option =>
          option.setName('prefix')
            .setDescription('The new prefix')
            .setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('logs')
        .setDescription('Set the channel for server logs')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('The channel to send logs to')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  category: 'Admin',
  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'welcome':
        await setupWelcomeChannel(interaction);
        break;
      case 'prefix':
        await setupPrefix(interaction);
        break;
      case 'logs':
        await setupLogChannel(interaction);
        break;
      default:
        await interaction.reply({ content: 'Unknown setup option', ephemeral: true });
    }
  },
};

async function setupWelcomeChannel(interaction: ChatInputCommandInteraction) {
  const channel = interaction.options.getChannel('channel') as TextChannel;

  if (!channel || channel.type !== ChannelType.GuildText) {
    return await interaction.reply({ content: 'Please provide a valid text channel.', ephemeral: true });
  }

  try {
    await prisma.guild.upsert({
      where: { id: interaction.guildId! },
      update: { welcomeChannelId: channel.id },
      create: {
        id: interaction.guildId!,
        name: interaction.guild!.name,
        welcomeChannelId: channel.id
      }
    });

    await interaction.reply(`Welcome channel has been set to ${channel}.`);
    logger.info(`Welcome channel for guild ${interaction.guildId} set to ${channel.id}`);
  } catch (error) {
    logger.error('Error setting welcome channel:', error);
    await interaction.reply({ content: 'There was an error setting the welcome channel.', ephemeral: true });
  }
}

async function setupPrefix(interaction: ChatInputCommandInteraction) {
  const newPrefix = interaction.options.getString('prefix', true);

  try {
    await prisma.guild.upsert({
      where: { id: interaction.guildId! },
      update: { prefix: newPrefix },
      create: {
        id: interaction.guildId!,
        name: interaction.guild!.name,
        prefix: newPrefix
      }
    });

    await interaction.reply(`Bot prefix has been set to "${newPrefix}".`);
    logger.info(`Prefix for guild ${interaction.guildId} set to "${newPrefix}"`);
  } catch (error) {
    logger.error('Error setting prefix:', error);
    await interaction.reply({ content: 'There was an error setting the prefix.', ephemeral: true });
  }
}

async function setupLogChannel(interaction: ChatInputCommandInteraction) {
  const channel = interaction.options.getChannel('channel') as TextChannel;

  if (!channel || channel.type !== ChannelType.GuildText) {
    return await interaction.reply({ content: 'Please provide a valid text channel.', ephemeral: true });
  }

  try {
    await prisma.guild.upsert({
      where: { id: interaction.guildId! },
      update: { logChannelId: channel.id },
      create: {
        id: interaction.guildId!,
        name: interaction.guild!.name,
        logChannelId: channel.id
      }
    });

    const logConfig = await getOrCreateLogConfig(interaction.guildId!);
    if (!logConfig) {
      await interaction.reply({ content: 'Failed to retrieve or create log configuration.', ephemeral: true });
      return;
    }

    await interaction.reply(`Log channel has been set to ${channel}.`);
    logger.info(`Log channel for guild ${interaction.guildId} set to ${channel.id}`);
  } catch (error) {
    logger.error('Error setting log channel:', error);
    await interaction.reply({ content: 'There was an error setting the log channel.', ephemeral: true });
  }
}