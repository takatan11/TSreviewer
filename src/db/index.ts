import {createClient} from "@supabase/supabase-js"
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
//supabaseとの連携。.envファイルからURLとパスワードを持ってきて
