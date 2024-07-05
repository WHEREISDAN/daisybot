import { Events, GuildBan } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.GuildBanRemove,
    execute: async (ban: GuildBan) => {
        logger.debug(`Member unbanned: ${ban.user.tag}`);
        await logManager.logGuildBanRemove(ban);
    }
};