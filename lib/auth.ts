import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  return session.user;
}

export async function requireAgent() {
  const session = await getSession();
  if (!session || session.user.role !== 'agent') {
    const error = new Error('Unauthorized: Agent access required');
    (error as any).statusCode = 401;
    throw error;
  }
  return session.user;
}
