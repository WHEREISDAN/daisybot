import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, PermissionFlagsBits } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to ban')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('reason')
        .setDescription('The reason for banning'))
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Number of days of messages to delete')
        .setMinValue(0)
        .setMaxValue(7))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  category: 'Moderation',
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      return await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
    }

    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    const days = interaction.options.getInteger('days') ?? 0;

    if (!target) {
      return await interaction.reply({ content: 'Please specify a valid user to ban.', ephemeral: true });
    }

    if (!(target instanceof GuildMember)) {
      return await interaction.reply({ content: 'The specified user is not a member of this server.', ephemeral: true });
    }

    if (!target.bannable) {
      return await interaction.reply({ content: 'I cannot ban this user. They may have higher permissions than me.', ephemeral: true });
    }

    try {
      await interaction.guild.members.ban(target, { deleteMessageDays: days, reason: reason });
      await interaction.reply(`Successfully banned ${target.user.tag} for reason: ${reason}. Deleted messages from the past ${days} days.`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};