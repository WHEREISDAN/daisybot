import { Events, Message } from 'discord.js';
import { getOrCreateGlobalProfile, getOrCreateServerProfile } from '../../utils/database';
import { logger } from '../../utils/logger';

// Simple in-memory cache
const checkedUsers = new Set<string>();

module.exports = {
  name: Events.MessageCreate,
  async execute(message: Message) {
    if (message.author.bot) return; // Ignore bot messages

    const userId = message.author.id;
    const guildId = message.guild?.id;

    // If not in a guild, we don't need to create a profile
    if (!guildId) return;

    // Check if we've already verified this user recently
    if (checkedUsers.has(userId)) return;

    try {
      // Attempt to get or create profiles
      await getOrCreateGlobalProfile(userId);
      await getOrCreateServerProfile(userId, guildId);

      // Add user to the checked cache
      checkedUsers.add(userId);

      // Optionally, remove user from cache after some time
      setTimeout(() => checkedUsers.delete(userId), 1000 * 60 * 60); // Remove after 1 hour

      logger.info(`Created/verified profiles for user ${message.author.tag} in guild ${message.guild?.name}`);
    } catch (error) {
      logger.error(`Error creating/verifying profiles for user ${message.author.tag}:`, error);
    }
  },
};