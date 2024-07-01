import fs from 'fs';
import path from 'path';
import { CustomClient } from '../types/customClient';
import { logger } from './logger';

export function registerEvents(client: CustomClient): void {
  const eventsPath = path.join(__dirname, '..', 'events');
  let eventCount = 0;
  
  function readEvents(dir: string) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        readEvents(filePath);
      } else if (file.name.endsWith('.ts')) {
        const event = require(filePath);
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args));
        } else {
          client.on(event.name, (...args) => event.execute(...args));
        }
        eventCount++;
      }
    }
  }

  readEvents(eventsPath);
  logger.info(`Loaded ${eventCount} events`);
}