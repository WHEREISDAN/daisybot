import { Events, Guild } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.WebhooksUpdate,
    execute: async (guild: Guild) => {
        logger.debug(`Webhooks updated in guild: ${guild.name}`);
        await logManager.logGuildWebhooksUpdate(guild);
    }
};