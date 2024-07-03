import { ButtonInteraction, EmbedBuilder, TextChannel } from 'discord.js';
import { Button } from '../../types/button';
import { pollManager } from '../../utils/pollManager';
import { logger } from '../../utils/logger';

export const button: Button = {
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