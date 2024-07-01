import { Client } from 'discord.js';
import { logger } from '../../utils/logger';

module.exports = {
  name: 'ready',
  once: true,
  execute(client: Client) {
    logger.info(`Logged in as ${client.user!.tag}!`);
  },
};