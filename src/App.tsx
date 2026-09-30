import { AddItemForm } from './components/AddItemForm'
import { ItemList } from './components/ItemList'
import { Wheel } from './components/Wheel'
import { MAX_ITEMS, useDeck } from './hooks/useDeck'

export default function App() {
  const deck = useDeck()
  const locked = deck.spinning
  const canSpin = !locked && deck.pool.length > 0
  const canReset = !locked && deck.history.length > 0
  const canClear = !locked && deck.totalCount > 0

  let hint = '把对象加进池子，点「随机」抽一个。抽过的不会再中。'
  if (deck.spinning) {
    hint = '转盘旋转中，请稍候…'
  } else if (deck.pool.length === 0 && deck.history.length > 0) {
    hint = '池子空了。点「重置」把已抽对象放回去，或「清理」全部删除。'
  } else if (deck.pool.length === 0) {
    hint = '先添加对象再抽。刷新或关闭页面会清空全部。'
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">DeckRandom</p>
          <h1>转盘抽奖</h1>
        </div>
        <p className="tagline">仅保存在当前标签页 · 刷新即清空</p>
      </header>

      <main className="layout">
        <section className="stage">
          <Wheel items={deck.pool} rotation={deck.rotation} />

          {deck.winner ? (
            <div className="winner-card">
              <span className="eyebrow">本次抽中</span>
              <div className="winner-body">
                {deck.winner.imageUrl ? (
                  <img src={deck.winner.imageUrl} alt="" />
                ) : null}
                <strong>
                  {deck.winner.text || (deck.winner.imageUrl ? '（仅图片）' : '未命名')}
                </strong>
              </div>
            </div>
          ) : null}

          <p className="hint">{hint}</p>

          <div className="actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canSpin}
              onClick={deck.spin}
            >
              随机
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={!canReset}
              onClick={deck.reset}
            >
              重置
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={!canClear}
              onClick={() => deck.setConfirmClear(true)}
            >
              清理
            </button>
          </div>
        </section>

        <aside className="sidebar">
          <AddItemForm
            disabled={locked || deck.totalCount >= MAX_ITEMS}
            remaining={Math.max(0, MAX_ITEMS - deck.totalCount)}
            error={deck.error}
            onAdd={deck.addItem}
          />
          <ItemList
            title="剩余对象"
            empty="池子是空的"
            items={deck.pool}
            canRemove
            disabled={locked}
            onRemove={deck.removeItem}
          />
          <ItemList
            title="已抽中"
            empty="还没有抽过"
            items={deck.history}
          />
        </aside>
      </main>

      {deck.confirmClear ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="clear-title">
            <h2 id="clear-title">清理全部对象？</h2>
            <p>会删除池子和已抽历史，且无法恢复（刷新页面效果相同）。</p>
            <div className="actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => deck.setConfirmClear(false)}
              >
                取消
              </button>
              <button type="button" className="btn btn-danger" onClick={deck.clear}>
                确认清理
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
