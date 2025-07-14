
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // By deleting users, the `onDelete: Cascade` in the schema will automatically delete related
  // positions, signals, and badges, simplifying the cleanup process.
  await prisma.user.deleteMany();
  console.log('Old users and all related data cleaned up.');

  const user = await prisma.user.create({
    data: {
      username: 'Shadow_Operator_007',
      shadowId: `SHDW-OPERATOR`,
      weeklyPoints: 1250,
      airdropPoints: 5500,
      status: 'Registered',
      claimedMissions: '["mission_first_signal", "mission_x"]',
      email: 'operator@blockshadow.ai',
      wallet_address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      wallet_type: 'ETH',
      x_handle: '@blockshadow_ai'
    },
  })

  console.log(`Created user with id: ${user.id}`);

  // Create a sample badge for the user
  await prisma.badge.create({
    data: {
        name: 'Genesis Operator',
        description: 'Awarded to the first user of the SHADOW system.',
        icon: 'ShieldCheck',
        userId: user.id,
    }
  });

  console.log('Created sample badge.');

  // Note: Positions and GeneratedSignals are no longer seeded,
  // as they are now managed in the client's localStorage.

  console.log(`Seeding finished.`)
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
