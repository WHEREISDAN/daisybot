import { ButtonInteraction } from 'discord.js';
import { CustomClient } from '../types/customClient';
import { logger } from '../utils/logger';

export async function handleButton(interaction: ButtonInteraction, client: CustomClient) {
  const [name, ...args] = interaction.customId.split(':');

  const button = client.buttons.get(name);

  if (!button) {
    logger.warn(`No button found with name ${name}`);
    return;
  }

  try {
    await button.execute(interaction, args);
  } catch (error) {
    logger.error(`Error executing button ${name}:`, error);
    await interaction.reply({ content: 'There was an error while executing this button!', ephemeral: true });
  }
}