import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server')
    .addStringOption(option => 
      option.setName('userid')
        .setDescription('The ID of the user to unban')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('reason')
        .setDescription('The reason for unbanning'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  category: 'Moderation',
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      return await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
    }

    const userId = interaction.options.getString('userid', true);
    const reason = interaction.options.getString('reason') ?? 'No reason provided';

    try {
      // Fetch ban information
      const ban = await interaction.guild.bans.fetch(userId);
      if (!ban) {
        return await interaction.reply({ content: 'This user is not banned.', ephemeral: true });
      }

      // Unban the user
      await interaction.guild.members.unban(userId, reason);
      await interaction.reply(`Successfully unbanned ${ban.user.tag} (${userId}) for reason: ${reason}`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message === 'Unknown Ban') {
        await interaction.reply({ content: 'This user is not banned or the ID is invalid.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
  },
};