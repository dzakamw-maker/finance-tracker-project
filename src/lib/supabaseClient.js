import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cquqroerrgoisnyzvumd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxdXFyb2VycmdvaXNueXp2dW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTgzMTAsImV4cCI6MjA4ODg5NDMxMH0.0HL6GVDA6T4OmjN7GVhRaMknjhv2cUwjTI2SueJo-pU'

export const supabase = createClient(supabaseUrl, supabaseKey)