import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll one or more dice')
    .addIntegerOption(option => 
      option.setName('count')
        .setDescription('Number of dice to roll')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10)
    )
    .addIntegerOption(option => 
      option.setName('sides')
        .setDescription('Number of sides on each die')
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(100)
    ),
  category: 'Utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const count = interaction.options.getInteger('count', true);
    const sides = interaction.options.getInteger('sides', true);

    // Roll the dice
    const rolls: number[] = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }

    // Calculate the total
    const total = rolls.reduce((sum, roll) => sum + roll, 0);

    // Create an embed for the response
    const embed = new EmbedBuilder()
      .setColor('#FF69B4')  // Hot Pink
      .setTitle(`🎲 Dice Roll: ${count}d${sides}`)
      .setDescription(`You rolled ${count} ${sides}-sided ${count === 1 ? 'die' : 'dice'}.`)
      .addFields(
        { name: 'Rolls', value: rolls.join(', '), inline: false },
        { name: 'Total', value: total.toString(), inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'Roll again by using /dice' });

    // Reply to the interaction with the embed
    await interaction.reply({ embeds: [embed] });
  },
};