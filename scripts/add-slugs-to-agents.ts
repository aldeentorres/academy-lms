import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('🔄 Adding slugs to existing agents...\n');

  try {
    // Get all agents first (this will work even if slug column doesn't exist yet)
    const allAgents = await prisma.agent.findMany();
    
    // Filter agents that need slugs (handle case where slug column might not exist)
    const agents = allAgents.filter((a: any) => {
      // Check if slug property exists and is null/empty
      return !('slug' in a) || !a.slug || a.slug === '';
    });

    if (agents.length === 0) {
      console.log('✅ All agents already have slugs!');
      return;
    }

    console.log(`Found ${agents.length} agent(s) without slugs.\n`);

    for (const agent of agents) {
      const slug = generateSlug(agent.name);
      
      // Check if slug already exists
      const existingAgent = await prisma.agent.findUnique({
        where: { slug },
      });

      let finalSlug = slug;
      if (existingAgent && existingAgent.id !== agent.id) {
        // If slug exists, append a number
        let counter = 1;
        while (await prisma.agent.findUnique({ where: { slug: `${slug}-${counter}` } })) {
          counter++;
        }
        finalSlug = `${slug}-${counter}`;
      }

      await prisma.agent.update({
        where: { id: agent.id },
        data: { slug: finalSlug },
      });

      console.log(`✅ Updated ${agent.name} → slug: ${finalSlug}`);
    }

    console.log('\n✅ All agents now have slugs!');
  } catch (error: any) {
    if (error.message?.includes('Unknown column') || error.message?.includes('no such column')) {
      console.error('❌ Error: The `slug` column does not exist in the database.');
      console.error('   Please run: npm run db:push');
      console.error('   This will add the slug column to the Agent table.\n');
    } else {
      console.error('❌ Error:', error);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  });
