// ============================================================
//  オフライン用のモックSupabase（仮の変更）
//  機内などSupabaseに繋げないときに、ローカルのメモリ内データで
//  本物と同じ書き方（.from().select().eq()...）を動かすための偽物。
//
//  本番では使わない。src/db/index.ts の USE_MOCK を false に戻せば
//  この仕組みは完全にオフになる（このファイルは残しておいてよい）。
// ============================================================

type Row = Record<string, any>

// ── 仮の授業データ（本番の subject テーブルの代わり）──────────────
const subjectData: Row[] = [
  { class_name: '微分積分学',       faculty: '工学部',       depart: '電気電子・情報工学科', created_at: '2026-01-05' },
  { class_name: '線形代数',         faculty: '工学部',       depart: '電気電子・情報工学科', created_at: '2026-01-04' },
  { class_name: '電気回路',         faculty: '工学部',       depart: '電気電子・情報工学科', created_at: '2026-01-03' },
  { class_name: '機械設計',         faculty: '工学部',       depart: '機械工学科',           created_at: '2026-01-02' },
  { class_name: '教育心理学',       faculty: '教育学部',     depart: '教育学科',             created_at: '2026-01-01' },
  { class_name: '応用生物学概論',   faculty: '応用生物学部', depart: '応用生物学科',         created_at: '2025-12-31' },
  { class_name: '解剖学',           faculty: '医学部',       depart: '医学科',               created_at: '2025-12-30' },
]

// ── 仮のレビューデータ（本番の review テーブルの代わり）──────────
const reviewData: Row[] = []

// テーブル名 → データ配列 の対応
function tableRows(table: string): Row[] {
  if (table === 'subject') return subjectData
  if (table === 'review') return reviewData
  return [] // 未知のテーブル名（空文字など）は空扱い
}

// ── 本物のクエリビルダーを真似たクラス ────────────────────────
// .select() .order() .ilike() .eq() .limit() .single() .insert()
// をチェーンでき、await すると { data, error } を返す（＝thenable）。
class MockQuery {
  private rows: Row[]
  private filters: ((r: Row) => boolean)[] = []
  private orderKey?: string
  private orderAsc = true
  private limitN?: number
  private singleFlag = false
  private insertedRows?: Row[]

  constructor(private table: string) {
    this.rows = tableRows(table)
  }

  select(_cols?: string) { return this }

  order(key: string, opts?: { ascending?: boolean }) {
    this.orderKey = key
    this.orderAsc = opts?.ascending ?? true
    return this
  }

  // %x% → 部分一致 / x% → 前方一致 に変換（本物のilikeの簡易版）
  ilike(col: string, pattern: string) {
    const p = String(pattern).toLowerCase()
    this.filters.push((r) => {
      const v = String(r[col] ?? '').toLowerCase()
      if (p.startsWith('%') && p.endsWith('%')) return v.includes(p.slice(1, -1))
      if (p.endsWith('%')) return v.startsWith(p.slice(0, -1))
      if (p.startsWith('%')) return v.endsWith(p.slice(1))
      return v === p
    })
    return this
  }

  eq(col: string, val: any) {
    this.filters.push((r) => r[col] === val)
    return this
  }

  limit(n: number) { this.limitN = n; return this }

  single() { this.singleFlag = true; return this }

  insert(obj?: Row | Row[]) {
    const arr = Array.isArray(obj) ? obj : obj ? [obj] : []
    arr.forEach((r) => {
      const row = { ...r, created_at: new Date().toISOString() }
      tableRows(this.table).push(row)
    })
    this.insertedRows = arr
    return this
  }

  // 実際にデータを絞り込んで結果を作る
  private run(): { data: any; error: any } {
    if (this.insertedRows) {
      return { data: this.insertedRows, error: null }
    }
    let result = this.rows.filter((r) => this.filters.every((f) => f(r)))
    if (this.orderKey) {
      const k = this.orderKey
      const dir = this.orderAsc ? 1 : -1
      result = [...result].sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * dir)
    }
    if (this.limitN != null) result = result.slice(0, this.limitN)
    if (this.singleFlag) {
      return result.length
        ? { data: result[0], error: null }
        : { data: null, error: { message: '該当なし(mock single)' } }
    }
    return { data: result, error: null }
  }

  // await されたときに呼ばれる（thenableにするため）
  then(resolve: (v: any) => any, reject?: (e: any) => any) {
    try {
      return Promise.resolve(this.run()).then(resolve, reject)
    } catch (e) {
      return Promise.resolve({ data: null, error: { message: String(e) } }).then(resolve)
    }
  }
}

// 本物の supabase と同じ入口（.from(table)）だけ用意
export const mockSupabase = {
  from(table: string) {
    return new MockQuery(table)
  },
}
