import { ActivityType, Client } from 'discord.js';
import { logger } from '../../utils/logger';
import { TwitchManager } from '../../utils/twitchManager';

module.exports = {
  name: 'ready',
  once: true,
  execute(client: Client) {
    logger.info(`Logged in as ${client.user!.tag}!`);

    client.user?.setPresence({
      activities: [{ name: 'your discord server', type: ActivityType.Watching }],
      status: 'dnd',
  });
  },
};