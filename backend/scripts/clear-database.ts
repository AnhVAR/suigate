/**
 * Clear all data from Supabase database
 * Usage: npx ts-node scripts/clear-database.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function clearDatabase() {
  console.log('🗑️  Clearing database...\n');

  // UUID-based tables
  const uuidTables = ['order_matches', 'orders', 'users'];
  // Integer-based tables
  const intTables = ['transactions', 'conversion_rates', 'bank_accounts'];

  for (const table of uuidTables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: cleared`);
    }
  }

  for (const table of intTables) {
    const { error } = await supabase.from(table).delete().gt('id', 0);
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: cleared`);
    }
  }

  console.log('\n✨ Database cleared!');
}

clearDatabase().catch(console.error);
