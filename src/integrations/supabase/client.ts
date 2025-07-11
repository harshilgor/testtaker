
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kpcprhkubqhslazlhgad.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwY3ByaGt1YnFoc2xhemxoZ2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzODkzNTIsImV4cCI6MjA2Mzk2NTM1Mn0.kqHLbGSNGdwtxBKkjqw5Cod6si0j_qnrvpw5u_Q860Q";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
