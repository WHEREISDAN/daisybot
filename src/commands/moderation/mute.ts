import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { addInfraction } from '../../utils/database';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute (timeout) a user')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to mute')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration of the mute in minutes (max 28 days)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320)) // 28 days in minutes
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the mute')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  category: 'Moderation',
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember('user');
    const duration = interaction.options.getInteger('duration', true);
    const reason = interaction.options.getString('reason', true);

    if (!target) {
      return await interaction.reply({ content: 'Unable to find that user.', ephemeral: true });
    }

    if (!target || !('moderatable' in target) || !target.moderatable) {
      return await interaction.reply({ content: 'I cannot mute this user. They may have higher permissions than me.', ephemeral: true });
    }

    try {
      // Add the mute to the database
      await addInfraction(target.id, 'mutes');

      // Mute (timeout) the user
      await target.timeout(duration * 60 * 1000, reason);

      // Create an embed for the mute
      const muteEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('User Muted')
        .setDescription(`${target} has been muted.`)
        .addFields(
          { name: 'Reason', value: reason },
          { name: 'Duration', value: `${duration} minutes` },
          { name: 'Muted by', value: interaction.user.tag }
        )
        .setTimestamp();

      // Send the embed to the channel
      await interaction.reply({ embeds: [muteEmbed] });

      // Optionally, send a DM to the muted user
      try {
        await target.send(`You have been muted in ${interaction.guild!.name} for ${duration} minutes. Reason: ${reason}`);
      } catch (error) {
        console.error('Failed to send DM to muted user:', error);
        await interaction.followUp({ content: 'User muted, but unable to DM them.', ephemeral: true });
      }
    } catch (error) {
      console.error('Error muting user:', error);
      await interaction.reply({ content: 'There was an error trying to mute the user.', ephemeral: true });
    }
  },
};