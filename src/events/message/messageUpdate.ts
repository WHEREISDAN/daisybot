import { Events, Message, PartialMessage } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.MessageUpdate,
    execute: async (oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) => {
        // Log that the event was triggered
        logger.debug('MessageUpdate event triggered');

        // Check if the messages are partial and fetch them if necessary
        if (oldMessage.partial) {
            try {
                await oldMessage.fetch();
            } catch (error) {
                logger.error('Error fetching old message:', error);
                return;
            }
        }

        if (newMessage.partial) {
            try {
                await newMessage.fetch();
            } catch (error) {
                logger.error('Error fetching new message:', error);
                return;
            }
        }

        // Check if the content has actually changed
        if (oldMessage.content === newMessage.content) {
            logger.debug('Message content unchanged, ignoring update');
            return;
        }

        // Log the message update
        logger.debug(`Message updated: "${oldMessage.content}" -> "${newMessage.content}"`);

        // Check if the message is from a guild
        if (!newMessage.guild) {
            logger.debug('Message not from a guild, ignoring update');
            return;
        }

        // Log the message update using logManager
        try {
            await logManager.logMessageUpdate(oldMessage as Message, newMessage as Message);
        } catch (error) {
            logger.error('Error logging message update:', error);
        }
    }
};