import { EmbedBuilder, Role } from 'discord.js';
import { logger } from './logger';

interface GiveawayData {
  messageId: string;
  channelId: string;
  prize: string;
  description: string;
  endTime: number;
  winnerRole?: Role;
  participants: Set<string>;
  creatorId: string;
}

export class GiveawayManager {
  private giveaways: Map<string, GiveawayData> = new Map();

  createGiveaway(messageId: string, channelId: string, prize: string, description: string, duration: number, creatorId: string, winnerRole?: Role): void {
    this.giveaways.set(messageId, {
      messageId,
      channelId,
      prize,
      description,
      endTime: Date.now() + duration * 60000,
      winnerRole,
      participants: new Set(),
      creatorId
    });
  }

  enterGiveaway(messageId: string, userId: string): boolean {
    const giveaway = this.giveaways.get(messageId);
    if (!giveaway) return false;

    giveaway.participants.add(userId);
    return true;
  }

  getGiveaway(messageId: string): GiveawayData | undefined {
    return this.giveaways.get(messageId);
  }

  async endGiveaway(messageId: string): Promise<{ embed: EmbedBuilder, winner: string | null }> {
    const giveaway = this.giveaways.get(messageId);
    if (!giveaway) return { embed: new EmbedBuilder().setDescription('Giveaway not found.'), winner: null };

    this.giveaways.delete(messageId);

    const winner = this.selectWinner(Array.from(giveaway.participants));

    const resultsEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`🎉 Giveaway Ended: ${giveaway.prize}`)
      .setDescription(giveaway.description)
      .addFields(
        { name: 'Winner', value: winner ? `<@${winner}>` : 'No participants' },
        { name: 'Total Participants', value: giveaway.participants.size.toString() }
      )
      .setFooter({ text: `Giveaway ID: ${messageId}` })
      .setTimestamp();

    if (giveaway.winnerRole) {
      resultsEmbed.addFields({ name: 'Winner Role', value: giveaway.winnerRole.name });
    }

    logger.info(`Giveaway ${messageId} ended. Winner: ${winner || 'No winner'}`);
    return { embed: resultsEmbed, winner };
  }

  private selectWinner(participants: string[]): string | null {
    if (participants.length === 0) return null;
    return participants[Math.floor(Math.random() * participants.length)];
  }

  isGiveawayCreator(messageId: string, userId: string): boolean {
    const giveaway = this.giveaways.get(messageId);
    return giveaway ? giveaway.creatorId === userId : false;
  }
}

export const giveawayManager = new GiveawayManager();