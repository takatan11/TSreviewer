// パンくず（現在地の表示）。深い階層でも「今どこにいて、どこへ戻れるか」を画面に残す。
// items の最後は現在のページ（リンクなし）。幅は本文の列（.container）に合わせる。
export const Breadcrumb = (props: { items: { label: string; href?: string }[] }) => (
  <nav class="breadcrumb" aria-label="現在地">
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
