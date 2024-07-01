import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { Command } from '../types/command';
import { CustomClient } from '../types/customClient';

export function registerCommands(client: CustomClient): void {
  const commandsPath = path.join(__dirname, '..', 'commands');
  
  function readCommands(dir: string) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        readCommands(filePath);
      } else if (file.name.endsWith('.ts')) {
        const command = require(filePath) as Command;
        if ('data' in command && 'execute' in command) {
          client.commands.set(command.data.name, command);
          console.log(`Loaded command: ${command.data.name} from ${filePath}`);
        }
      }
    }
  }

  readCommands(commandsPath);
}

export async function deployCommands(): Promise<void> {
  const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
  const commandsPath = path.join(__dirname, '..', 'commands');
  
  function readCommandsForDeployment(dir: string) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        readCommandsForDeployment(filePath);
      } else if (file.name.endsWith('.ts')) {
        const command = require(filePath) as Command;
        commands.push(command.data.toJSON());
      }
    }
  }

  readCommandsForDeployment(commandsPath);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID!),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}