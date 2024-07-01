import fs from 'fs';
import path from 'path';
import { SelectMenu } from '../types/selectMenu';
import { CustomClient } from '../types/customClient';
import { logger } from './logger';

export function registerSelectMenus(client: CustomClient): void {
  const selectMenusPath = path.join(__dirname, '..', 'selectMenus');
  let menuCount = 0;
  
  function readSelectMenus(dir: string) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        readSelectMenus(filePath);
      } else if (file.name.endsWith('.ts')) {
        const menu = require(filePath) as SelectMenu;
        if ('name' in menu && 'execute' in menu) {
          client.selectMenus.set(menu.name, menu);
          menuCount++;
        }
      }
    }
  }

  readSelectMenus(selectMenusPath);
  logger.info(`Loaded ${menuCount} select menus`);
}