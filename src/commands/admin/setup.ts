import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel, ChannelType } from 'discord.js';
import { setWelcomeChannel } from '../../utils/database';
import prisma from '../../utils/database';
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
    // Add more subcommands here for other configurations
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  category: 'Admin',
  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'welcomechannel':
        await setupWelcomeChannel(interaction);
        break;
      case 'prefix':
        await setupPrefix(interaction);
        break;
      // Add more cases here for other configurations
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
      await setWelcomeChannel(interaction.guildId!, channel.id, interaction.guild!.name);
  
      await interaction.reply({ content: `Welcome channel has been set to ${channel}.`, ephemeral: true });
      logger.info(`Welcome channel set to ${channel.id} in guild ${interaction.guildId}`);
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

    await interaction.reply({ content: `Bot prefix has been set to "${newPrefix}".`, ephemeral: true });
    logger.info(`Prefix set to "${newPrefix}" in guild ${interaction.guildId}`);
  } catch (error) {
    logger.error('Error setting prefix:', error);
    await interaction.reply({ content: 'There was an error setting the prefix.', ephemeral: true });
  }
}