import { Events, Role } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.GuildRoleCreate,
    execute: async (role: Role) => {
        logger.debug(`Role created: ${role.name}`);
        await logManager.logGuildRoleCreate(role);
    }
};