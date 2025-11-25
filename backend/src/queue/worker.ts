import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { chromium } from 'playwright';
import Groq from 'groq-sdk';
import { db } from '../db';
import { tasks } from '../db/schema';
import { eq } from 'drizzle-orm';
import { TaskJobData } from './queue';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function scrapeWebsite(url: string): Promise<string> {
  console.log(`🌐 Scraping website: ${url}`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the URL with timeout
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);

    // Extract text content from the page
    const content = await page.evaluate(() => {
      // Remove script and style elements
      const scripts = (document as any).querySelectorAll('script, style, noscript');
      scripts.forEach((el: any) => el.remove());

      // Get text content
      return (document as any).body.innerText;
    });

    await browser.close();
    
    console.log(`✅ Successfully scraped ${content.length} characters`);
    return content;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

async function askAI(content: string, question: string): Promise<string> {
  console.log(`🤖 Asking AI: ${question}`);

  // Truncate content if too long (Groq has token limits)
  const maxContentLength = 15000;
  const truncatedContent = content.length > maxContentLength 
    ? content.substring(0, maxContentLength) + '...[truncated]'
    : content;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that answers questions based on website content. Provide clear, concise, and accurate answers.',
      },
      {
        role: 'user',
        content: `Based on the following website content, please answer this question: "${question}"\n\nWebsite Content:\n${truncatedContent}`,
      },
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.7,
    max_tokens: 1024,
  });

  const answer = chatCompletion.choices[0]?.message?.content || 'No answer generated';
  console.log(`✅ AI answer generated`);
  
  return answer;
}

// Create worker to process jobs
export const worker = new Worker<TaskJobData>(
  'website-tasks',
  async (job: Job<TaskJobData>) => {
    const { taskId, url, question } = job.data;
    
    console.log(`\n📋 Processing job ${job.id} for task ${taskId}`);

    try {
      // Update status to processing
      await db
        .update(tasks)
        .set({ 
          status: 'processing',
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));

      // Scrape the website
      const content = await scrapeWebsite(url);

      // Ask AI the question
      const answer = await askAI(content, question);

      // Update task with answer
      await db
        .update(tasks)
        .set({ 
          status: 'completed',
          answer,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));

      console.log(`✅ Task ${taskId} completed successfully`);
      
      return { success: true, answer };
    } catch (error) {
      console.error(`❌ Error processing task ${taskId}:`, error);

      // Update task with error
      await db
        .update(tasks)
        .set({ 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));

      throw error;
    }
  },
  {
    connection,
    concurrency: 2, // Process 2 jobs concurrently
  }
);

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

console.log('🚀 Worker started and listening for jobs...');
