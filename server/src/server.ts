import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initWebSocket } from './ws/websocket';
import { startReminderCron } from './jobs/reminderCron';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import tasksRouter from './routes/tasks';
import aiRouter from './routes/ai';
import remindersRouter from './routes/reminders';
import authRouter from './routes/auth';

const app = express();
const server = createServer(app);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(authMiddleware);

app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/ai', aiRouter);
app.use('/api/reminders', remindersRouter);

app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use(errorHandler);

initWebSocket(server);
startReminderCron();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 TaskMaster API running on http://localhost:${PORT}`);
});
