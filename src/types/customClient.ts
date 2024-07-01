import { Client, Collection } from 'discord.js';
import { Command } from './command';
import { Button } from './button';
import { SelectMenu } from './selectMenu';

export class CustomClient extends Client {
  commands: Collection<string, Command>;
  buttons: Collection<string, Button>;
  selectMenus: Collection<string, SelectMenu>;

  constructor(options: any) {
    super(options);
    this.commands = new Collection();
    this.buttons = new Collection();
    this.selectMenus = new Collection();
  }
}