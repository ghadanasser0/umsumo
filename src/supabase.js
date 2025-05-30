import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xmpspjunwuxjvziergui.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcHNwanVud3V4anZ6aWVyZ3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1OTk5NzMsImV4cCI6MjA1NDE3NTk3M30.1yGxMUyC8f0FcqrCUh4C52_vwVvhCph9q34Kq_ECOg8";

export const supabase = createClient(supabaseUrl, supabaseKey);