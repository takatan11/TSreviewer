import { createServerClient } from "@supabase/ssr"
import { getCookie, setCookie } from "hono/cookie"
import type { Context } from "hono"

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!

// リクエストごとに、そのリクエストのCookieに紐づいたSupabaseクライアントを作る
export function createClientForRequest(c: Context) {
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => {
        return Object.entries(getCookie(c)).map(([name, value]) => ({ name, value }))
      },
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({name,value,options})=>setCookie(c,name,value,options as any))
      },
    },
  })
}
