import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Calculate agent statistics for leaderboard
function calculateAgentStats(submissions: any[]) {
  const gradedSubmissions = submissions.filter((s) => s.score !== null);
  const totalScore = gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);
  const averageScore = gradedSubmissions.length > 0 ? totalScore / gradedSubmissions.length : 0;
  const earnedPoints = gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);
  const totalPoints = submissions.reduce((sum, s) => sum + (s.assignment?.maxPoints || 0), 0);
  const level = Math.floor(earnedPoints / 100) + 1;
  const completedAssignments = gradedSubmissions.length;

  return {
    totalSubmissions: submissions.length,
    completedAssignments,
    averageScore: Math.round(averageScore),
    earnedPoints,
    totalPoints,
    level,
  };
}

async function getAgentsLeaderboard() {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        submissions: {
          include: {
            assignment: {
              select: {
                maxPoints: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate stats for each agent and sort by earned points (descending)
    const agentsWithStats = agents.map((agent) => {
      const stats = calculateAgentStats(agent.submissions);
      return {
        ...agent,
        stats,
      };
    });

    // Sort by earned points (descending), then by average score, then by completed assignments
    agentsWithStats.sort((a, b) => {
      if (b.stats.earnedPoints !== a.stats.earnedPoints) {
        return b.stats.earnedPoints - a.stats.earnedPoints;
      }
      if (b.stats.averageScore !== a.stats.averageScore) {
        return b.stats.averageScore - a.stats.averageScore;
      }
      return b.stats.completedAssignments - a.stats.completedAssignments;
    });

    // Log for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Agents Page] Found ${agentsWithStats.length} agents`);
    }
    
    return agentsWithStats;
  } catch (error) {
    console.error('Error fetching agents leaderboard:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    return [];
  }
}

export default async function AgentsLeaderboardPage() {
  const agents = await getAgentsLeaderboard();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 border-gray-300';
    if (rank === 3) return 'bg-orange-100 border-orange-300';
    return 'bg-white border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Agents Leaderboard</h1>
          <p className="text-lg text-gray-600">
            Top performing agents ranked by points, scores, and achievements
          </p>
        </div>

        {/* Stats Summary */}
        {agents.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Agents</p>
                  <p className="text-2xl font-semibold text-gray-900">{agents.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Submissions</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {agents.reduce((sum, a) => sum + a.stats.totalSubmissions, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Points</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {agents.reduce((sum, a) => sum + a.stats.earnedPoints, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Score</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {(() => {
                      const totalAvg = agents
                        .filter(a => a.stats.completedAssignments > 0)
                        .reduce((sum, a) => sum + a.stats.averageScore, 0);
                      const count = agents.filter(a => a.stats.completedAssignments > 0).length;
                      return count > 0 ? Math.round(totalAvg / count) : 0;
                    })()}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {agents.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-primary-600 to-primary-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                      Avg Score
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agents.map((agent, index) => {
                    const rank = index + 1;
                    const stats = agent.stats;

                    return (
                      <tr
                        key={agent.id}
                        className={`hover:bg-gray-50 transition-colors ${getRankColor(rank)}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-2xl font-bold text-gray-900">
                              {getRankIcon(rank)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {agent.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {agent.name}
                              </div>
                              <div className="text-sm text-gray-500">{agent.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary-100 text-primary-800">
                            Level {stats.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-lg font-bold text-gray-900">
                            {stats.earnedPoints}
                          </div>
                          <div className="text-xs text-gray-500">
                            / {stats.totalPoints} total
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {stats.completedAssignments > 0 ? (
                            <div className="flex items-center justify-center">
                              <span className={`text-lg font-bold ${
                                stats.averageScore >= 90
                                  ? 'text-green-600'
                                  : stats.averageScore >= 75
                                  ? 'text-primary-600'
                                  : 'text-gray-600'
                              }`}>
                                {stats.averageScore}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {stats.completedAssignments}
                          </div>
                          <div className="text-xs text-gray-500">
                            / {stats.totalSubmissions} total
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Link
                            href={`/agent/${agent.slug || agent.id}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                          >
                            View Profile
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Agents Yet</h3>
            <p className="text-gray-500">Agents will appear here once they start submitting assignments.</p>
          </div>
        )}
      </div>
    </div>
  );
}
