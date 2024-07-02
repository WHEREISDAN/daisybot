import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType, ButtonComponent } from 'discord.js';
import prisma from '../../utils/database';
import { logger } from '../../utils/logger';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reaction')
    .setDescription('Manage reaction role messages')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new reaction role message')
        .addChannelOption(option => 
          option.setName('channel')
            .setDescription('The channel to send the reaction role message')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('title')
            .setDescription('Title of the reaction role message')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Description of the reaction role message')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('addrole')
        .setDescription('Add a role to an existing reaction role message')
        .addStringOption(option =>
          option.setName('message_id')
            .setDescription('The ID of the reaction role message')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('The role to assign')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Description of the role')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('emoji')
            .setDescription('Emoji for the role button')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('removerole')
        .setDescription('Remove a role from an existing reaction role message')
        .addStringOption(option =>
          option.setName('message_id')
            .setDescription('The ID of the reaction role message')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('The role to remove')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Delete a reaction role message')
        .addStringOption(option =>
          option.setName('message_id')
            .setDescription('The ID of the reaction role message to delete')
            .setRequired(true))),
  category: 'Admin',
  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'create':
        await createReactionRoleMessage(interaction);
        break;
      case 'addrole':
        await addRoleToMessage(interaction);
        break;
      case 'removerole':
        await removeRoleFromMessage(interaction);
        break;
      case 'delete':
        await deleteReactionRoleMessage(interaction);
        break;
    }
  },
};

async function createReactionRoleMessage(interaction: ChatInputCommandInteraction) {
  const channel = interaction.options.getChannel('channel') as TextChannel;
  const title = interaction.options.getString('title', true);
  const description = interaction.options.getString('description', true);

  if (!channel.isTextBased()) {
    await interaction.reply({ content: 'Please select a text channel.', ephemeral: true });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor('#FF69B4')
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: 'DAISY Bot | https://daisybot.xyz' });

  const message = await channel.send({ embeds: [embed], components: [] });

  await interaction.reply({ content: `Reaction role message created in ${channel}. Use \`/reaction addrole\` to add roles.`, ephemeral: true });
  logger.info(`Reaction role message created in guild ${interaction.guildId} by ${interaction.user.tag}`);
}

async function addRoleToMessage(interaction: ChatInputCommandInteraction) {
  const messageId = interaction.options.getString('message_id', true);
  const role = interaction.options.getRole('role', true);
  const description = interaction.options.getString('description', true);
  const emoji = interaction.options.getString('emoji', true);

  const channel = interaction.channel as TextChannel;
  const message = await channel.messages.fetch(messageId).catch(() => null);

  if (!message) {
    await interaction.reply({ content: 'Message not found in this channel.', ephemeral: true });
    return;
  }

  const embed = EmbedBuilder.from(message.embeds[0]);
//   embed.addFields({ name: role.name, value: `${emoji} ${description}`, inline: true });

  const newButton = new ButtonBuilder()
    .setCustomId(`role_${role.id}`)
    .setLabel(role.name)
    .setEmoji(emoji)
    .setStyle(ButtonStyle.Primary);

  let actionRow = new ActionRowBuilder<ButtonBuilder>();
  
  if (message.components.length > 0) {
    const existingButtons = message.components[0].components
      .filter(component => component.type === ComponentType.Button)
      .map(component => {
        const button = component as ButtonComponent;
        return ButtonBuilder.from(button);
      });
    actionRow.addComponents(existingButtons);
  }
  
  actionRow.addComponents(newButton);

  await message.edit({ embeds: [embed], components: [actionRow] });

  await prisma.reactionRole.create({
    data: {
      guildId: interaction.guildId!,
      messageId: message.id,
      roleId: role.id,
      emoji: emoji,
    },
  });

  await interaction.reply({ content: `Added ${role.name} to the reaction role message.`, ephemeral: true });
  logger.info(`Role ${role.name} added to reaction role message in guild ${interaction.guildId} by ${interaction.user.tag}`);
}

async function removeRoleFromMessage(interaction: ChatInputCommandInteraction) {
  const messageId = interaction.options.getString('message_id', true);
  const role = interaction.options.getRole('role', true);

  const channel = interaction.channel as TextChannel;
  const message = await channel.messages.fetch(messageId).catch(() => null);

  if (!message) {
    await interaction.reply({ content: 'Message not found in this channel.', ephemeral: true });
    return;
  }

  const embed = EmbedBuilder.from(message.embeds[0]);
  embed.spliceFields(embed.data.fields?.findIndex(field => field.name === role.name) ?? -1, 1);

  let actionRow = new ActionRowBuilder<ButtonBuilder>();
  
  if (message.components.length > 0) {
    const existingButtons = message.components[0].components
      .filter(component => component.type === ComponentType.Button && component.customId !== `role_${role.id}`)
      .map(component => {
        const button = component as ButtonComponent;
        return ButtonBuilder.from(button);
      });
    actionRow.addComponents(existingButtons);
  }

  await message.edit({ embeds: [embed], components: [actionRow] });

  await prisma.reactionRole.deleteMany({
    where: {
      messageId: message.id,
      roleId: role.id,
    },
  });

  await interaction.reply({ content: `Removed ${role.name} from the reaction role message.`, ephemeral: true });
  logger.info(`Role ${role.name} removed from reaction role message in guild ${interaction.guildId} by ${interaction.user.tag}`);
}

async function deleteReactionRoleMessage(interaction: ChatInputCommandInteraction) {
  const messageId = interaction.options.getString('message_id', true);

  const channel = interaction.channel as TextChannel;
  const message = await channel.messages.fetch(messageId).catch(() => null);

  if (!message) {
    await interaction.reply({ content: 'Message not found in this channel.', ephemeral: true });
    return;
  }

  await message.delete();

  await prisma.reactionRole.deleteMany({
    where: {
      messageId: messageId,
    },
  });

  await interaction.reply({ content: 'Reaction role message deleted.', ephemeral: true });
  logger.info(`Reaction role message deleted in guild ${interaction.guildId} by ${interaction.user.tag}`);
}