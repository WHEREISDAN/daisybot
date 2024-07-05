import { Events, Invite } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.InviteCreate,
    execute: async (invite: Invite) => {
        logger.debug(`Invite created: ${invite.code}`);
        await logManager.logGuildInviteCreate(invite);
    }
};