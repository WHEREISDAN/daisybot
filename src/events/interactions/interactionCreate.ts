import { Interaction, ChatInputCommandInteraction, GuildMember, ButtonInteraction } from 'discord.js';
import { CustomClient } from '../../types/customClient';
import { handleSelectMenu } from '../../handlers/selectMenuHandler';
import { logger } from '../../utils/logger';
import prisma from '../../utils/database';

module.exports = {
  name: 'interactionCreate',
  async execute(interaction: Interaction) {
    const client = interaction.client as CustomClient;

    try {
      if (interaction.isChatInputCommand()) {
        await handleCommand(interaction, client);
      } else if (interaction.isButton()) {
        await handleButton(interaction, client);
      } else if (interaction.isSelectMenu()) {
        await handleSelectMenu(interaction, client);
      }
    } catch (error) {
      logger.error('Error handling interaction:', error);
      await handleInteractionError(interaction);
    }
  },
};

async function handleCommand(interaction: ChatInputCommandInteraction, client: CustomClient) {
  const command = client.commands.get(interaction.commandName);

  if (!command) {
    logger.warn(`No command matching ${interaction.commandName} was found.`);
    await interaction.reply({ content: 'Unknown command', ephemeral: true });
    return;
  }

  await command.execute(interaction);
}

async function handleButton(interaction: ButtonInteraction, client: CustomClient) {
  if (interaction.customId.startsWith('role_')) {
    await handleReactionRoleButton(interaction);
  } else {
    // Handle other button interactions
    const [buttonName, ...args] = interaction.customId.split('_');
    const button = client.buttons.get(buttonName);
    if (button) {
      await button.execute(interaction, args);
    } else {
      logger.warn(`No button handler found for ${buttonName}`);
      await interaction.reply({ content: 'This button is no longer available.', ephemeral: true });
    }
  }
}

async function handleReactionRoleButton(interaction: ButtonInteraction) {
  if (!interaction.guild || !interaction.guildId) return;

  const member = interaction.member as GuildMember;
  if (!member) return;

  const roleId = interaction.customId.split('_')[1];

  const reactionRole = await prisma.reactionRole.findUnique({
    where: {
      guildId_messageId_roleId: {
        guildId: interaction.guildId,
        messageId: interaction.message.id,
        roleId: roleId,
      },
    },
  });

  if (!reactionRole) {
    await interaction.reply({ content: 'This reaction role is no longer available.', ephemeral: true });
    return;
  }

  const role = interaction.guild.roles.cache.get(roleId);
  if (!role) {
    await interaction.reply({ content: 'This role no longer exists.', ephemeral: true });
    return;
  }

  try {
    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(role);
      await interaction.reply({ content: `Removed the ${role.name} role.`, ephemeral: true });
      logger.info(`Removed role ${role.name} from ${member.user.tag} in guild ${interaction.guildId}`);
    } else {
      await member.roles.add(role);
      await interaction.reply({ content: `Added the ${role.name} role.`, ephemeral: true });
      logger.info(`Added role ${role.name} to ${member.user.tag} in guild ${interaction.guildId}`);
    }
  } catch (error) {
    logger.error(`Error managing role for ${member.user.tag}:`, error);
    await interaction.reply({ content: 'An error occurred while managing your role.', ephemeral: true });
  }
}

async function handleInteractionError(interaction: Interaction) {
  if (interaction.isRepliable()) {
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  } else {
    logger.error('Interaction is not repliable, could not send error message to user.');
  }
}