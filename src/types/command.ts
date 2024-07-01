import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export interface Command {
  data: SlashCommandBuilder;
  category: string; // New property for category
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}