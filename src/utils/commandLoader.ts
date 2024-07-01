import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { Command } from '../types/command';
import { CustomClient } from '../types/customClient';
import { logger } from './logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export async function registerCommands(client: CustomClient): Promise<void> {
  const commandsPath = path.join(__dirname, '..', 'commands');
  let commandCount = 0;
  
  async function readCommands(dir: string) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        await readCommands(filePath);
      } else if (file.name.endsWith('.ts')) {
        try {
          const commandModule = await import(filePath);
          const command = commandModule.default as Command;
          if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commandCount++;
            logger.debug(`Loaded command: ${command.data.name}`);
          } else {
            logger.warn(`Invalid command file structure: ${filePath}`);
          }
        } catch (error) {
          logger.error(`Error loading command file ${filePath}:`, error);
        }
      }
    }
  }

  await readCommands(commandsPath);
  logger.info(`Loaded ${commandCount} commands`);
}

export async function deployCommands(): Promise<void> {
  const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
  const commandsPath = path.join(__dirname, '..', 'commands');
  
  async function readCommandsForDeployment(dir: string) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        await readCommandsForDeployment(filePath);
      } else if (file.name.endsWith('.ts')) {
        try {
          const commandModule = await import(filePath);
          const command = commandModule.default as Command;
          if (command.data && typeof command.data.toJSON === 'function') {
            commands.push(command.data.toJSON());
          } else {
            logger.warn(`Invalid command file structure for deployment: ${filePath}`);
          }
        } catch (error) {
          logger.error(`Error loading command file for deployment ${filePath}:`, error);
        }
      }
    }
  }

  await readCommandsForDeployment(commandsPath);

  const token = process.env.TOKEN;
  const clientId = process.env.CLIENT_ID;

  if (!token) {
    logger.error('Bot token not found in environment variables');
    return;
  }

  if (!clientId) {
    logger.error('Client ID not found in environment variables');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    logger.info('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    logger.info(`Successfully reloaded ${commands.length} application (/) commands.`);
  } catch (error) {
    logger.error('Failed to reload application (/) commands:', error);
  }
}