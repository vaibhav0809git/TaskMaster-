import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function suggestTaskDetails(title: string) {
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: `For this task title: "${title}"
Return ONLY valid JSON, no markdown, no explanation:
{
  "description": "2-3 sentence helpful description",
  "priority": "LOW or MEDIUM or HIGH or URGENT",
  "suggestedDueDays": 7,
  "tags": ["tag1","tag2","tag3"],
  "category": "Work or Personal or Health or Finance or Other"
}`,
        },
      ],
    });

    const text = (msg.content[0] as any).text.trim();
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('AI suggest error:', err);
    return {
      description: '',
      priority: 'MEDIUM',
      suggestedDueDays: 7,
      tags: [],
      category: 'Other',
    };
  }
}

export async function chatWithAI(userMessage: string, tasks: any[]) {
  const taskSummary = tasks.slice(0, 30).map((t) => ({
    title: t.title,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    tags: t.tags,
  }));

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You are TaskMaster AI, a smart productivity assistant embedded in a task management app.
Today's date: ${new Date().toISOString().split('T')[0]}
User's current tasks (up to 30): ${JSON.stringify(taskSummary)}

Be concise, actionable, and friendly. Use markdown for formatting. Help with prioritization, deadlines, workload analysis, and productivity tips.`,
    messages: [{ role: 'user', content: userMessage }],
  });

  return (msg.content[0] as any).text;
}
