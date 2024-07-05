import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { getOrCreateLogConfig } from '../../utils/database';
import { logger } from '../../utils/logger';
import { LogConfig } from '../../types/logConfig';

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const logOptions = [
  'warns', 'messageDelete', 'messageUpdate', 'messageBulkDelete',
  'messageReactionAdd', 'messageReactionRemove', 'messageReactionRemoveAll',
  'messageReactionRemoveEmoji', 'channelCreate', 'channelDelete', 'channelUpdate',
  'channelPinsUpdate', 'guildMemberAdd', 'guildMemberRemove', 'guildMemberUpdate',
  'guildBanAdd', 'guildBanRemove', 'guildRoleCreate', 'guildRoleDelete',
  'guildRoleUpdate', 'guildEmojisUpdate', 'guildInviteCreate', 'guildInviteDelete',
  'guildWebhooksUpdate', 'guildUpdate'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('log')
    .setDescription('Configure logging preferences')
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Set logging preferences')
        .addStringOption(option =>
          option.setName('event')
            .setDescription('The event to configure')
            .setRequired(true)
            .addChoices(...logOptions.map(opt => ({ name: opt, value: opt }))))
        .addBooleanOption(option =>
          option.setName('enabled')
            .setDescription('Enable or disable logging for this event')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('View current logging preferences'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  category: 'Admin',
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) {
      await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'set') {
      const event = interaction.options.getString('event', true) as keyof Omit<LogConfig, 'id' | 'guildId'>;
      const enabled = interaction.options.getBoolean('enabled', true);

      try {
        const logConfig = await getOrCreateLogConfig(interaction.guildId);
        if (!logConfig) {
          await interaction.reply({ content: 'Failed to retrieve or create log configuration.', ephemeral: true });
          return;
        }

        await prisma.logConfig.update({
          where: { guildId: interaction.guildId },
          data: { [event]: enabled },
        });

        await interaction.reply({ content: `Logging for ${event} has been ${enabled ? 'enabled' : 'disabled'}.`, ephemeral: true });
        logger.info(`Updated log config for guild ${interaction.guildId}: ${event} set to ${enabled}`);
      } catch (error) {
        logger.error('Error updating log config:', error);
        await interaction.reply({ content: 'There was an error updating the logging configuration.', ephemeral: true });
      }
    } else if (subcommand === 'view') {
      try {
        const logConfig = await getOrCreateLogConfig(interaction.guildId);

        if (!logConfig) {
          await interaction.reply({ content: 'Failed to retrieve log configuration.', ephemeral: true });
          return;
        }

        const configList = logOptions
          .map(option => `${option}: ${logConfig[option as keyof Omit<LogConfig, 'id' | 'guildId'>] ? 'Enabled' : 'Disabled'}`)
          .join('\n');

        await interaction.reply({ content: `Current logging configuration:\n\`\`\`\n${configList}\n\`\`\``, ephemeral: true });
      } catch (error) {
        logger.error('Error fetching log config:', error);
        await interaction.reply({ content: 'There was an error fetching the logging configuration.', ephemeral: true });
      }
    }
  },
};