import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Get today's revisions
router.get('/today', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.sendStatus(401);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const revisions = await prisma.revision.findMany({
      where: {
        completed: false,
        scheduledDate: {
          lte: today,
        },
        userQuestion: {
          userId
        }
      },
      include: {
        userQuestion: {
          include: {
            question: true
          }
        }
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });

    res.json(revisions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Calculate next interval based on simple spaced repetition logic
// 1 -> 3 -> 7 -> 15 -> 30 -> 60 -> 120
const getNextInterval = (currentRevisionNumber: number, feedback: 'Easily' | 'With Hint' | 'Completely Forgot') => {
  const schedule = [1, 3, 7, 15, 30, 60, 120];
  
  if (feedback === 'Completely Forgot') {
    return { interval: schedule[0], nextRevisionNumber: 1 };
  }
  
  if (feedback === 'With Hint') {
    // Repeat same interval or slightly increase
    const nextIdx = Math.max(0, currentRevisionNumber - 1);
    return { interval: schedule[nextIdx] || 120, nextRevisionNumber: currentRevisionNumber };
  }
  
  // Easily
  const nextIdx = currentRevisionNumber;
  return { interval: schedule[nextIdx] || 120, nextRevisionNumber: currentRevisionNumber + 1 };
};

// Mark revision as complete and schedule the next one
router.post('/:id/complete', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.sendStatus(401);

    const revisionId = req.params.id;
    const { feedback } = req.body; // 'Easily', 'With Hint', 'Completely Forgot'

    if (!['Easily', 'With Hint', 'Completely Forgot'].includes(feedback)) {
      return res.status(400).json({ error: 'Invalid feedback' });
    }

    const revision = await prisma.revision.findUnique({
      where: { id: revisionId },
      include: { userQuestion: true }
    });

    if (!revision) {
      return res.status(404).json({ error: 'Revision not found' });
    }

    if (revision.userQuestion.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Mark current complete
    await prisma.revision.update({
      where: { id: revisionId },
      data: {
        completed: true,
        completedAt: new Date()
      }
    });

    // Schedule next
    const { interval, nextRevisionNumber } = getNextInterval(revision.revisionNumber, feedback as any);
    
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + interval);

    const nextRevision = await prisma.revision.create({
      data: {
        userQuestionId: revision.userQuestionId,
        revisionNumber: nextRevisionNumber,
        scheduledDate,
      }
    });

    res.json({ completedRevision: revision, nextRevision });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
