import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log('Successfully connected to the database')
  } catch (error) {
    console.error('Failed to connect to the database:', error)
    process.exit(1)
  }
}

// Call this function when your application starts
connectDatabase()

// Gracefully disconnect when the application shuts down
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  console.log('Disconnected from the database')
  process.exit(0)
})

export default prisma