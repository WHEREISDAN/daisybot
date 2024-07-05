import { TextChannel, EmbedBuilder, Guild, GuildAuditLogsEntry, AuditLogEvent, Message, GuildMember, Role, Invite, Collection, MessageReaction, User, Snowflake, GuildChannel, GuildTextBasedChannel, GuildEmoji, GuildBan, InviteGuild } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { LogConfig } from '../types/logConfig';

const prisma = new PrismaClient();

export class LogManager {
  async shouldLog(guildId: string, eventType: keyof Omit<LogConfig, 'id' | 'guildId'>): Promise<boolean> {
    try {
      const logConfig = await prisma.logConfig.findUnique({
        where: { guildId },
      });

      if (!logConfig) return false;

      return logConfig[eventType] || false;
    } catch (error) {
      logger.error(`Error checking log config for guild ${guildId}:`, error);
      return false;
    }
  }

  async getLogChannel(guildId: string): Promise<string | null> {
    try {
      const guild = await prisma.guild.findUnique({
        where: { id: guildId },
        select: { logChannelId: true }
      });
      return guild?.logChannelId ?? null;
    } catch (error) {
      logger.error(`Error fetching log channel for guild ${guildId}:`, error);
      return null;
    }
  }

  async logEvent(guild: Guild, eventType: keyof Omit<LogConfig, 'id' | 'guildId'>, embedData: EmbedBuilder): Promise<void> {
    if (!await this.shouldLog(guild.id, eventType)) return;

    const logChannelId = await this.getLogChannel(guild.id);
    if (!logChannelId) return;

    const logChannel = await guild.channels.fetch(logChannelId) as TextChannel | null;
    if (!logChannel) return;

    await logChannel.send({ embeds: [embedData] });
  }

  async logMessageDelete(message: Message): Promise<void> {
    if (!message.guild) return;

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Message Deleted')
      .setDescription(`A message was deleted in ${message.channel}`)
      .addFields(
        { name: 'Author', value: message.author?.tag || 'Unknown' },
        { name: 'Content', value: message.content?.substring(0, 1024) || 'No text content' }
      )
      .setTimestamp();

    await this.logEvent(message.guild, 'messageDelete', embed);
  }

