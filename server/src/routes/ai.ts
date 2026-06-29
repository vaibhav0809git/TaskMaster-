import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { suggestTaskDetails, chatWithAI } from '../services/aiService';

const router = Router();
const prisma = new PrismaClient();

// POST /api/ai/suggest
router.post('/suggest', async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    if (!title) { res.status(400).json({ error: 'Title required' }); return; }
    const suggestion = await suggestTaskDetails(title);
    res.json(suggestion);
  } catch (err) {
    res.status(500).json({ error: 'AI suggestion failed' });
  }
});

// POST /api/ai/chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) { res.status(400).json({ error: 'Message required' }); return; }

    const tasks = await prisma.task.findMany({
      where: { status: { not: 'ARCHIVED' } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const reply = await chatWithAI(message, tasks);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'AI chat failed' });
  }
});

export default router;
