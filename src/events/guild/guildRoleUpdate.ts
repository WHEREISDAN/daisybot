import { Events, Role } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.GuildRoleUpdate,
    execute: async (oldRole: Role, newRole: Role) => {
        logger.debug(`Role updated: ${oldRole.name} -> ${newRole.name}`);
        await logManager.logGuildRoleUpdate(oldRole, newRole);
    }
};