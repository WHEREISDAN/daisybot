import { Events, Message } from 'discord.js';
import { logManager } from '../../utils/logManager';

module.exports = {
    name: Events.MessageDelete,
    execute: async (message: Message) => {
        logManager.logMessageDelete(message);
    }
}