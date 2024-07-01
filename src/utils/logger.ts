import { blue, green, yellow, red, gray } from 'colorette';

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (level >= this.logLevel) {
      const timestamp = new Date().toISOString();
      let coloredMessage: string;

      switch (level) {
        case LogLevel.DEBUG:
          coloredMessage = blue(`[DEBUG] ${message}`);
          break;
        case LogLevel.INFO:
          coloredMessage = green(`[INFO] ${message}`);
          break;
        case LogLevel.WARN:
          coloredMessage = yellow(`[WARN] ${message}`);
          break;
        case LogLevel.ERROR:
          coloredMessage = red(`[ERROR] ${message}`);
          break;
      }

      console.log(gray(`[${timestamp}]`), coloredMessage, ...args);
    }
  }

  debug(message: string, ...args: any[]) {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log(LogLevel.INFO, message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log(LogLevel.WARN, message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log(LogLevel.ERROR, message, ...args);
  }
}

export const logger = Logger.getInstance();
export { LogLevel };