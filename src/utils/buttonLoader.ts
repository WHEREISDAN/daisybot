import fs from 'fs';
import path from 'path';
import { Button } from '../types/button';
import { CustomClient } from '../types/customClient';
import { logger } from './logger';

export function registerButtons(client: CustomClient): void {
  const buttonsPath = path.join(__dirname, '..', 'buttons');
  let buttonCount = 0;
  
  function readButtons(dir: string) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        readButtons(filePath);
      } else if (file.name.endsWith('.ts')) {
        const button = require(filePath) as Button;
        if ('name' in button && 'execute' in button) {
          client.buttons.set(button.name, button);
          buttonCount++;
        }
      }
    }
  }

  readButtons(buttonsPath);
  logger.info(`Loaded ${buttonCount} buttons`);
}