import { Events, GuildTextBasedChannel } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.ChannelPinsUpdate,
    execute: async (channel: GuildTextBasedChannel, time: Date) => {
        logger.debug(`Pins updated in channel: ${channel.name} (${channel.id}) at ${time}`);
        await logManager.logChannelPinsUpdate(channel, time);
    }
};