import { ButtonInteraction } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { CustomClient } from '../types/customClient';
import { Button } from '../types/button';
import { logger } from './logger';

export function registerButtons(client: CustomClient): void {
    const buttonsPath = path.join(__dirname, '..', 'buttons');
    let buttonCount = 0;
    
    function readButtons(dir: string) {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const filePath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
          readButtons(filePath);
        } else if (file.name.endsWith('.ts')) {
          const buttonModule = require(filePath);
          const button: Button = buttonModule.button;
          
          if (button && 'data' in button && 'execute' in button) {
            client.buttons.set(button.data.name, button);
            buttonCount++;
          } else {
            logger.warn(`Invalid button file structure: ${filePath}`);
          }
        }
      }
    }
  
    readButtons(buttonsPath);
    logger.info(`Loaded ${buttonCount} buttons`);
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