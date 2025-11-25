import { Router, Request, Response } from 'express';
import { db } from '../db';
import { tasks } from '../db/schema';
import { taskQueue } from '../queue/queue';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Validation schema
const createTaskSchema = z.object({
  url: z.string().url('Invalid URL format'),
  question: z.string().min(1, 'Question is required').max(500, 'Question too long'),
});

// POST /api/tasks - Create a new task
router.post('/tasks', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = createTaskSchema.parse(req.body);
    const { url, question } = validatedData;

    // Create task in database
    const [task] = await db
      .insert(tasks)
      .values({
        url,
        question,
        status: 'pending',
      })
      .returning();

    // Add job to queue
    await taskQueue.add('process-website', {
      taskId: task.id,
      url: task.url,
      question: task.question,
    });

    console.log(`✅ Created task ${task.id} and queued job`);

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error creating task:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create task',
    });
  }
});

// GET /api/tasks/:id - Get task by ID
router.get('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task',
    });
  }
});

export default router;
