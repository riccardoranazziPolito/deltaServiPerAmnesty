import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminExists = await prisma.user.findUnique({
    where: { username: 'admin' }
  })

  if (!adminExists) {
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@deltaservice.it',
        firstName: 'Admin',
        lastName: 'Sistema',
        passwordHash: 'admin123',
        role: 'ADMIN',
      },
    })
    console.log('Admin user created: admin / admin123')
  } else {
    console.log('Admin user already exists.')
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
