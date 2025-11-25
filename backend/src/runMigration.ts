import { db } from './db';
import { sql } from 'drizzle-orm';

export async function runMigration() {
  try {
    console.log('Running database migration...');
    
    // Create tasks table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "url" text NOT NULL,
        "question" text NOT NULL,
        "status" varchar(20) DEFAULT 'pending' NOT NULL,
        "answer" text,
        "error" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    
    console.log('✅ Database migration completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}
