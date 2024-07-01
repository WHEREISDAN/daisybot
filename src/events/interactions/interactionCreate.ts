import { Interaction, ChatInputCommandInteraction } from 'discord.js';
import { CustomClient } from '../../types/customClient';
import { handleButton } from '../../handlers/buttonHandler';
import { handleSelectMenu } from '../../handlers/selectMenuHandler';
import { logger } from '../../utils/logger';

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

async function handleInteractionError(interaction: Interaction) {
  if (interaction.isRepliable()) {
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  } else {
    logger.error('Interaction is not repliable, could not send error message to user.');
  }
}