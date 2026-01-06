import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    // Admin Login
    CredentialsProvider({
      id: 'admin',
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || user.role !== 'admin') {
          return null;
        }

        // Check if password matches
        if (!user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: 'admin',
        };
      },
    }),
    // Agent Login (with API placeholder)
    CredentialsProvider({
      id: 'agent',
      name: 'Agent',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // TODO: Replace with API call when ready
        // For now, check local database
        const agent = await prisma.agent.findUnique({
          where: { email: credentials.email },
        });

        if (!agent) {
          // Placeholder: Try API authentication (when implemented)
          // const apiResponse = await fetch('YOUR_API_URL/auth', {
          //   method: 'POST',
          //   body: JSON.stringify({ email, password }),
          // });
          // if (apiResponse.ok) {
          //   const apiData = await apiResponse.json();
          //   // Create or update agent in local DB
          //   return { id: apiData.id, email: apiData.email, name: apiData.name, role: 'agent' };
          // }
          return null;
        }

        // For now, simple check (you'll implement proper auth later)
        // When API is ready, remove this and use API authentication above
        
        // TODO: Implement API authentication
        // Uncomment when API is ready:
        // const apiAgent = await authenticateAgentViaAPI(
        //   credentials.email,
        //   credentials.password
        // );
        // if (apiAgent) {
        //   return {
        //     id: apiAgent.id,
        //     email: apiAgent.email,
        //     name: apiAgent.name,
        //     role: 'agent',
        //   };
        // }

        // Check password if it exists
        if (agent.password) {
          const isValid = await bcrypt.compare(credentials.password, agent.password);
          if (!isValid) {
            return null;
          }
        } else {
          // If no password is set, allow login (for backward compatibility)
          // This will be removed when all agents have passwords
        }
        
        // Generate slug if it doesn't exist (for backward compatibility)
        let slug = agent.slug;
        if (!slug) {
          slug = agent.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
        
        return {
          id: agent.id,
          email: agent.email,
          name: agent.name,
          slug: slug,
          role: 'agent',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.slug = (user as any).slug;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.slug = token.slug as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
