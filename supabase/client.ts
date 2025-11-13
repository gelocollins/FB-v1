
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

const supabaseUrl = 'https://qemkmsigxirzmhywedlj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbWttc2lneGlyem1oeXdlZGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDg3MTIsImV4cCI6MjA3NTcyNDcxMn0.w8lkDYUDXEK3nvG8QPV2ZN-nQpqnJ_KFE56OUCN2BLI';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
