import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function computeDiff(oldTask: any, newTask: any): Array<{ field: string; from: any; to: any }> {
  const fields = ['title', 'description', 'status', 'priority', 'dueDate', 'reminder', 'category', 'tags'];
  const changes: Array<{ field: string; from: any; to: any }> = [];

  for (const field of fields) {
    const oldVal = oldTask[field];
    const newVal = newTask[field];
    const oldStr = JSON.stringify(oldVal);
    const newStr = JSON.stringify(newVal);
    if (oldStr !== newStr) {
      changes.push({ field, from: oldVal, to: newVal });
    }
  }
  return changes;
}

export async function logHistory(
  taskId: string,
  action: string,
  changes?: Array<{ field: string; from: any; to: any }>,
  note?: string
) {
  return prisma.taskHistory.create({
    data: { taskId, action, changes: changes ? (changes as any) : undefined, note },
  });
}
