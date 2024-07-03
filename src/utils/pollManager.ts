import { EmbedBuilder, Message } from 'discord.js';
import { logger } from './logger';

interface PollData {
  messageId: string;
  channelId: string;
  question: string;
  options: string[];
  votes: number[];
  voters: Set<string>;
  endTime: number;
  creatorId: string;
}

export class PollManager {
  private polls: Map<string, PollData> = new Map();

  createPoll(messageId: string, channelId: string, question: string, options: string[], duration: number, creatorId: string): void {
    this.polls.set(messageId, {
      messageId,
      channelId,
      question,
      options,
      votes: new Array(options.length).fill(0),
      voters: new Set(),
      endTime: Date.now() + duration * 60000,
      creatorId
    });

    setTimeout(() => this.endPoll(messageId), duration * 60000);
  }

  vote(messageId: string, userId: string, choiceIndex: number): boolean {
    const poll = this.polls.get(messageId);
    if (!poll || poll.voters.has(userId)) return false;

    poll.votes[choiceIndex]++;
    poll.voters.add(userId);
    return true;
  }

  getPoll(messageId: string): PollData | undefined {
    return this.polls.get(messageId);
  }

  async endPoll(messageId: string): Promise<EmbedBuilder | null> {
    const poll = this.polls.get(messageId);
    if (!poll) return null;

    this.polls.delete(messageId);

    const totalVotes = poll.votes.reduce((sum, count) => sum + count, 0);
    const results = poll.options.map((option, index) => {
      const percentage = totalVotes > 0 ? (poll.votes[index] / totalVotes * 100).toFixed(2) : '0.00';
      return `${option}: ${poll.votes[index]} votes (${percentage}%)`;
    }).join('\n');

    const resultsEmbed = new EmbedBuilder()
      .setColor('#FF69B4')
      .setTitle(`📊 Poll Results: ${poll.question}`)
      .setDescription(results)
      .setFooter({ text: `Total votes: ${totalVotes}` })
      .setTimestamp();

    logger.info(`Poll ${messageId} ended`);
    return resultsEmbed;
  }

  isPollCreator(messageId: string, userId: string): boolean {
    const poll = this.polls.get(messageId);
    return poll ? poll.creatorId === userId : false;
  }
}

export const pollManager = new PollManager();