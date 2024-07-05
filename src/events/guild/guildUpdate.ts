import { Events, Guild } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.GuildUpdate,
    execute: async (oldGuild: Guild, newGuild: Guild) => {
        logger.debug(`Guild updated: ${oldGuild.name} -> ${newGuild.name}`);
        await logManager.logGuildUpdate(oldGuild, newGuild);
    }
};