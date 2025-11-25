# 🤖 AI Website Q&A - Full Stack Application

A production-ready full-stack application that allows users to submit a website URL and ask questions about it. The system scrapes the website content, processes it using AI, and provides intelligent answers.

## 📋 Table of Contents

- [What This Project Does](#what-this-project-does)
- [Technologies Used](#technologies-used)
- [How Everything Works](#how-everything-works)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Architecture Deep Dive](#architecture-deep-dive)
- [Interview Questions](#interview-questions)

---

## 🎯 What This Project Does

This application demonstrates a complete full-stack workflow:

1. **User submits** a website URL and a question through a beautiful web interface
2. **Backend creates** a task and queues it for background processing
3. **Worker scrapes** the website content using browser automation
4. **AI analyzes** the content and answers the question
5. **Frontend polls** for updates and displays the answer in real-time
6. **Everything is saved** in PostgreSQL for persistence

---

## 🛠️ Technologies Used

### Frontend
- **Next.js 14** - A React framework for building web applications
  - *Why?* Provides server-side rendering, routing, and excellent developer experience
- **TanStack Query (React Query)** - Data fetching and state management
  - *Why?* Handles API calls, caching, and real-time polling automatically
- **TypeScript** - Typed JavaScript
  - *Why?* Catches errors before runtime and improves code quality
- **Tailwind CSS** - Utility-first CSS framework
  - *Why?* Rapid UI development with consistent design

### Backend
- **Express.js** - Web server framework for Node.js
  - *Why?* Simple, flexible, and widely used for building APIs
- **BullMQ** - Background job processing library
  - *Why?* Handles async tasks reliably with retry logic and monitoring
- **Drizzle ORM** - TypeScript ORM for SQL databases
  - *Why?* Type-safe database queries with excellent DX
- **Playwright** - Browser automation tool
  - *Why?* Scrapes dynamic websites that require JavaScript execution
- **Groq SDK** - AI API client
  - *Why?* Free, fast AI inference for answering questions

### Infrastructure
- **PostgreSQL** - Relational database
  - *Why?* Reliable, ACID-compliant storage for task data
- **Redis** - In-memory data store
  - *Why?* Required by BullMQ for job queue management
- **Docker** - Containerization platform
  - *Why?* Easy setup of PostgreSQL and Redis

---

## 🔄 How Everything Works

### The Complete Flow (For Beginners)

Think of this application like a restaurant:

1. **Customer (User)** places an order (submits URL + question)
2. **Waiter (Frontend)** takes the order to the kitchen (sends to backend API)
3. **Kitchen Manager (Express Server)** writes it on a ticket (creates database record)
4. **Ticket Board (BullMQ Queue)** holds the order for the next available chef
5. **Chef (Worker)** picks up the ticket and starts cooking:
   - Goes shopping (scrapes the website)
   - Prepares ingredients (processes content)
   - Asks expert (sends to AI)
   - Plates the dish (formats answer)
6. **Kitchen Manager** updates the order status (updates database)
7. **Waiter** checks periodically (polls API) and serves when ready (displays answer)

### Technical Flow

```
┌─────────────┐
│   Browser   │
│  (Next.js)  │
└──────┬──────┘
       │ 1. POST /api/tasks
       │    {url, question}
       ▼
┌─────────────────┐
│  Express API    │
│  (Backend)      │
└────┬────────┬───┘
     │        │
     │ 2.     │ 3. Add job
     │ Save   │    to queue
     │        │
     ▼        ▼
┌─────────┐ ┌──────────┐
│PostgreSQL│ │  BullMQ  │
│         │ │  (Redis) │
└─────────┘ └────┬─────┘
                 │
                 │ 4. Worker picks job
                 ▼
           ┌──────────────┐
           │    Worker    │
           │  - Scrape    │
           │  - Ask AI    │
           │  - Update DB │
           └──────────────┘
                 │
                 │ 5. Poll GET /api/tasks/:id
                 ▼
           ┌──────────┐
           │ Frontend │
           │ Displays │
           │  Answer  │
           └──────────┘
```

---

## ✅ Prerequisites

Before you start, make sure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Groq API Key** (free) - [Get it here](https://console.groq.com/)
- **Git** - [Download here](https://git-scm.com/)

---

## 🚀 Setup Instructions

### Step 1: Clone or Navigate to the Project

```bash
cd /Users/mayankvashisht/Desktop/AI-ML/Sbl
```

### Step 2: Start Docker Services

Start PostgreSQL and Redis using Docker Compose:

```bash
docker-compose up -d
```

This command:
- Downloads PostgreSQL and Redis images (first time only)
- Starts both services in the background
- Creates persistent volumes for data

Verify services are running:
```bash
docker-compose ps
```

### Step 3: Get Your Groq API Key

1. Visit [https://console.groq.com/](https://console.groq.com/)
2. Sign up for a free account
3. Go to API Keys section
4. Create a new API key
5. Copy the key (you'll need it in the next step)

### Step 4: Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cd backend
cp ../.env.example .env
```

Edit the `.env` file and add your Groq API key:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sbl_db
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=your_actual_groq_api_key_here
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Step 5: Install Backend Dependencies

```bash
npm install
```

This installs all required packages like Express, BullMQ, Drizzle, etc.

### Step 6: Set Up the Database

Run database migrations to create tables:

```bash
npm run db:push
```

This creates the `tasks` table in PostgreSQL.

### Step 7: Install Playwright Browsers

Playwright needs browser binaries for web scraping:

```bash
npx playwright install chromium
```

### Step 8: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## 🎮 Running the Application

You'll need **three terminal windows**:

### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3001
🚀 Worker started and listening for jobs...
```

### Terminal 2: Frontend Server

```bash
cd frontend
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

### Terminal 3: Monitor Docker Services (Optional)

```bash
docker-compose logs -f
```

### Access the Application

Open your browser and visit: **http://localhost:3000**

---

## 📁 Project Structure

```
Sbl/
├── backend/                    # Express backend
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts      # Database schema (tasks table)
│   │   │   └── index.ts       # Database connection
│   │   ├── queue/
│   │   │   ├── queue.ts       # BullMQ queue setup
│   │   │   └── worker.ts      # Background job processor
│   │   ├── routes/
│   │   │   └── tasks.ts       # API endpoints
│   │   └── index.ts           # Express server entry
│   ├── package.json
│   ├── tsconfig.json
│   └── drizzle.config.ts      # Drizzle ORM config
│
├── frontend/                   # Next.js frontend
│   ├── app/
│   │   ├── page.tsx           # Main UI component
│   │   ├── layout.tsx         # Root layout
│   │   ├── providers.tsx      # TanStack Query setup
│   │   └── globals.css        # Styles
│   ├── lib/
│   │   └── api.ts             # API client functions
│   └── package.json
│
├── docker-compose.yml          # PostgreSQL + Redis
├── .env.example               # Environment template
└── README.md                  # This file
```

---

## 🏗️ Architecture Deep Dive

### Database Schema (Drizzle ORM)

```typescript
tasks table:
- id: UUID (primary key)
- url: TEXT (website to scrape)
- question: TEXT (user's question)
- status: VARCHAR (pending/processing/completed/failed)
- answer: TEXT (AI's response)
- error: TEXT (error message if failed)
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

### API Endpoints

#### POST /api/tasks
Creates a new task and queues it for processing.

**Request:**
```json
{
  "url": "https://example.com",
  "question": "What is this website about?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "url": "https://example.com",
    "question": "What is this website about?",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /api/tasks/:id
Retrieves task status and answer.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "status": "completed",
    "answer": "This website is about...",
    ...
  }
}
```

### Background Job Processing (BullMQ)

**Why use a queue?**
- Web scraping can take 10-30 seconds
- Users shouldn't wait for HTTP response
- Enables retry logic if scraping fails
- Can process multiple jobs concurrently

**Worker Flow:**
1. Picks job from Redis queue
2. Updates task status to "processing"
3. Launches headless browser with Playwright
4. Navigates to URL and extracts text
5. Sends content + question to Groq AI
6. Saves answer to database
7. Updates status to "completed"

### Frontend Real-time Updates (TanStack Query)

**Polling Strategy:**
```typescript
refetchInterval: (query) => {
  const task = query.state.data;
  if (task?.status === 'completed' || task?.status === 'failed') {
    return false; // Stop polling
  }
  return 2000; // Poll every 2 seconds
}
```

This automatically:
- Fetches task status every 2 seconds
- Stops when task completes
- Updates UI reactively
- Handles errors gracefully

---

## 🎓 Interview Questions

### General Questions

**Q1: Why did you choose this tech stack?**

**A:** I chose this stack for several reasons:
- **Next.js** provides excellent DX with built-in routing, TypeScript support, and server-side capabilities
- **TanStack Query** eliminates boilerplate for API calls and handles caching/polling automatically
- **BullMQ** is production-ready with features like retries, job prioritization, and monitoring
- **Drizzle ORM** offers type-safety without the complexity of heavier ORMs like TypeORM
- **Playwright** can scrape dynamic websites that Cheerio cannot handle
- **Groq** provides free, fast AI inference perfect for demos

**Q2: How does the application handle failures?**

**A:** Multiple layers of error handling:
- **BullMQ retries**: Jobs retry 3 times with exponential backoff
- **Database transactions**: Ensure data consistency
- **Frontend error states**: Display user-friendly error messages
- **Worker error logging**: Saves error details to database
- **Validation**: Zod schema validates input before processing

**Q3: How would you scale this application?**

**A:**
- **Horizontal scaling**: Deploy multiple worker instances
- **Queue optimization**: Add job prioritization and rate limiting
- **Caching**: Cache scraped content with Redis
- **Database**: Add read replicas for GET requests
- **CDN**: Serve frontend through Vercel/Netlify
- **Monitoring**: Add Sentry for error tracking, BullMQ Board for queue monitoring

### Technical Questions

**Q4: Explain the difference between Drizzle ORM and Prisma.**

**A:** 
- **Drizzle** is lighter, closer to SQL, and has better TypeScript inference
- **Prisma** has more features (GUI, migrations) but adds more abstraction
- Drizzle is faster at runtime due to less overhead
- For this project, Drizzle's simplicity was perfect

**Q5: Why use BullMQ instead of just async/await?**

**A:** BullMQ provides:
- **Persistence**: Jobs survive server restarts (stored in Redis)
- **Retries**: Automatic retry with backoff strategies
- **Concurrency**: Process multiple jobs in parallel
- **Monitoring**: Track job progress and failures
- **Scalability**: Multiple workers can process the same queue

**Q6: How does TanStack Query improve the user experience?**

**A:**
- **Automatic refetching**: Keeps data fresh without manual code
- **Caching**: Reduces unnecessary API calls
- **Loading states**: Built-in loading/error states
- **Optimistic updates**: Can update UI before server responds
- **Deduplication**: Prevents duplicate requests

**Q7: What security considerations are missing from this demo?**

**A:** For production, I would add:
- **Rate limiting**: Prevent abuse of scraping endpoint
- **URL validation**: Whitelist/blacklist domains
- **Authentication**: Require user login
- **CORS**: Stricter origin policies
- **Input sanitization**: Prevent XSS attacks
- **API key rotation**: Secure Groq API key management
- **HTTPS**: Encrypt data in transit

**Q8: How would you test this application?**

**A:**
- **Unit tests**: Test individual functions (API client, validation)
- **Integration tests**: Test API endpoints with test database
- **E2E tests**: Use Playwright to test full user flow
- **Worker tests**: Mock scraping and AI calls
- **Load tests**: Simulate many concurrent users

### Behavioral Questions

**Q9: What was the most challenging part of this project?**

**A:** Handling the asynchronous nature of the workflow. Coordinating between:
- Frontend polling
- Backend job queuing
- Worker processing
- Database updates

Required careful state management and error handling at each layer.

**Q10: How did you ensure code quality?**

**A:**
- **TypeScript**: Type safety throughout
- **Consistent structure**: Organized by feature
- **Error handling**: Try-catch blocks with meaningful messages
- **Comments**: Explain complex logic
- **Validation**: Zod schemas for runtime validation

---

## 🎥 Demo Video Script

### Introduction (30 seconds)
"Hi! I built a full-stack AI Website Q&A application. Users can submit any website URL and ask questions about it. The system scrapes the content, analyzes it with AI, and provides intelligent answers."

### Architecture Overview (1 minute)
"The architecture uses Next.js for the frontend, Express for the backend, BullMQ for background job processing, PostgreSQL for data persistence, and Groq AI for answering questions. When a user submits a request, it's queued as a background job, processed by a worker that scrapes the website with Playwright, sends the content to AI, and stores the result in the database."

### Live Demo (2 minutes)
1. Show the homepage
2. Enter a URL (e.g., https://react.dev)
3. Ask a question: "What is React?"
4. Show the pending status
5. Watch it change to processing
6. Show the completed answer
7. Submit another question to show it works repeatedly

### Code Walkthrough (2 minutes)
1. Show backend worker.ts - explain scraping and AI integration
2. Show frontend page.tsx - explain TanStack Query polling
3. Show database schema - explain task tracking
4. Show docker-compose.yml - explain infrastructure

### Conclusion (30 seconds)
"This project demonstrates full-stack development skills including async job processing, real-time updates, database design, and modern frontend practices. Thank you for watching!"

---

## 🐳 Docker Bonus

The project includes Docker Compose for easy setup. To stop services:

```bash
docker-compose down
```

To stop and remove all data:

```bash
docker-compose down -v
```

To view logs:

```bash
docker-compose logs -f postgres
docker-compose logs -f redis
```

---

## 📝 License

MIT License - feel free to use this for learning or your own projects!

---

## 🙏 Acknowledgments

- **Groq** for free AI API access
- **Vercel** for Next.js
- **Taskforce.sh** for BullMQ
- **Drizzle Team** for the excellent ORM

---

**Built with ❤️ for the take-home assignment**


<!-- Trigger Railway deployment with TypeScript fixes -->
