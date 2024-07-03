import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Role } from 'discord.js';
import { giveawayManager } from '../../utils/giveawayManager';
import { logger } from '../../utils/logger';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Start a giveaway')
    .addStringOption(option => 
      option.setName('prize')
        .setDescription('What you\'re giving away')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('description')
        .setDescription('Description of the giveaway')
        .setRequired(true))
    .addIntegerOption(option => 
      option.setName('duration')
        .setDescription('How long the giveaway will last (in minutes)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10080)) // Max 1 week
    .addRoleOption(option => 
      option.setName('winner_role')
        .setDescription('Role to assign to the winner (optional)')
        .setRequired(false)),
  category: 'Utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const prize = interaction.options.getString('prize', true);
    const description = interaction.options.getString('description', true);
    const duration = interaction.options.getInteger('duration', true);
    const winnerRole = interaction.options.getRole('winner_role') as Role | null;

    const giveawayEmbed = new EmbedBuilder()
      .setColor('#FF69B4')
      .setTitle(`🎉 Giveaway: ${prize}`)
      .setDescription(description)
      .addFields(
        { name: 'Duration', value: `${duration} minutes` },
        { name: 'Winner Role', value: winnerRole ? winnerRole.name : 'No role assigned' },
        { name: 'Hosted by', value: interaction.user.toString() }
      )
      .setFooter({ text: 'Click the button below to enter!' })
      .setTimestamp();  //test

    const button = new ButtonBuilder()
      .setCustomId('enterGiveaway')
      .setLabel('Enter Giveaway')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🎉');

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    const giveawayMessage = await interaction.channel?.send({
      embeds: [giveawayEmbed],
      components: [row]
    });

    if (giveawayMessage) {
      giveawayManager.createGiveaway(
        giveawayMessage.id,
        interaction.channelId,
        prize,
        description,
        duration,
        interaction.user.id,
        winnerRole || undefined
      );

      await interaction.reply({ content: `Giveaway started! It will end in ${duration} minutes.`, ephemeral: true });

      // Schedule giveaway end
      setTimeout(async () => {
        const { embed: resultsEmbed, winner } = await giveawayManager.endGiveaway(giveawayMessage.id);
        await giveawayMessage.edit({ embeds: [resultsEmbed], components: [] });

        if (winner && winnerRole) {
          const guild = interaction.guild;
          const winnerMember = await guild?.members.fetch(winner);
          if (winnerMember) {
            try {
              await winnerMember.roles.add(winnerRole);
              await interaction.channel?.send(`Congratulations <@${winner}>! You've won the giveaway and received the ${winnerRole.name} role!`);
            } catch (error) {
              logger.error(`Failed to assign role to giveaway winner: ${error}`);
              await interaction.channel?.send(`Congratulations <@${winner}>! You've won the giveaway, but I couldn't assign the ${winnerRole.name} role. Please contact an administrator.`);
            }
          }
        } else if (winner) {
          await interaction.channel?.send(`Congratulations <@${winner}>! You've won the giveaway!`);
        }
      }, duration * 60000);
    } else {
      await interaction.reply({ content: 'Failed to start the giveaway.', ephemeral: true });
    }
  },
};