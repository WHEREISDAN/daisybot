import { Events, GuildMember } from 'discord.js';
import { logManager } from '../../utils/logManager';
import { logger } from '../../utils/logger';

module.exports = {
    name: Events.GuildMemberUpdate,
    execute: async (oldMember: GuildMember, newMember: GuildMember) => {
        logger.debug(`Member updated: ${oldMember.user.tag}`);
        await logManager.logGuildMemberUpdate(oldMember, newMember);
    }
};