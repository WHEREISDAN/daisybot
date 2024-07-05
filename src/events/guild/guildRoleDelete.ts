import { Events, Role } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.GuildRoleDelete,
    execute: async (role: Role) => {
        logger.debug(`Role deleted: ${role.name}`);
        await logManager.logGuildRoleDelete(role);
    }
};