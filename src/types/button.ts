import { ButtonInteraction } from 'discord.js';

export interface ButtonData {
  name: string;
  // Add any other properties you want to include in button data
}

export interface Button {
  data: ButtonData;
  execute: (interaction: ButtonInteraction, args: string[]) => Promise<void>;
}