import { ButtonInteraction } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { CustomClient } from '../types/customClient';
import { Button } from '../types/button';
import { logger } from './logger';

export function loadButtons(client: CustomClient): void {
  const buttonsPath = path.join(__dirname, '..', 'buttons');
  const buttonFolders = fs.readdirSync(buttonsPath);

  for (const folder of buttonFolders) {
    const buttonFiles = fs.readdirSync(path.join(buttonsPath, folder)).filter(file => file.endsWith('.ts'));
    for (const file of buttonFiles) {
      const filePath = path.join(buttonsPath, folder, file);
      const button = require(filePath);
      if ('data' in button && 'execute' in button) {
        client.buttons.set(button.data.name, button);
      } else {
        logger.warn(`The button at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }
}

export async function handleButton(interaction: ButtonInteraction): Promise<void> {
  const client = interaction.client as CustomClient;
  const [buttonName, ...args] = interaction.customId.split(':');
  const button = client.buttons.get(buttonName);

  if (!button) {
    logger.warn(`No button matching ${buttonName} was found.`);
    await interaction.reply({ content: 'There was an error while executing this button!', ephemeral: true });
    return;
  }

  try {
    await button.execute(interaction, args);
  } catch (error) {
    logger.error(String(error)); // Convert error to string
    await interaction.reply({ content: 'There was an error while executing this button!', ephemeral: true });
  }
}