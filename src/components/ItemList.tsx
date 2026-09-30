import type { DeckItem } from '../types'

type ItemListProps = {
  title: string
  empty: string
  items: DeckItem[]
  canRemove?: boolean
  disabled?: boolean
  onRemove?: (id: string) => void
}

export function ItemList({
  title,
  empty,
  items,
  canRemove = false,
  disabled = false,
  onRemove,
}: ItemListProps) {
  return (
    <details className="panel fold" open>
      <summary className="panel-head">
        <h2>{title}</h2>
        <span className="muted">{items.length}</span>
      </summary>
      {items.length === 0 ? (
        <p className="empty">{empty}</p>
      ) : (
        <ul className="item-list">
          {items.map((item) => (
            <li key={item.id} className="item-row">
              <span
                className="swatch"
                style={{ background: item.color }}
                aria-hidden="true"
              >
                {item.imageUrl ? <img src={item.imageUrl} alt="" /> : null}
              </span>
              <span className="item-label">
                {item.text || (item.imageUrl ? '（仅图片）' : '未命名')}
              </span>
              {canRemove && onRemove ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={disabled}
                  onClick={() => onRemove(item.id)}
                >
                  删除
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </details>
  )
}
