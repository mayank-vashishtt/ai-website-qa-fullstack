import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Redis connection
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

// Create BullMQ queue
export const taskQueue = new Queue('website-tasks', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: {
      count: 50, // Keep last 50 failed jobs
    },
  },
});

export interface TaskJobData {
  taskId: string;
  url: string;
  question: string;
}
