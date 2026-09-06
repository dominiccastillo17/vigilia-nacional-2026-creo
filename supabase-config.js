const SUPABASE_URL = 
  "https://kkbdsfqquhbywgzwgfkq.supabase.co";
const SUPABASE_ANON_KEY = 
  "sb_publishable_M8303JtfWblTG9mxEvYYuw_tncTq2bE";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
