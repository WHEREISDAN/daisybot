import { Events, Invite } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.InviteDelete,
    execute: async (invite: Invite) => {
        logger.debug(`Invite deleted: ${invite.code}`);
        await logManager.logGuildInviteDelete(invite);
    }
};