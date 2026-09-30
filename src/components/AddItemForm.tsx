import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { MAX_ITEMS } from '../hooks/useDeck'

type AddItemFormProps = {
  disabled: boolean
  remaining: number
  error: string | null
  onAdd: (text: string, file: File | null) => Promise<boolean>
}

export function AddItemForm({
  disabled,
  remaining,
  error,
  onAdd,
}: AddItemFormProps) {
  const textId = useId()
  const fileId = useId()
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileKey, setFileKey] = useState(0)
  const [busy, setBusy] = useState(false)
  const previewRef = useRef(preview)

  useEffect(() => {
    previewRef.current = preview
  }, [preview])

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
      }
    }
  }, [])

  function setSelectedFile(next: File | null) {
    setPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev)
      }
      return next ? URL.createObjectURL(next) : null
    })
    setFile(next)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (disabled || busy) {
      return
    }
    setBusy(true)
    const ok = await onAdd(text, file)
    setBusy(false)
    if (ok) {
      setText('')
      setSelectedFile(null)
      setFileKey((key) => key + 1)
    }
  }

  return (
    <details className="panel fold" open>
      <summary className="panel-head">
        <h2>添加对象</h2>
        <span className="muted">还可加 {remaining} / {MAX_ITEMS}</span>
      </summary>
      <form className="add-form" onSubmit={handleSubmit}>
        <label className="field" htmlFor={textId}>
          文字
          <input
            id={textId}
            type="text"
            maxLength={40}
            placeholder="名字或短句，可留空"
            value={text}
            disabled={disabled || busy}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <label className="field file-field" htmlFor={fileId}>
          图片
          <input
            id={fileId}
            key={fileKey}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={disabled || busy}
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          />
          {preview ? (
            <span className="file-preview">
              <img src={preview} alt="" />
              <button
                type="button"
                className="linkish"
                disabled={disabled || busy}
                onClick={() => setSelectedFile(null)}
              >
                去掉图片
              </button>
            </span>
          ) : (
            <span className="muted">可选 jpg / png / webp / gif</span>
          )}
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="btn btn-secondary" type="submit" disabled={disabled || busy}>
          {busy ? '添加中…' : '加入池子'}
        </button>
      </form>
    </details>
  )
}
