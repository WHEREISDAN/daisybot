import { Events, GuildChannel } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.ChannelUpdate,
    execute: async (oldChannel: GuildChannel, newChannel: GuildChannel) => {
        logger.debug(`Channel updated: ${oldChannel.name} -> ${newChannel.name} (${newChannel.id})`);
        await logManager.logChannelUpdate(oldChannel, newChannel);
    }
};