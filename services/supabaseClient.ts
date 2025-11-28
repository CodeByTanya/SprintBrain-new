import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials to prevent environment variable issues in browser environment
const supabaseUrl = 'https://kqbdmimyrcqxtfcikupi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYmRtaW15cmNxeHRmY2lrdXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMTAzNzIsImV4cCI6MjA3OTg4NjM3Mn0.b1SDGx4KUU0XG7BZhYx3aTQ1RINyKX_qUblPIQlV8LE';

export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey
);