  async logMemberAdd(member: GuildMember): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Member Joined')
      .setDescription(`${member.user.tag} has joined the server`)
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'User ID', value: member.id },
        { name: 'Account Created', value: member.user.createdAt.toUTCString() }
      )
      .setTimestamp();

    await this.logEvent(member.guild, 'guildMemberAdd', embed);
  }

  async logRoleCreate(role: Role): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('Role Created')
      .setDescription(`A new role has been created: ${role.name}`)
      .addFields(
        { name: 'Role ID', value: role.id },
        { name: 'Color', value: role.hexColor },
        { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No' },
        { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No' }
      )
      .setTimestamp();

    await this.logEvent(role.guild, 'guildRoleCreate', embed);
  }

  async logMessageUpdate(oldMessage: Message, newMessage: Message): Promise<void> {
    if (!newMessage.guild) return;
  
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('Message Updated')
      .setDescription(`A message was edited in ${newMessage.channel}`)
      .addFields(
        { name: 'Author', value: newMessage.author.tag },
        { name: 'Old Content', value: oldMessage.content?.substring(0, 1024) || 'No text content' },
        { name: 'New Content', value: newMessage.content?.substring(0, 1024) || 'No text content' }
      )
      .setTimestamp();
  
    await this.logEvent(newMessage.guild, 'messageUpdate', embed);
  }

  async logMessageDeleteBulk(messages: Collection<string, Message>): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Messages Deleted')
      .setDescription(`${messages.size} messages were deleted in ${messages.first()?.channel}`)
  }

  async logMessageBulkDelete(messages: Collection<Snowflake, Message>, channel: TextChannel): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Bulk Message Delete')
      .setDescription(`${messages.size} messages were deleted in ${channel.name}`)
      .addFields({ name: 'Channel', value: channel.toString() })
      .setTimestamp();

    await this.logEvent(channel.guild, 'messageBulkDelete', embed);
  }

  async logMessageReactionAdd(reaction: MessageReaction, user: User): Promise<void> {
    if (!reaction.message.guild) return;

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Reaction Added')
      .setDescription(`${user.tag} added a reaction to a message`)
      .addFields(
        { name: 'Emoji', value: reaction.emoji.toString() },
        { name: 'Message', value: reaction.message.url }
      )
      .setTimestamp();

    await this.logEvent(reaction.message.guild, 'messageReactionAdd', embed);
  }

  async logMessageReactionRemove(reaction: MessageReaction, user: User): Promise<void> {
    if (!reaction.message.guild) return;

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('Reaction Removed')
      .setDescription(`${user.tag} removed a reaction from a message`)
      .addFields(
        { name: 'Emoji', value: reaction.emoji.toString() },
        { name: 'Message', value: reaction.message.url }
      )
      .setTimestamp();

    await this.logEvent(reaction.message.guild, 'messageReactionRemove', embed);
  }

  async logMessageReactionRemoveAll(message: Message, reactions: Collection<string, MessageReaction>): Promise<void> {
    if (!message.guild) return;

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('All Reactions Removed')
      .setDescription(`All reactions were removed from a message`)
      .addFields(
        { name: 'Message', value: message.url },
        { name: 'Reaction Count', value: reactions.size.toString() }
      )
      .setTimestamp();

    await this.logEvent(message.guild, 'messageReactionRemoveAll', embed);
  }

  async logMessageReactionRemoveEmoji(reaction: MessageReaction): Promise<void> {
    if (!reaction.message.guild) return;

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('Emoji Removed from Reactions')
      .setDescription(`An emoji was removed from all reactions on a message`)
      .addFields(
        { name: 'Emoji', value: reaction.emoji.toString() },
        { name: 'Message', value: reaction.message.url }
      )
      .setTimestamp();

    await this.logEvent(reaction.message.guild, 'messageReactionRemoveEmoji', embed);
  }

  async logChannelCreate(channel: GuildChannel): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Channel Created')
      .setDescription(`A new channel has been created`)
      .addFields(
        { name: 'Name', value: channel.name },
        { name: 'Type', value: channel.type.toString() }, // Convert channel.type to string
        { name: 'ID', value: channel.id }
      )
      .setTimestamp();

    await this.logEvent(channel.guild, 'channelCreate', embed);
  }

  async logChannelDelete(channel: GuildChannel): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Channel Deleted')
      .setDescription(`A channel has been deleted`)
      .addFields(
        { name: 'Name', value: channel.name },
        { name: 'Type', value: channel.type.toString() }, // Convert channel.type to string
        { name: 'ID', value: channel.id }
      )
      .setTimestamp();

    await this.logEvent(channel.guild, 'channelDelete', embed);
  }

  async logChannelUpdate(oldChannel: GuildChannel, newChannel: GuildChannel): Promise<void> {
    const changes = this.getChannelChanges(oldChannel, newChannel);
    
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('Channel Updated')
      .setDescription(`Channel ${newChannel.name} has been updated`)
      .addFields(
        { name: 'ID', value: newChannel.id },
        ...changes
      )
      .setTimestamp();

    await this.logEvent(newChannel.guild, 'channelUpdate', embed);
  }

  async logChannelPinsUpdate(channel: GuildTextBasedChannel, time: Date): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('Channel Pins Updated')
      .setDescription(`Pins in a channel have been updated`)
      .addFields(
        { name: 'Channel', value: channel.name },
        { name: 'Channel ID', value: channel.id },
        { name: 'Time', value: time.toUTCString() }
      )
      .setTimestamp();

    await this.logEvent(channel.guild, 'channelPinsUpdate', embed);
  }

  private getChannelChanges(oldChannel: GuildChannel, newChannel: GuildChannel): { name: string, value: string }[] {
    const changes: { name: string, value: string }[] = [];

    if (oldChannel.name !== newChannel.name) {
      changes.push({ name: 'Name', value: `${oldChannel.name} -> ${newChannel.name}` });
    }

    if (oldChannel.type !== newChannel.type) {
      changes.push({ name: 'Type', value: `${oldChannel.type} -> ${newChannel.type}` });
    }

    if ('topic' in oldChannel && 'topic' in newChannel && oldChannel.topic !== newChannel.topic) {
      changes.push({ name: 'Topic', value: `${oldChannel.topic || 'None'} -> ${newChannel.topic || 'None'}` });
    }

    // Add more checks for other properties that might change

    return changes;
  }

  async logGuildMemberUpdate(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    const changes = this.getMemberChanges(oldMember, newMember);
    
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('Member Updated')
      .setDescription(`Member ${newMember.user.tag} has been updated`)
      .addFields(...changes)
      .setTimestamp();

    await this.logEvent(newMember.guild, 'guildMemberUpdate', embed);
  }

  async logGuildBanAdd(ban: GuildBan): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Member Banned')
      .setDescription(`${ban.user.tag} has been banned`)
      .addFields(
        { name: 'User ID', value: ban.user.id },
        { name: 'Reason', value: ban.reason || 'No reason provided' }
      )
      .setTimestamp();

    await this.logEvent(ban.guild, 'guildBanAdd', embed);
  }

  async logGuildBanRemove(ban: GuildBan): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Member Unbanned')
      .setDescription(`${ban.user.tag} has been unbanned`)
      .addFields(
        { name: 'User ID', value: ban.user.id }
      )
      .setTimestamp();

    await this.logEvent(ban.guild, 'guildBanRemove', embed);
  }

  async logGuildRoleCreate(role: Role): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Role Created')
      .setDescription(`A new role has been created`)
      .addFields(
        { name: 'Name', value: role.name },
        { name: 'ID', value: role.id },
        { name: 'Color', value: role.hexColor },
        { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No' },
        { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No' }
      )
      .setTimestamp();

    await this.logEvent(role.guild, 'guildRoleCreate', embed);
  }

  async logGuildRoleDelete(role: Role): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Role Deleted')
      .setDescription(`A role has been deleted`)
      .addFields(
        { name: 'Name', value: role.name },
        { name: 'ID', value: role.id }
      )
      .setTimestamp();

    await this.logEvent(role.guild, 'guildRoleDelete', embed);
  }

  async logGuildRoleUpdate(oldRole: Role, newRole: Role): Promise<void> {
    const changes = this.getRoleChanges(oldRole, newRole);
    
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('Role Updated')
      .setDescription(`Role ${newRole.name} has been updated`)
      .addFields(...changes)
      .setTimestamp();

    await this.logEvent(newRole.guild, 'guildRoleUpdate', embed);
  }

  async logGuildEmojisUpdate(guild: Guild, oldEmojis: Collection<string, GuildEmoji>, newEmojis: Collection<string, GuildEmoji>): Promise<void> {
    const added = newEmojis.filter(emoji => !oldEmojis.has(emoji.id));
    const removed = oldEmojis.filter(emoji => !newEmojis.has(emoji.id));
    
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('Guild Emojis Updated')
      .setDescription(`Emojis in ${guild.name} have been updated`)
      .addFields(
        { name: 'Added', value: added.size > 0 ? added.map(e => e.toString()).join(', ') : 'None' },
        { name: 'Removed', value: removed.size > 0 ? removed.map(e => e.name).join(', ') : 'None' }
      )
      .setTimestamp();

    await this.logEvent(guild, 'guildEmojisUpdate', embed);
  }

  async logGuildInviteCreate(invite: Invite): Promise<void> {
    if (!invite.guild) {
      logger.warn('Invite created without a guild reference');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Invite Created')
      .setDescription(`A new invite has been created`)
      .addFields(
        { name: 'Code', value: invite.code },
        { name: 'Channel', value: invite.channel?.name || 'Unknown' },
        { name: 'Inviter', value: invite.inviter?.tag || 'Unknown' },
        { name: 'Max Uses', value: invite.maxUses?.toString() || 'Unlimited' },
        { name: 'Expires', value: invite.expiresAt?.toUTCString() || 'Never' }
      )
      .setTimestamp();

    await this.logEventForInvite(invite.guild, 'guildInviteCreate', embed);
  }

  async logGuildInviteDelete(invite: Invite): Promise<void> {
    if (!invite.guild) {
      logger.warn('Invite deleted without a guild reference');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Invite Deleted')
      .setDescription(`An invite has been deleted`)
      .addFields(
        { name: 'Code', value: invite.code },
        { name: 'Channel', value: invite.channel?.name || 'Unknown' },
        { name: 'Inviter', value: invite.inviter?.tag || 'Unknown' }
      )
      .setTimestamp();

    await this.logEventForInvite(invite.guild, 'guildInviteDelete', embed);
  }

  private async logEventForInvite(guild: Guild | InviteGuild, eventType: keyof Omit<LogConfig, 'id' | 'guildId'>, embed: EmbedBuilder): Promise<void> {
    // For InviteGuild, we only have the id, so we need to fetch the full Guild object
    const fullGuild = guild instanceof Guild ? guild : await guild.client.guilds.fetch(guild.id);
    
    if (fullGuild instanceof Guild) {
      await this.logEvent(fullGuild, eventType, embed);
    } else {
      logger.error(`Failed to fetch full Guild object for invite log in guild ${guild.id}`);
    }
  }

  async logGuildWebhooksUpdate(guild: Guild): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('Guild Webhooks Updated')
      .setDescription(`Webhooks in ${guild.name} have been updated`)
      .setTimestamp();

    await this.logEvent(guild, 'guildWebhooksUpdate', embed);
  }

  async logGuildUpdate(oldGuild: Guild, newGuild: Guild): Promise<void> {
    const changes = this.getGuildChanges(oldGuild, newGuild);
    
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('Guild Updated')
      .setDescription(`${newGuild.name} has been updated`)
      .addFields(...changes)
      .setTimestamp();

    await this.logEvent(newGuild, 'guildUpdate', embed);
  }

  private getMemberChanges(oldMember: GuildMember, newMember: GuildMember): { name: string, value: string }[] {
    const changes: { name: string, value: string }[] = [];

    if (oldMember.nickname !== newMember.nickname) {
      changes.push({ name: 'Nickname', value: `${oldMember.nickname || 'None'} -> ${newMember.nickname || 'None'}` });
    }

    if (!oldMember.roles.cache.equals(newMember.roles.cache)) {
      const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
      const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

      if (addedRoles.size > 0) {
        changes.push({ name: 'Roles Added', value: addedRoles.map(r => r.name).join(', ') });
      }
      if (removedRoles.size > 0) {
        changes.push({ name: 'Roles Removed', value: removedRoles.map(r => r.name).join(', ') });
      }
    }

    return changes;
  }

  private getRoleChanges(oldRole: Role, newRole: Role): { name: string, value: string }[] {
    const changes: { name: string, value: string }[] = [];

    if (oldRole.name !== newRole.name) {
      changes.push({ name: 'Name', value: `${oldRole.name} -> ${newRole.name}` });
    }
    if (oldRole.color !== newRole.color) {
      changes.push({ name: 'Color', value: `${oldRole.hexColor} -> ${newRole.hexColor}` });
    }
    if (oldRole.hoist !== newRole.hoist) {
      changes.push({ name: 'Hoisted', value: `${oldRole.hoist} -> ${newRole.hoist}` });
    }
    if (oldRole.mentionable !== newRole.mentionable) {
      changes.push({ name: 'Mentionable', value: `${oldRole.mentionable} -> ${newRole.mentionable}` });
    }
    if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
      changes.push({ name: 'Permissions', value: 'Permissions have been updated' });
    }

    return changes;
  }

  private getGuildChanges(oldGuild: Guild, newGuild: Guild): { name: string, value: string }[] {
    const changes: { name: string, value: string }[] = [];

    if (oldGuild.name !== newGuild.name) {
      changes.push({ name: 'Name', value: `${oldGuild.name} -> ${newGuild.name}` });
    }
    if (oldGuild.ownerId !== newGuild.ownerId) {
      changes.push({ name: 'Owner', value: `<@${oldGuild.ownerId}> -> <@${newGuild.ownerId}>` });
    }
    if (oldGuild.icon !== newGuild.icon) {
      changes.push({ name: 'Icon', value: 'Guild icon has been updated' });
    }
    if (oldGuild.banner !== newGuild.banner) {
      changes.push({ name: 'Banner', value: 'Guild banner has been updated' });
    }

    return changes;
  }

  // Add more logging methods for other event types...

  private formatChanges(changes: any): string {
    if (!changes) return 'No changes recorded';
    return Object.entries(changes)
      .map(([key, value]: [string, any]) => `${key}: ${value.old} → ${value.new}`)
      .join('\n');
  }
}

export const logManager = new LogManager();