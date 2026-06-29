import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { broadcast } from '../ws/websocket';

const prisma = new PrismaClient();

export function startReminderCron() {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const oneMinLater = new Date(now.getTime() + 60 * 1000);

      const dueTasks = await prisma.task.findMany({
        where: {
          reminder: { gte: now, lt: oneMinLater },
          reminderSent: false,
          status: { not: 'ARCHIVED' },
        },
      });

      for (const task of dueTasks) {
        broadcast({ type: 'REMINDER', task });
        await prisma.task.update({
          where: { id: task.id },
          data: { reminderSent: true },
        });
      }
    } catch (err) {
      console.error('Reminder cron error:', err);
    }
  });

  console.log('✅ Reminder cron started');
}
