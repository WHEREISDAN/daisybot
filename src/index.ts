import { GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import { registerEvents } from './utils/eventLoader';
import { registerCommands } from './utils/commandLoader';
import { CustomClient } from './types/customClient';
import prisma from './utils/database';
import { logger } from './utils/logger';

config();

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

    // Register events and commands
    registerEvents(client);
    registerCommands(client);

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