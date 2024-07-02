import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { getAutoModConfig, updateAutoModConfig } from '../../utils/database';
import { AutoModConfig } from '../../types/autoMod';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Configure Auto Mod settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('toggle')
                .setDescription('Enable or disable Auto Mod')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable or disable Auto Mod')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('profanity')
                .setDescription('Configure profanity filter')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable or disable profanity filter')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('words')
                        .setDescription('Comma-separated list of words to filter')
                        .setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('spam')
                .setDescription('Configure spam detection')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable or disable spam detection')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('max_messages')
                        .setDescription('Maximum messages per minute')
                        .setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('invitelinks')
                .setDescription('Configure invite link detection')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable or disable invite link detection')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('allowed_invites')
                        .setDescription('Comma-separated list of allowed invite codes')
                        .setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('caps')
                .setDescription('Configure excessive caps detection')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable or disable excessive caps detection')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('max_percentage')
                        .setDescription('Maximum percentage of capital letters allowed')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(100))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('mentions')
                .setDescription('Configure mention spam prevention')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable or disable mention spam prevention')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('max_mentions')
                        .setDescription('Maximum number of mentions allowed per message')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(50))
        )
    // Add more subcommands for other Auto Mod features
    ,
    category: 'Moderation',
    async execute(interaction: ChatInputCommandInteraction) {
        const guildId = interaction.guildId;
        if (!guildId) {
            await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        const config = await getAutoModConfig(guildId) || {} as AutoModConfig;

        switch (subcommand) {
            case 'toggle':
                const enabled = interaction.options.getBoolean('enabled', true);
                await updateAutoModConfig(guildId, { enabled });
                await interaction.reply(`Auto Mod has been ${enabled ? 'enabled' : 'disabled'}.`);
                break;
            case 'profanity':
                const profanityEnabled = interaction.options.getBoolean('enabled', true);
                const words = interaction.options.getString('words');
                const profanityWordList = words ? words.split(',').map(word => word.trim()) : config.profanityWordList;
                await updateAutoModConfig(guildId, {
                    profanityFilterEnabled: profanityEnabled,
                    profanityWordList
                });
                await interaction.reply(`Profanity filter has been ${profanityEnabled ? 'enabled' : 'disabled'}.`);
                break;
            case 'spam':
                const spamEnabled = interaction.options.getBoolean('enabled', true);
                const maxMessages = interaction.options.getInteger('max_messages') || config.maxMessagesPerMinute;
                await updateAutoModConfig(guildId, {
                    spamDetectionEnabled: spamEnabled,
                    maxMessagesPerMinute: maxMessages
                });
                await interaction.reply(`Spam detection has been ${spamEnabled ? 'enabled' : 'disabled'}. Max messages per minute: ${maxMessages}`);
                break;
            case 'invitelinks':
                const inviteLinksEnabled = interaction.options.getBoolean('enabled', true);
                const allowedInvites = interaction.options.getString('allowed_invites');
                const inviteList = allowedInvites ? allowedInvites.split(',').map(invite => invite.trim()) : config.allowedInvites;
                await updateAutoModConfig(guildId, {
                    inviteLinkDetectionEnabled: inviteLinksEnabled,
                    allowedInvites: inviteList
                });
                await interaction.reply(`Invite link detection has been ${inviteLinksEnabled ? 'enabled' : 'disabled'}.`);
                break;
            case 'caps':
                const capsEnabled = interaction.options.getBoolean('enabled', true);
                const maxCapsPercentage = interaction.options.getInteger('max_percentage') || config.maxCapsPercentage;
                await updateAutoModConfig(guildId, {
                    capsDetectionEnabled: capsEnabled,
                    maxCapsPercentage
                });
                await interaction.reply(`Excessive caps detection has been ${capsEnabled ? 'enabled' : 'disabled'}. Max caps percentage: ${maxCapsPercentage}%`);
                break;
            case 'mentions':
                const mentionsEnabled = interaction.options.getBoolean('enabled', true);
                const maxMentions = interaction.options.getInteger('max_mentions') || config.maxMentionsPerMessage;
                await updateAutoModConfig(guildId, {
                    mentionLimitEnabled: mentionsEnabled,
                    maxMentionsPerMessage: maxMentions
                });
                await interaction.reply(`Mention spam prevention has been ${mentionsEnabled ? 'enabled' : 'disabled'}. Max mentions per message: ${maxMentions}`);
                break;
            // Add more cases for other subcommands
            default:
                await interaction.reply({ content: 'Invalid subcommand.', ephemeral: true });
        }
    },
};