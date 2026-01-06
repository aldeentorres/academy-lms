import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Setting up agent passwords...');

  const defaultPassword = 'agent123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // Update all agents with a default password
  const agents = await prisma.agent.findMany();

  if (agents.length === 0) {
    console.log('⚠️  No agents found. Please run seed scripts first to create agents.');
    return;
  }

  for (const agent of agents) {
    await prisma.agent.update({
      where: { id: agent.id },
      data: { password: hashedPassword },
    });
    console.log(`✅ Set password for: ${agent.email} (${agent.name})`);
  }

  console.log('');
  console.log('✅ Agent passwords set successfully!');
  console.log('');
  console.log('📋 Agent Login Credentials:');
  console.log('   Password for all agents: agent123');
  console.log('');
  console.log('Available agents:');
  agents.forEach((agent, index) => {
    console.log(`   ${index + 1}. Email: ${agent.email}`);
    console.log(`      Name: ${agent.name}`);
    console.log(`      Slug: ${agent.slug}`);
    console.log('');
  });
  console.log('⚠️  Change these passwords after first login for security!');
}

main()
  .catch((e) => {
    console.error('❌ Error setting agent passwords:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
