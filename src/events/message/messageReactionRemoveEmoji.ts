import { Events, MessageReaction } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.MessageReactionRemoveEmoji,
    execute: async (reaction: MessageReaction) => {
        logger.debug(`Emoji ${reaction.emoji.name} removed from all reactions on message ${reaction.message.id}`);
        await logManager.logMessageReactionRemoveEmoji(reaction);
    }
};