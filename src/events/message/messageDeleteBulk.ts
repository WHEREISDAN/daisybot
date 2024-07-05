import { Events, Collection, Message, Snowflake, TextChannel } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.MessageBulkDelete,
    execute: async (messages: Collection<Snowflake, Message>, channel: TextChannel) => {
        logger.debug(`Bulk delete: ${messages.size} messages deleted in ${channel.name}`);
        await logManager.logMessageBulkDelete(messages, channel);
    }
};