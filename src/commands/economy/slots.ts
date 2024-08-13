import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { getCurrency, addCurrency, removeCurrency } from '../../utils/database';
import { generateSlotsImage } from '../../utils/imageGenerator';
import { logger } from '../../utils/logger';

const SLOTS = ['🍇', '🍊', '🍐', '🍒', '🍋', '💀', '💎'];
const COOLDOWN = 15 * 1000; // 15 seconds cooldown
const userCooldowns = new Map<string, number>();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Try your luck with the slot machine!')
        .addIntegerOption(option =>
            option.setName('bet')
                .setDescription('The amount of coins to bet')
                .setRequired(true)
                .setMinValue(1)
        ),
    category: 'Economy',
    async execute(interaction: ChatInputCommandInteraction) {
        const userId = interaction.user.id;
        const bet = interaction.options.getInteger('bet', true);
        const now = Date.now();
        const cooldownExpiration = userCooldowns.get(userId) ?? 0;

        if (now < cooldownExpiration) {
            const remainingTime = Math.ceil((cooldownExpiration - now) / 1000);
            return interaction.reply(`You can use the slots again in ${remainingTime} seconds.`);
        }

        try {
            const currentBalance = await getCurrency(userId);

            if (currentBalance < bet) {
                return interaction.reply({ content: "You don't have enough coins for this bet!", ephemeral: true });
            }

            // Initial reply
            await interaction.reply('Spinning the slots...');

            // Simulate spinning
            for (let i = 0; i < 4; i++) {
                const tempSlots = [
                    SLOTS[Math.floor(Math.random() * SLOTS.length)],
                    SLOTS[Math.floor(Math.random() * SLOTS.length)],
                    SLOTS[Math.floor(Math.random() * SLOTS.length)]
                ];
                await new Promise(resolve => setTimeout(resolve, 500));
                await interaction.editReply(`${tempSlots.join(' | ')}`);
            }

            // Final spin
            const result = spinSlots();
            await new Promise(resolve => setTimeout(resolve, 500));
            await interaction.editReply(`${result.join(' | ')}`);

            // Calculate winnings
            const { winnings, title, description } = calculateWinnings(bet, result, interaction.user.username);

            // Update user's balance
            const newBalance = await (winnings > 0 ? addCurrency(userId, winnings - bet) : removeCurrency(userId, bet));

            userCooldowns.set(userId, now + COOLDOWN);

            // Generate image for the slots result
            const slotsImage = await generateSlotsImage(
                interaction.user.username,
                interaction.user.displayAvatarURL({ extension: 'png', size: 256 }),
                result,
                winnings,
                newBalance,
                title,
                description
            );
            const attachment = new AttachmentBuilder(slotsImage, { name: 'slots_result.png' });

            await interaction.followUp({ files: [attachment] });

        } catch (error) {
            logger.error('Error in slots command:', error);
            await interaction.followUp({ content: 'There was an error while playing slots. Please try again later.', ephemeral: true });
        }
    },
};

function spinSlots(): string[] {
    return Array(3).fill(null).map(() => SLOTS[Math.floor(Math.random() * SLOTS.length)]);
}

function calculateWinnings(bet: number, result: string[], username: string): { winnings: number, title: string, description: string } {
    const [slot1, slot2, slot3] = result;
    let winnings = 0;
    let title = '';
    let description = '';

    const skulls = result.filter(slot => slot === '💀').length;
    const uniqueSymbols = new Set(result).size;

    if (slot1 === '💎' && slot2 === '💎' && slot3 === '💎') {
        winnings = bet * 100;
        title = '💎 Jackpot! 💎';
        description = `Diamonds! You hit the jackpot and won ${winnings} coins, ${username}!`;
    } else if (skulls > 0) {
        winnings = 0;
        title = 'Skull and Crossbones';
        description = `Skulls spell doom! You lost all ${bet} coins, ${username}!`;
    } else if (uniqueSymbols === 1) {
        winnings = slot1 === '🍇' ? bet * 5 : bet * 3;
        title = 'Triple Match!';
        description = `Incredible! You won ${winnings} coins, ${username}!`;
    } else if (uniqueSymbols === 2) {
        winnings = bet * 2;
        title = 'Double Match!';
        description = `Nice one! You won ${winnings} coins, ${username}!`;
    } else {
        // Diminishing returns cases
        if (result.includes('🍋')) {
            winnings = Math.floor(bet * 0.75);
            title = 'A Glimmer of Lemon!';
            description = `When life gives you lemons... You get ${winnings} coins back, ${username}.`;
        } else if (result.includes('🍒')) {
            winnings = Math.floor(bet * 0.5);
            title = 'Cherry on Top';
            description = `Not quite the jackpot, but the cherry saves you. You get ${winnings} coins back, ${username}.`;
        } else if (result.includes('🍊')) {
            winnings = Math.floor(bet * 0.25);
            title = 'Orange You Glad?';
            description = `It's not a total loss! You squeeze out ${winnings} coins, ${username}.`;
        } else {
            winnings = 0;
            title = 'Fruit Salad';
            description = `A mix of everything, but nothing matches. You lost ${bet} coins, ${username}.`;
        }
    }

    // Adjust description for partial losses
    if (winnings > 0 && winnings < bet) {
        description += ` You still lost ${bet - winnings} coins overall.`;
    }

    return { winnings, title, description };
}