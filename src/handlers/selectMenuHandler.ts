import { SelectMenuInteraction } from 'discord.js';
import { CustomClient } from '../types/customClient';
import { logger } from '../utils/logger';

export async function handleSelectMenu(interaction: SelectMenuInteraction, client: CustomClient) {
  const [name, ...args] = interaction.customId.split(':');

  const menu = client.selectMenus.get(name);

  if (!menu) {
    logger.warn(`No select menu found with name ${name}`);
    return;
  }

  try {
    await menu.execute(interaction, args);
  } catch (error) {
    logger.error(`Error executing select menu ${name}:`, error);
    await interaction.reply({ content: 'There was an error while executing this select menu!', ephemeral: true });
  }
}