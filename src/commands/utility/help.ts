import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { CustomClient } from '../../types/customClient';

const COMMANDS_PER_PAGE = 5;

interface CommandsByCategory {
  [category: string]: { name: string; description: string }[];
}

const helpCommand = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows a list of available commands'),
  category: 'Utility', // Add the category for the help command itself

  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client as CustomClient;
    const commands = Array.from(client.commands.values());

    // Sort commands by category
    const commandsByCategory: CommandsByCategory = commands.reduce((acc, command) => {
      if (!acc[command.category]) {
        acc[command.category] = [];
      }
      acc[command.category].push({ name: command.data.name, description: command.data.description });
      return acc;
    }, {} as CommandsByCategory);

    // Flatten the commands into a single array for pagination
    const allCommands = Object.entries(commandsByCategory).flatMap(([category, cmds]) => 
      [{ name: category, description: '---' }, ...cmds]
    );

    const totalPages = Math.ceil(allCommands.length / COMMANDS_PER_PAGE);

    const generateEmbed = (page: number) => {
      const embed = new EmbedBuilder()
        .setColor('#FF69B4')
        .setTitle('📚 Command Help Menu')
        .setDescription('Here\'s a list of all available commands:')
        .setFooter({ text: `Page ${page + 1} of ${totalPages} • Use the buttons to navigate` })
        .setTimestamp();

      const start = page * COMMANDS_PER_PAGE;
      const end = start + COMMANDS_PER_PAGE;
      const pageCommands = allCommands.slice(start, end);

      let currentCategory = '';
      pageCommands.forEach(cmd => {
        if (cmd.description === '---') {
          currentCategory = cmd.name;
          embed.addFields({ name: `\n__${currentCategory}__`, value: '\u200B' });
        } else {
          embed.addFields({ 
            name: `/${cmd.name}`, 
            value: cmd.description || 'No description provided',
            inline: false
          });
        }
      });

      return embed;
    };

    let currentPage = 0;

    const buttonsRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('help:prev')
          .setLabel('◀ Previous')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('help:next')
          .setLabel('Next ▶')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(totalPages <= 1)
      );

    const response = await interaction.reply({
      embeds: [generateEmbed(currentPage)],
      components: totalPages > 1 ? [buttonsRow] : [],
      fetchReply: true
    });

    if (totalPages <= 1) return;

    const collector = response.createMessageComponentCollector({ time: 3_600_000 }); // 1 hour

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        await i.reply({ content: 'This button is not for you!', ephemeral: true });
        return;
      }

      if (i.customId === 'help:prev') {
        currentPage = Math.max(0, currentPage - 1);
      } else if (i.customId === 'help:next') {
        currentPage = Math.min(totalPages - 1, currentPage + 1);
      }

      const embed = generateEmbed(currentPage);
      const components = buttonsRow
        .setComponents(
          ButtonBuilder.from(buttonsRow.components[0] as ButtonBuilder).setDisabled(currentPage === 0),
          ButtonBuilder.from(buttonsRow.components[1] as ButtonBuilder).setDisabled(currentPage === totalPages - 1)
        );

      await i.update({ embeds: [embed], components: [components] });
    });

    collector.on('end', () => {
      if (response.editable) {
        response.edit({ components: [] });
      }
    });
  },
};

export default helpCommand;