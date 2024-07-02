import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, PermissionFlagsBits } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to kick')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('reason')
        .setDescription('The reason for kicking'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  category: 'Moderation',
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      return await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
    }

    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';

    if (!target || !(target instanceof GuildMember)) {
      return await interaction.reply({ content: 'Please specify a valid user to kick.', ephemeral: true });
    }

    if (!target.kickable) {
      return await interaction.reply({ content: 'I cannot kick this user. They may have higher permissions than me.', ephemeral: true });
    }

    try {
      await target.kick(reason);
      await interaction.reply(`Successfully kicked ${target.user.tag} for reason: ${reason}`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};