# TaskMaster — Professional Full-Stack Task Manager

A production-grade task management application built with React, Node.js, PostgreSQL, and AI.

## ✨ Features

- **Full CRUD** — Create, edit, delete tasks with all fields
- **Edit History** — Every change is tracked with field-level diffs in a timeline
- **Kanban Board** — Drag & drop tasks between columns (Pending / In Progress / Done)
- **Calendar View** — Monthly calendar with color-coded tasks by priority
- **AI Suggestions** — Auto-fill task details using Claude AI
- **AI Chat Assistant** — Context-aware productivity assistant in a sidebar
- **Reminders** — Set datetime reminders; real-time WebSocket notifications fire on time
- **Filters & Search** — Filter by priority, status, category; debounced full-text search
- **Soft Delete** — Tasks are archived (not hard deleted) to preserve history
- **Dashboard** — Stats cards (Total / Pending / Done Today / Overdue) + upcoming reminders
- **Keyboard Shortcuts** — `N` new task, `/` search, `Esc` close modal
- **Modern UI** — Clean white/grey design system, DM Sans font, smooth animations

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v3 |
| State | Zustand + TanStack Query |
| Backend | Node.js + Express |
| Database | PostgreSQL via Prisma ORM |
| AI | Anthropic Claude API |
| Real-time | WebSocket (ws) |
| Auth | JWT (scaffold included) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL running locally
- Anthropic API key (get one at console.anthropic.com)

### 1. Install dependencies
```bash
npm install        # root (concurrently)
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskmaster"
JWT_SECRET="any-long-random-string"
ANTHROPIC_API_KEY="sk-ant-your-key-here"
PORT=3001
CLIENT_URL="http://localhost:5173"
```

### 3. Setup database
```bash
# Make sure PostgreSQL is running, then:
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run the app
```bash
# From root (runs both server + client)
cd server && npm run dev
# In another terminal:
cd client && npm run dev
```

Open **http://localhost:5173**

---

## 📁 Project Structure

```
taskmaster/
├── server/
│   ├── prisma/schema.prisma          # Database schema
│   ├── src/
│   │   ├── server.ts                 # Entry point
│   │   ├── routes/
│   │   │   ├── tasks.ts              # CRUD + history endpoints
│   │   │   ├── ai.ts                 # AI suggest + chat
│   │   │   ├── reminders.ts          # Upcoming reminders + stats
│   │   │   └── auth.ts               # JWT auth scaffold
│   │   ├── services/
│   │   │   ├── aiService.ts          # Claude API integration
│   │   │   └── historyService.ts     # Diff computation + logging
│   │   ├── jobs/reminderCron.ts      # Fires reminders via WebSocket
│   │   ├── ws/websocket.ts           # WebSocket server
│   │   └── middleware/               # Auth, error handler
│   └── .env.example
│
└── client/
    └── src/
        ├── App.tsx                   # Root layout
        ├── api/
        │   ├── client.ts             # Axios instance
        │   └── hooks.ts              # All React Query hooks
        ├── components/
        │   ├── Header.tsx            # Top bar with search, reminders
        │   ├── TaskCard.tsx          # Individual task card
        │   ├── TaskForm.tsx          # Create/edit modal with AI
        │   ├── TaskList.tsx          # List view with skeletons
        │   ├── TaskDetailDrawer.tsx  # Slide-in history panel
        │   ├── KanbanBoard.tsx       # Drag & drop kanban
        │   ├── CalendarView.tsx      # React Big Calendar
        │   ├── AIAssistant.tsx       # Chat sidebar
        │   ├── Dashboard.tsx         # Stats + reminders strip
        │   └── FilterSidebar.tsx     # Priority/status/category filters
        ├── hooks/
        │   ├── useWebSocket.ts       # WS listener + toast notifications
        │   └── useKeyboard.ts        # Keyboard shortcuts
        ├── store/uiStore.ts          # Zustand global UI state
        ├── types/index.ts            # TypeScript interfaces
        └── utils/index.ts            # Helpers, formatters, configs
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | List tasks with filters |
| POST | /api/tasks | Create task |
| GET | /api/tasks/:id | Get task + full history |
| PUT | /api/tasks/:id | Update task (auto-diffs history) |
| DELETE | /api/tasks/:id | Soft delete (archive) |
| PATCH | /api/tasks/:id/complete | Toggle complete/reopen |
| GET | /api/tasks/:id/history | Full edit history |
| POST | /api/ai/suggest | AI auto-fill from title |
| POST | /api/ai/chat | AI assistant chat |
| GET | /api/reminders/upcoming | Next 24h reminders |
| GET | /api/reminders/stats | Dashboard stats |

## 🎨 Design Tokens

```
Base: #FFFFFF      Surface: #F8F8F7   Surface-2: #F0EFED
Surface-3: #E8E7E4  Muted: #9B9A97    Ink: #1A1A18
Accent: #2383E2    Success: #0F9D58   Warning: #F5A623
Danger: #E84040
```
