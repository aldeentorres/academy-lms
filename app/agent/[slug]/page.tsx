import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import AgentPhoto from '@/components/AgentPhoto';

async function getAgent(slug: string) {
  try {
    // Try to find by slug first
    let agent;
    try {
      agent = await prisma.agent.findUnique({
      where: { slug },
      include: {
        submissions: {
          include: {
            assignment: {
              include: {
                course: {
                  include: {
                    category: true,
                    country: true,
                  },
                },
                lesson: {
                  include: {
                    course: {
                      include: {
                        category: true,
                        country: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });
    } catch (error: any) {
      // If slug column doesn't exist, try to find by ID or name
      if (error.message?.includes('Unknown column') || 
          error.message?.includes('no such column') ||
          error.message?.includes('Argument `slug` is missing')) {
        console.error('Slug column does not exist. Please run: npm run db:push');
        // Try to find by ID or get all agents and match by name
        const allAgents = await prisma.agent.findMany();
        const matchedAgent = allAgents.find((a: any) => {
          const agentSlug = a.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return agentSlug === slug || a.id === slug;
        });
        if (matchedAgent) {
          agent = await prisma.agent.findUnique({
            where: { id: matchedAgent.id },
            include: {
              submissions: {
                include: {
                  assignment: {
                    include: {
                      course: {
                        include: {
                          category: true,
                          country: true,
                        },
                      },
                      lesson: {
                        include: {
                          course: {
                            include: {
                              category: true,
                              country: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
                orderBy: { submittedAt: 'desc' },
              },
            },
          });
        }
      } else {
        throw error;
      }
    }

    // If not found by slug, try by ID (for backward compatibility)
    if (!agent) {
      agent = await prisma.agent.findUnique({
        where: { id: slug },
        include: {
          submissions: {
            include: {
              assignment: {
                include: {
                  course: {
                    include: {
                      category: true,
                      country: true,
                    },
                  },
                  lesson: {
                    include: {
                      course: {
                        include: {
                          category: true,
                          country: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: { submittedAt: 'desc' },
          },
        },
      });
    }

    return agent;
  } catch (error) {
    console.error('Error fetching agent:', error);
    return null;
  }
}

// Calculate agent statistics
function calculateStats(submissions: any[]) {
  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter((s) => s.score !== null);
  const totalScore = gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);
  const averageScore = gradedSubmissions.length > 0 ? totalScore / gradedSubmissions.length : 0;
  const completedAssignments = gradedSubmissions.length;
  const totalPoints = submissions.reduce((sum, s) => sum + (s.assignment?.maxPoints || 0), 0);
  const earnedPoints = gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);
  const completionRate = totalSubmissions > 0 ? (completedAssignments / totalSubmissions) * 100 : 0;

  // Calculate level based on total points earned
  const level = Math.floor(earnedPoints / 100) + 1;

  return {
    totalSubmissions,
    completedAssignments,
    averageScore: Math.round(averageScore),
    totalPoints,
    earnedPoints,
    completionRate: Math.round(completionRate),
    level,
  };
}

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = await getAgent(slug);

  if (!agent) {
    notFound();
  }

  const stats = calculateStats(agent.submissions);

  // Calculate achievements
  const achievements = [];
  if (stats.level >= 5) achievements.push({ name: 'Expert Agent', icon: '⭐', description: 'Reached Level 5' });
  if (stats.completedAssignments >= 10) achievements.push({ name: 'Dedicated Learner', icon: '🎓', description: 'Completed 10+ assignments' });
  if (stats.averageScore >= 90) achievements.push({ name: 'High Achiever', icon: '🏆', description: 'Average score above 90%' });
  if (stats.completionRate >= 80) achievements.push({ name: 'Consistent Performer', icon: '📈', description: '80%+ completion rate' });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Photo Frame */}
            <div className="flex-shrink-0">
              <AgentPhoto
                photo={agent.photo}
                name={agent.name}
                size="md"
                showLevelBadge={true}
                level={stats.level}
              />
            </div>

            {/* Agent Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{agent.name}</h1>
              <p className="text-base text-gray-700 font-medium">{agent.email}</p>
              {agent.apiId && (
                <p className="text-sm text-gray-600 mt-2 font-mono bg-gray-50 px-3 py-1 rounded-md inline-block">API ID: {agent.apiId}</p>
              )}
            </div>

            {/* Level Badge */}
            <div className="text-center md:text-right">
              <div className="inline-block bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl px-6 py-4 shadow-lg">
                <div className="text-5xl font-bold text-white">Level {stats.level}</div>
                <div className="text-sm font-semibold text-primary-100 mt-1">Agent Level</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.completedAssignments}</div>
            <div className="text-sm font-semibold text-gray-700">Completed Assignments</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="text-3xl font-bold text-primary-600 mb-2">{stats.averageScore}%</div>
            <div className="text-sm font-semibold text-gray-700">Average Score</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.earnedPoints}</div>
            <div className="text-sm font-semibold text-gray-700">Total Points Earned</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.completionRate}%</div>
            <div className="text-sm font-semibold text-gray-700">Completion Rate</div>
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="border-2 border-yellow-400 rounded-xl p-6 text-center bg-gradient-to-br from-yellow-50 to-amber-50 shadow-md hover:shadow-lg transition"
                >
                  <div className="text-5xl mb-3">{achievement.icon}</div>
                  <div className="font-bold text-gray-900 text-lg mb-1">{achievement.name}</div>
                  <div className="text-sm font-medium text-gray-700">{achievement.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submissions History */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Assignment Submissions</h2>
          {agent.submissions.length > 0 ? (
            <div className="space-y-4">
              {agent.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {submission.assignment.lesson
                          ? `${submission.assignment.lesson.course.title} - ${submission.assignment.lesson.title}`
                          : submission.assignment.course.title}
                      </h3>
                      <p className="text-base font-medium text-gray-700 mt-1 mb-3">
                        {submission.assignment.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-semibold">
                          {submission.assignment.lesson
                            ? submission.assignment.lesson.course.category.name
                            : submission.assignment.course.category.name}
                        </span>
                        {(submission.assignment.lesson
                          ? submission.assignment.lesson.course.country
                          : submission.assignment.course.country) && (
                          <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full font-medium">
                            {(submission.assignment.lesson
                              ? submission.assignment.lesson.course.country
                              : submission.assignment.course.country)?.name}
                          </span>
                        )}
                        <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full font-medium">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-6">
                      {submission.score !== null ? (
                        <>
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            {submission.score}/{submission.assignment.maxPoints}
                          </div>
                          <div className="text-sm font-semibold text-gray-700">
                            {Math.round((submission.score / submission.assignment.maxPoints) * 100)}%
                          </div>
                        </>
                      ) : (
                        <div className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-semibold">
                          Pending
                        </div>
                      )}
                    </div>
                  </div>
                  {submission.feedback && (
                    <div className="mt-4 p-4 bg-primary-50 rounded-lg border-l-4 border-primary-500">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Feedback:</p>
                      <p className="text-base text-gray-700 leading-relaxed">
                        {submission.feedback}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium text-gray-700">No submissions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
