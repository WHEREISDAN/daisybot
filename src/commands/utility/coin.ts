import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coin')
        .setDescription('Flips a coin and returns heads or tails'),
    category: 'Utility',
    async execute(interaction: CommandInteraction) {
        // Generate a random boolean (true or false)
        const isHeads = Math.random() < 0.5;

        // Determine the result
        const result = isHeads ? 'Heads' : 'Tails';

        // Create an embed for the response
        const embed = new EmbedBuilder()
            .setColor(isHeads ? '#FF69B4' : '#FFC0CB') // Gold for Heads, Silver for Tails
            .setTitle('Coin Flip Result')
            .setDescription(`The coin landed on: **${result}**!`)
            .setThumbnail(isHeads
                ? 'https://i.imgur.com/jTGm7MF.png'  // URL for Heads image
                : 'https://i.imgur.com/rqpP8aI.png'  // URL for Tails image
            )
            .setTimestamp()
            .setFooter({ text: 'Flip again by using /coin' });

        // Reply to the interaction with the embed
        await interaction.reply({ embeds: [embed] });
    },
};