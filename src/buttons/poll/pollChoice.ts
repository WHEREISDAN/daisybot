import { ButtonInteraction, EmbedBuilder, TextChannel } from 'discord.js';
import { Button } from '../../types/button';
import { pollManager } from '../../utils/pollManager';
import { logger } from '../../utils/logger';

export const button: Button = {
  data: {
    name: 'poll',
  },
  async execute(interaction: ButtonInteraction, args: string[]) {
    const [choiceIndex] = args.map(Number);
    const poll = pollManager.getPoll(interaction.message.id);

    if (!poll) {
      await interaction.reply({ content: 'This poll is no longer active.', ephemeral: true });
      return;
    }

    if (!pollManager.vote(interaction.message.id, interaction.user.id, choiceIndex)) {
      await interaction.reply({ content: 'You have already voted in this poll.', ephemeral: true });
      return;
    }

    const updatedPoll = pollManager.getPoll(interaction.message.id)!;
    const totalVotes = updatedPoll.votes.reduce((sum, count) => sum + count, 0);
    const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
      .setFields(updatedPoll.options.map((option, index) => ({
        name: option,
        value: `Votes: ${updatedPoll.votes[index]}`,
        inline: true
      })))
      .setFooter({ text: `Total votes: ${totalVotes}` });

    await interaction.update({ embeds: [updatedEmbed] });
    logger.info(`User ${interaction.user.tag} voted in poll ${interaction.message.id}`);
  },
};

export const endPollButton: Button = {
  data: {
    name: 'endPoll',
  },
  async execute(interaction: ButtonInteraction, args: string[]) {
    const [pollMessageId] = args;

    if (!pollManager.isPollCreator(pollMessageId, interaction.user.id)) {
      await interaction.reply({ content: 'Only the poll creator can end this poll early.', ephemeral: true });
      return;
    }

    const resultsEmbed = await pollManager.endPoll(pollMessageId);
    if (!resultsEmbed) {
      await interaction.reply({ content: 'This poll is no longer active.', ephemeral: true });
      return;
    }

    const channel = interaction.channel as TextChannel;
    const pollMessage = await channel.messages.fetch(pollMessageId);
    if (pollMessage) {
      await pollMessage.edit({
        embeds: [resultsEmbed],
        components: []
      });
    }

    await interaction.reply({ content: 'Poll ended successfully.', ephemeral: true });
    logger.info(`Poll ${pollMessageId} ended early by ${interaction.user.tag}`);
  },
};