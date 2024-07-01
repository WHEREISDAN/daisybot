import { ButtonInteraction } from 'discord.js';

export interface Button {
  name: string;
  execute: (interaction: ButtonInteraction, args: string[]) => Promise<void>;
}