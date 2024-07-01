import { GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import { registerEvents } from './utils/eventLoader';
import { registerCommands } from './utils/commandLoader';
import { CustomClient } from './types/customClient';

config();

const client = new CustomClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
});

registerEvents(client);
registerCommands(client);

client.login(process.env.TOKEN);