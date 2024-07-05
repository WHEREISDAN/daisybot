import { Events, MessageReaction, User } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.MessageReactionRemove,
    execute: async (reaction: MessageReaction, user: User) => {
        logger.debug(`Reaction removed: ${reaction.emoji.name} by ${user.tag}`);
        await logManager.logMessageReactionRemove(reaction, user);
    }
};