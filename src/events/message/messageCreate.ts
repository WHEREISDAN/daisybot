import { Events, Message } from 'discord.js';
import { getOrCreateGlobalProfile, getOrCreateServerProfile } from '../../utils/database';
import { addXP, getXPAndLevel } from '../../utils/database';
import { generateLevelUpImage } from '../../utils/imageGenerator';
import { logger } from '../../utils/logger';

// Simple in-memory cache
const checkedUsers = new Set<string>();

const XP_COOLDOWN = 20000; // 1 minute cooldown
const userCooldowns = new Map<string, number>();

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

    const now = Date.now();
    const cooldownExpiration = userCooldowns.get(userId) ?? 0;

    if (now < cooldownExpiration) return;

    userCooldowns.set(userId, now + XP_COOLDOWN);

    try {
      const xpGained = Math.floor(Math.random() * 11) + 15; // Random XP between 15 and 25
      const { newXP, newLevel, didLevelUp } = await addXP(userId, xpGained);
      const { xpForNext } = await getXPAndLevel(userId);

      if (didLevelUp) {
        const levelUpImage = await generateLevelUpImage(message.author.username, message.author.displayAvatarURL({ extension: 'png', size: 256 }), newLevel, newXP, xpForNext);
        await message.channel.send({
          content: `Congratulations ${message.author}! You've leveled up!`,
          files: [{ attachment: levelUpImage, name: 'levelup.png' }]
        });
      }
    } catch (error) {
      logger.error(`Error in messageCreate event for user ${userId}:`, error);
    }
  },
};