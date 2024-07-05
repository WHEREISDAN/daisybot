import { Events, GuildChannel } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.ChannelDelete,
    execute: async (channel: GuildChannel) => {
        logger.debug(`Channel deleted: ${channel.name} (${channel.id})`);
        await logManager.logChannelDelete(channel);
    }
};