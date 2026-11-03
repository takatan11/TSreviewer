// パンくず（現在地の表示）。深い階層でも「今どこにいて、どこへ戻れるか」を画面に残す。
// items の最後は現在のページ（リンクなし）。maxWidth はページ本文の幅に合わせる。
export const Breadcrumb = (props: { items: { label: string; href?: string }[]; maxWidth?: number }) => (
  <nav class="breadcrumb" aria-label="現在地" style={`max-width:${props.maxWidth ?? 800}px`}>
    {props.items.map((item, i) => (
      <>
        {i > 0 && <span class="crumb-sep" aria-hidden="true">›</span>}
        {item.href
          ? <a href={item.href}>{item.label}</a>
          : <span class="crumb-current" aria-current="page">{item.label}</span>}
      </>
    ))}
  </nav>
)
