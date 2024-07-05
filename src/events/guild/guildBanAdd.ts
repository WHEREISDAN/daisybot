import { Events, GuildBan } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.GuildBanAdd,
    execute: async (ban: GuildBan) => {
        logger.debug(`Member banned: ${ban.user.tag}`);
        await logManager.logGuildBanAdd(ban);
    }
};