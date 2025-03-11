import { createClient } from '@supabase/supabase-js'

//----------- Připojení databaze ------------
const supabaseUrl = 'https://oeduerzkrrxfyllzugvr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZHVlcnprcnJ4ZnlsbHp1Z3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5OTY2MzgsImV4cCI6MjA1MTU3MjYzOH0.tYXbEKWiyTE8PHLypqg1wXsXWUuvXQIbepa5ezBG-bU'
const supabase = createClient(supabaseUrl, supabaseKey)

export { supabase } 

