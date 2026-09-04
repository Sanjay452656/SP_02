import { Router, Response } from 'express';
import { prisma } from '../prismaClient';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.sendStatus(401);

    const now = new Date();
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // --- Core counts ---
    const totalSolved = await prisma.userQuestion.count({ where: { userId } });
    const needRevisionToday = await prisma.revision.count({
      where: { completed: false, scheduledDate: { lte: todayEnd }, userQuestion: { userId } }
    });
    const strongQuestions = await prisma.userQuestion.count({
      where: { userId, confidenceLevel: { gte: 4 } }
    });
    const weakQuestions = await prisma.userQuestion.count({
      where: { userId, confidenceLevel: { lt: 4 } }
    });

    // --- Retention rate ---
    const totalRevisions = await prisma.revision.count({ where: { userQuestion: { userId } } });
    const completedRevisions = await prisma.revision.count({ where: { completed: true, userQuestion: { userId } } });
    const retentionRate = totalRevisions > 0 ? Math.round((completedRevisions / totalRevisions) * 100) : 0;

    // --- Streak ---
    const allSolves = await prisma.userQuestion.findMany({
      where: { userId },
      select: { solvedDate: true },
      orderBy: { solvedDate: 'desc' }
    });
    let streak = 0;
    const seenDays = new Set<string>();
    for (const s of allSolves) {
      seenDays.add(s.solvedDate.toISOString().split('T')[0]);
    }
    let checkDate = new Date(todayStart);
    while (true) {
      const key = checkDate.toISOString().split('T')[0];
      if (seenDays.has(key)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // --- Heatmap: last 84 days ---
    const heatmapStart = new Date(now);
    heatmapStart.setDate(heatmapStart.getDate() - 83);
    heatmapStart.setHours(0, 0, 0, 0);
    const recentSolves = await prisma.userQuestion.findMany({
      where: { userId, solvedDate: { gte: heatmapStart } },
      select: { solvedDate: true }
    });
    const heatmapMap: Record<string, number> = {};
    for (const s of recentSolves) {
      const key = s.solvedDate.toISOString().split('T')[0];
      heatmapMap[key] = (heatmapMap[key] || 0) + 1;
    }
    const heatmap = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      heatmap.push({ date: key, count: heatmapMap[key] || 0 });
    }

    // --- Topic + difficulty breakdown ---
    const allUserQuestions = await prisma.userQuestion.findMany({
      where: { userId },
      include: { question: { select: { topic: true, difficulty: true } } }
    });
    const topicMap: Record<string, number> = {};
    const difficultyMap: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    for (const uq of allUserQuestions) {
      const topic = uq.question?.topic || 'General';
      topicMap[topic] = (topicMap[topic] || 0) + 1;
      const diff = uq.question?.difficulty || 'Easy';
      if (difficultyMap[diff] !== undefined) difficultyMap[diff]++;
    }
    const topicBreakdown = Object.entries(topicMap)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // --- Upcoming revisions next 7 days ---
    const next7Days = new Date(now);
    next7Days.setDate(next7Days.getDate() + 7);
    const upcoming = await prisma.revision.findMany({
      where: { completed: false, scheduledDate: { gte: todayStart, lte: next7Days }, userQuestion: { userId } },
      include: { userQuestion: { include: { question: true } } },
      orderBy: { scheduledDate: 'asc' },
      take: 10
    });

    // --- Recent 5 solves ---
    const recentActivity = await prisma.userQuestion.findMany({
      where: { userId },
      include: { question: true },
      orderBy: { solvedDate: 'desc' },
      take: 5
    });

    res.json({
      totalSolved, needRevisionToday, retentionRate, strongQuestions, weakQuestions, streak,
      heatmap, topicBreakdown, difficultyBreakdown: difficultyMap,
      upcoming: upcoming.map((u: any) => ({
        id: u.id,
        scheduledDate: u.scheduledDate,
        revisionNumber: u.revisionNumber,
        title: u.userQuestion.question.title,
        difficulty: u.userQuestion.question.difficulty,
        problemLink: u.userQuestion.question.problemLink,
      })),
      recentActivity: recentActivity.map((uq: any) => ({
        id: uq.id,
        title: uq.question.title,
        difficulty: uq.question.difficulty,
        topic: uq.question.topic,
        solvedDate: uq.solvedDate,
        confidenceLevel: uq.confidenceLevel,
        problemLink: uq.question.problemLink,
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
