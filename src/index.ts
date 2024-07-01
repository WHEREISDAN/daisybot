import dotenv from 'dotenv';

// Load environment variables before anything else
dotenv.config();

import { GatewayIntentBits } from 'discord.js';
import { registerEvents } from './utils/eventLoader';
import { registerCommands, deployCommands } from './utils/commandLoader';
import { registerButtons } from './utils/buttonLoader';
import { registerSelectMenus } from './utils/selectMenuLoader';
import { CustomClient } from './types/customClient';
import prisma from './utils/database';
import { logger } from './utils/logger';

const client = new CustomClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
});

async function main() {
  try {
    // Ensure database connection
    await prisma.$connect();
    logger.info('Successfully connected to the database');

    // Register events, commands, buttons, and select menus
    registerEvents(client);
    registerCommands(client);
    registerButtons(client);
    registerSelectMenus(client);

    // Deploy slash commands
    await deployCommands();

    // Login to Discord
    await client.login(process.env.TOKEN);
  } catch (error) {
    logger.error('Failed to start the bot:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.warn('Shutting down...');
  await prisma.$disconnect();
  client.destroy();
  process.exit(0);
});