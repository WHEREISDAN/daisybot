import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { addInfraction } from '../../utils/database';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issue a warning to a user')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  category: 'Moderation',
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);

    try {
      // Add the warning to the database
      await addInfraction(target.id, 'warns');

      // Create an embed for the warning
      const warnEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('Warning Issued')
        .setDescription(`${target} has been warned.`)
        .addFields(
          { name: 'Reason', value: reason },
          { name: 'Warned by', value: interaction.user.tag }
        )
        .setTimestamp();

      // Send the embed to the channel
      await interaction.reply({ embeds: [warnEmbed] });

      // Optionally, send a DM to the warned user
      try {
        await target.send(`You have been warned in ${interaction.guild!.name} for: ${reason}`);
      } catch (error) {
        console.error('Failed to send DM to warned user:', error);
        await interaction.followUp({ content: 'Warning issued, but unable to DM the user.', ephemeral: true });
      }
    } catch (error) {
      console.error('Error issuing warning:', error);
      await interaction.reply({ content: 'There was an error trying to issue the warning.', ephemeral: true });
    }
  },
};