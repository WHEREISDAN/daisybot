import { EmbedBuilder } from 'discord.js';
import { CustomClient } from '../types/customClient';

const COMMANDS_PER_PAGE = 5;

interface CommandsByCategory {
  [category: string]: { name: string; description: string }[];
}

export function generateHelpEmbed(client: CustomClient, page: number): EmbedBuilder {
  const commands = Array.from(client.commands.values());

  // Sort commands by category
  const commandsByCategory: CommandsByCategory = commands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push({ name: command.data.name, description: command.data.description });
    return acc;
  }, {} as CommandsByCategory);

  // Flatten the commands into a single array for pagination
  const allCommands = Object.entries(commandsByCategory).flatMap(([category, cmds]) => 
    [{ name: category, description: '---' }, ...cmds]
  );

  const totalPages = Math.ceil(allCommands.length / COMMANDS_PER_PAGE);

  const embed = new EmbedBuilder()
    .setColor('#FF69B4')
    .setTitle('📚 Command Help Menu')
    .setDescription('Here\'s a list of all available commands:')
    .setFooter({ text: `Page ${page + 1} of ${totalPages} • Use the buttons to navigate` })
    .setTimestamp();

  const start = page * COMMANDS_PER_PAGE;
  const end = start + COMMANDS_PER_PAGE;
  const pageCommands = allCommands.slice(start, end);

  let currentCategory = '';
  pageCommands.forEach(cmd => {
    if (cmd.description === '---') {
      currentCategory = cmd.name;
      embed.addFields({ name: `\n__${currentCategory}__`, value: '\u200B' });
    } else {
      embed.addFields({ 
        name: `/${cmd.name}`, 
        value: cmd.description || 'No description provided',
        inline: false
      });
    }
  });

  return embed;
}