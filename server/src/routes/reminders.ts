import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/reminders/upcoming
router.get('/upcoming', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const tasks = await prisma.task.findMany({
      where: {
        reminder: { gte: now, lte: in24h },
        status: { not: 'ARCHIVED' },
      },
      orderBy: { reminder: 'asc' },
    });

    res.json(tasks);
  } catch {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// GET /api/reminders/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const [total, pending, completedToday, overdue] = await Promise.all([
      prisma.task.count({ where: { status: { not: 'ARCHIVED' } } }),
      prisma.task.count({ where: { status: 'PENDING' } }),
      prisma.task.count({ where: { completedAt: { gte: todayStart, lte: todayEnd } } }),
      prisma.task.count({
        where: {
          dueDate: { lt: new Date() },
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      }),
    ]);

    res.json({ total, pending, completedToday, overdue });
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
