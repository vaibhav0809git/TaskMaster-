import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { computeDiff, logHistory } from '../services/historyService';

const router = Router();
const prisma = new PrismaClient();

// GET /api/tasks
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, priority, tag, search, dateFrom, dateTo, category } = req.query;

    const where: any = { status: { not: 'ARCHIVED' } };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (tag) where.tags = { has: tag as string };
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (dateFrom || dateTo) {
      where.dueDate = {};
      if (dateFrom) where.dueDate.gte = new Date(dateFrom as string);
      if (dateTo) where.dueDate.lte = new Date(dateTo as string);
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      include: { history: { orderBy: { timestamp: 'desc' }, take: 1 } },
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, priority, dueDate, reminder, tags, category } = req.body;

    if (!title?.trim()) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description,
        status: status || 'PENDING',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        reminder: reminder ? new Date(reminder) : null,
        tags: tags || [],
        category,
      },
    });

    await logHistory(task.id, 'CREATED', undefined, 'Task created');
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// GET /api/tasks/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { history: { orderBy: { timestamp: 'desc' } } },
    });
    if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ error: 'Task not found' }); return; }

    const { title, description, status, priority, dueDate, reminder, tags, category } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (reminder !== undefined) {
      updateData.reminder = reminder ? new Date(reminder) : null;
      updateData.reminderSent = false; // reset if reminder changed
    }
    if (tags !== undefined) updateData.tags = tags;
    if (category !== undefined) updateData.category = category;

    if (status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
    });

    const changes = computeDiff(existing, updated);
    if (changes.length > 0) {
      await logHistory(req.params.id, 'UPDATED', changes);
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id (soft delete)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ error: 'Task not found' }); return; }

    await prisma.task.update({
      where: { id: req.params.id },
      data: { status: 'ARCHIVED' },
    });

    await logHistory(req.params.id, 'DELETED', undefined, 'Task archived');
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// PATCH /api/tasks/:id/complete
router.patch('/:id/complete', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ error: 'Task not found' }); return; }

    const isCompleting = existing.status !== 'COMPLETED';
    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        status: isCompleting ? 'COMPLETED' : 'PENDING',
        completedAt: isCompleting ? new Date() : null,
      },
    });

    await logHistory(req.params.id, isCompleting ? 'COMPLETED' : 'REOPENED');
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to toggle task' });
  }
});

// GET /api/tasks/:id/history
router.get('/:id/history', async (req: AuthRequest, res: Response) => {
  try {
    const history = await prisma.taskHistory.findMany({
      where: { taskId: req.params.id },
      orderBy: { timestamp: 'desc' },
    });
    res.json(history);
  } catch {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
