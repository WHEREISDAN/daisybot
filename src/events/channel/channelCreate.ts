import { Events, GuildChannel } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.ChannelCreate,
    execute: async (channel: GuildChannel) => {
        logger.debug(`Channel created: ${channel.name} (${channel.id})`);
        await logManager.logChannelCreate(channel);
    }
};