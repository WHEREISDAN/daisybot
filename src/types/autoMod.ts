export interface AutoModConfig {
    id: string;
    guildId: string;
    enabled: boolean;
    logChannelId: string | null;
    profanityFilterEnabled: boolean;
    profanityWordList: string[];
    spamDetectionEnabled: boolean;
    maxMessagesPerMinute: number;
    inviteLinkDetectionEnabled: boolean;
    allowedInvites: string[];
    capsDetectionEnabled: boolean;
    maxCapsPercentage: number;
    mentionLimitEnabled: boolean;
    maxMentionsPerMessage: number;
    emojiLimitEnabled: boolean;
    maxEmojisPerMessage: number;
    phishingDetectionEnabled: boolean;
    punishmentLadder: string[]; // Assuming this is stored as a JSON array of strings
  }
  
  export type AutoModUpdateData = Partial<Omit<AutoModConfig, 'id' | 'guildId'>>;