import { PrismaClient } from '@prisma/client'
import { logger } from './logger';

const prisma = new PrismaClient()

async function connectDatabase() {
    logger.warn('Attempting to connect to the database...')
  try {
    await prisma.$connect();
  } catch (error) {
    logger.error('Failed to connect to the database:', error)
    process.exit(1)
  }
}

// Call this function when your application starts
connectDatabase()

// Gracefully disconnect when the application shuts down
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  logger.info('Disconnected from the database')
  process.exit(0)
})

export default prisma