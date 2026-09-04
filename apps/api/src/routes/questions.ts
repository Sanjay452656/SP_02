import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Add a solved question
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.sendStatus(401);

    const {
      title,
      platform,
      problemLink,
      difficulty,
      topic,
      notes,
      solutionLink,
      pattern,
      mistakes,
      confidenceLevel,
      timeTaken,
    } = req.body;

    // First check if question exists in global bank
    let question = await prisma.question.findFirst({
      where: { problemLink }
    });

    if (!question) {
      question = await prisma.question.create({
        data: {
          title,
          platform: platform || 'LeetCode',
          problemLink,
          difficulty,
          topic,
        }
      });
    }

    // Check if user already solved this
    let userQuestion = await prisma.userQuestion.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId: question.id
        }
      }
    });

    if (userQuestion) {
      // Update existing
      userQuestion = await prisma.userQuestion.update({
        where: { id: userQuestion.id },
        data: {
          notes,
          solutionLink,
          pattern,
          mistakes,
          confidenceLevel,
          timeTaken,
          solvedDate: new Date()
        }
      });
    } else {
      // Create new user question
      userQuestion = await prisma.userQuestion.create({
        data: {
          userId,
          questionId: question.id,
          notes,
          solutionLink,
          pattern,
          mistakes,
          confidenceLevel,
          timeTaken,
        }
      });
    }

    // Initialize first revision based on confidence level
    // Day 0 -> Solved. Rev 1 -> +1 day.
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 1);

    await prisma.revision.create({
      data: {
        userQuestionId: userQuestion.id,
        revisionNumber: 1,
        scheduledDate,
      }
    });

    res.status(201).json({ userQuestion, question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's solved questions
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.sendStatus(401);

    const userQuestions = await prisma.userQuestion.findMany({
      where: { userId },
      include: {
        question: true
      },
      orderBy: {
        solvedDate: 'desc'
      }
    });

    res.json(userQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
