export type LogConfig = {
    id: string;
    guildId: string;
    warns: boolean;
    messageDelete: boolean;
    messageUpdate: boolean;
    messageBulkDelete: boolean;
    messageReactionAdd: boolean;
    messageReactionRemove: boolean;
    messageReactionRemoveAll: boolean;
    messageReactionRemoveEmoji: boolean;
    channelCreate: boolean;
    channelDelete: boolean;
    channelUpdate: boolean;
    channelPinsUpdate: boolean;
    guildMemberAdd: boolean;
    guildMemberRemove: boolean;
    guildMemberUpdate: boolean;
    guildBanAdd: boolean;
    guildBanRemove: boolean;
    guildRoleCreate: boolean;
    guildRoleDelete: boolean;
    guildRoleUpdate: boolean;
    guildEmojisUpdate: boolean;
    guildInviteCreate: boolean;
    guildInviteDelete: boolean;
    guildWebhooksUpdate: boolean;
    guildUpdate: boolean;
  };

  