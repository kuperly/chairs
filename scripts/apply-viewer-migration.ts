import { createClient } from '@/utils/supabase/client';
import { readFileSync } from 'fs';
import { join } from 'path';

async function applyMigration() {
  const supabase = createClient();

  const migrationPath = join(process.cwd(), 'supabase/migrations/20260510000000_add_viewer_tracking_functions.sql');
  const sql = readFileSync(migrationPath, 'utf8');

  // Split by semicolon and execute each statement
  const statements = sql.split(';').filter(s => s.trim());

  for (const statement of statements) {
    if (!statement.trim()) continue;

    console.log('Executing statement...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: statement.trim() + ';'
    });

    if (error) {
      console.error('Error:', error);
      throw error;
    }
    console.log('Success');
  }

  console.log('All migration statements executed successfully!');
}

applyMigration().catch(console.error);
