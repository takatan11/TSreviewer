import {createClient, type SupabaseClient} from "@supabase/supabase-js"
import { mockSupabase } from "./mock.js"

// ★オフライン(機内)スイッチ★
//   true  … ローカルの仮データで動く（ネット不要。src/db/mock.ts を使用）
//   false … 本物のSupabaseに接続する（通常はこちら）
// 機内から戻ったら false に戻すこと。
const USE_MOCK = true

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!

export const supabase: SupabaseClient = USE_MOCK
  ? (mockSupabase as any)
  : createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
//supabaseとの連携。.envファイルからURLとパスワードを持ってきて
//（USE_MOCK が true のときは接続せず、ローカルの仮データで動く）
