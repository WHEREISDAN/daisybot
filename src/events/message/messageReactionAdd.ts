import { Events, MessageReaction, User } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.MessageReactionAdd,
    execute: async (reaction: MessageReaction, user: User) => {
        logger.debug(`Reaction added: ${reaction.emoji.name} by ${user.tag}`);
        await logManager.logMessageReactionAdd(reaction, user);
    }
};