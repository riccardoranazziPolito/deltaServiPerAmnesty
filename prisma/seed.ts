import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
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
