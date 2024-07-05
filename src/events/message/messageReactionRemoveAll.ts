import { Events, Message, Collection, MessageReaction } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.MessageReactionRemoveAll,
    execute: async (message: Message, reactions: Collection<string, MessageReaction>) => {
        logger.debug(`All reactions removed from message ${message.id}`);
        await logManager.logMessageReactionRemoveAll(message, reactions);
    }
};