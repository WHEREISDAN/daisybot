import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, OAuth2Scopes, PermissionFlagsBits } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Generates an invite link for the bot'),
  category: 'Utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client;

    // Generate the invite link
    const invite = client.generateInvite({
      scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
      permissions: [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.UseExternalEmojis,
        // Add any other permissions your bot needs
      ],
    });

    const embed = new EmbedBuilder()
      .setColor('#FFC0CB')  // Pink
      .setTitle('🤖 Invite Me to Your Server!')
      .setDescription(`Thank you for your interest in adding me to your server! Click the link below to invite me:`)
      .addFields(
        { name: 'Invite Link', value: `[Click Here to Invite](${invite})` }
      )
      .setTimestamp()
      .setFooter({ text: 'Make sure you have the necessary permissions to add bots!' });

    await interaction.reply({ embeds: [embed] });
  },
};