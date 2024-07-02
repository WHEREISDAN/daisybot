import { Message } from 'discord.js';
import { getAutoModConfig } from './database';
import { AutoModConfig } from '../types/autoMod';
import { logger } from './logger';

export async function runAutoMod(message: Message): Promise<boolean> {
    if (!message.guild) return false;

    const config = await getAutoModConfig(message.guild.id);
    if (!config || !config.enabled) return false;

    let violated = false;

    if (config.profanityFilterEnabled && containsProfanity(message.content, config.profanityWordList)) {
        violated = true;
        await handleViolation(message, 'profanity');
    }

    if (config.spamDetectionEnabled && await isSpam(message, config)) {
        violated = true;
        await handleViolation(message, 'spam');
    }

    if (config.inviteLinkDetectionEnabled && containsInviteLink(message.content, config.allowedInvites)) {
        violated = true;
        await handleViolation(message, 'invite link');
    }

    if (config.capsDetectionEnabled && hasExcessiveCaps(message.content, config.maxCapsPercentage)) {
        violated = true;
        await handleViolation(message, 'excessive caps');
    }

    if (config.mentionLimitEnabled && exceedsMentionLimit(message, config.maxMentionsPerMessage)) {
        violated = true;
        await handleViolation(message, 'mention spam');
    }

    return violated;
}

function containsProfanity(content: string, wordList: string[]): boolean {
    const lowerContent = content.toLowerCase();
    logger.info(`Auto Mod: Checking for profanity in ${content}`);
    return wordList.some(word => lowerContent.includes(word.toLowerCase()));
}

async function isSpam(message: Message, config: AutoModConfig): Promise<boolean> {
    // Implement spam detection logic here
    // This is a simple example and should be expanded for better accuracy
    const messages = await message.channel.messages.fetch({ limit: config.maxMessagesPerMinute, before: message.id });
    const userMessages = messages.filter(m => m.author.id === message.author.id);
    return userMessages.size >= config.maxMessagesPerMinute - 1;
}

async function handleViolation(message: Message, violationType: string) {
    try {
        await message.delete();
        await message.channel.send(`${message.author}, your message was removed due to ${violationType}.`);
        // Implement logging and punishment logic here
        logger.warn(`Auto Mod: ${violationType} violation by ${message.author.tag} in ${message.guild?.name}`);
    } catch (error) {
        logger.error(`Error handling Auto Mod violation:`, error);
    }
}

function containsInviteLink(content: string, allowedInvites: string[]): boolean {
    const inviteRegex = /discord(?:\.gg|app\.com\/invite|\.com\/invite)\/[\w-]+/gi;
    const matches = content.match(inviteRegex);

    if (!matches) return false;

    return matches.some(invite => {
        const inviteCode = invite.split('/').pop();
        return !allowedInvites.includes(inviteCode!);
    });
}

function hasExcessiveCaps(content: string, maxCapsPercentage: number): boolean {
    const totalChars = content.length;
    if (totalChars === 0) return false;

    const capsCount = (content.match(/[A-Z]/g) || []).length;
    const capsPercentage = (capsCount / totalChars) * 100;

    return capsPercentage > maxCapsPercentage;
}

function exceedsMentionLimit(message: Message, maxMentions: number): boolean {
    const totalMentions = message.mentions.users.size + message.mentions.roles.size;
    return totalMentions > maxMentions;
}