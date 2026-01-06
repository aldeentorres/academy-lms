import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📋 Agent List:\n');
  
  const agents = await prisma.agent.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      slug: true,
      apiId: true,
      _count: {
        select: {
          submissions: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (agents.length === 0) {
    console.log('❌ No agents found in database.');
    console.log('\n💡 Run: npm run db:seed-sample');
    console.log('   This will create a sample agent with email: agent@example.com\n');
  } else {
    agents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name}`);
      console.log(`   Email: ${agent.email}`);
      console.log(`   Slug: ${agent.slug}`);
      console.log(`   ID: ${agent.id}`);
      if (agent.apiId) {
        console.log(`   API ID: ${agent.apiId}`);
      }
      console.log(`   Submissions: ${agent._count.submissions}`);
      console.log(`   Profile URL: http://localhost:3000/agent/${agent.slug}`);
      console.log('');
    });
  }

  await prisma.$disconnect();
}

main().catch(console.error);
