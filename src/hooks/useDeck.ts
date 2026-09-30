import { useCallback, useEffect, useRef, useState } from 'react'
import { colorAt } from '../lib/colors'
import { compressToObjectUrl, revokeUrl } from '../lib/image'
import type { DeckItem } from '../types'

export const MAX_ITEMS = 24
const SPIN_MS = 4200
const SETTLE_MS = 700

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

function targetRotation(current: number, index: number, count: number): number {
  const tau = Math.PI * 2
  const slice = tau / count
  const targetMod = (((-index * slice) % tau) + tau) % tau
  const currentMod = ((current % tau) + tau) % tau
  let delta = targetMod - currentMod
  if (delta <= 0) {
    delta += tau
  }
  const extra = 4 + Math.floor(Math.random() * 3)
  return current + delta + extra * tau
}

export function useDeck() {
  const [pool, setPool] = useState<DeckItem[]>([])
  const [history, setHistory] = useState<DeckItem[]>([])
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<DeckItem | null>(null)
  const [rotation, setRotation] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const rotationRef = useRef(0)
  const colorIndexRef = useRef(0)
  const createdAtRef = useRef(0)
  const rafRef = useRef(0)
  const settleRef = useRef(0)
  const pendingRef = useRef<DeckItem | null>(null)

  const totalCount = pool.length + history.length

  const addItem = useCallback(
    async (text: string, file: File | null): Promise<boolean> => {
      if (spinning) {
        return false
      }
      const trimmed = text.trim()
      if (!trimmed && !file) {
        setError('请至少填写文字或上传一张图片')
        return false
      }
      if (file && !file.type.startsWith('image/')) {
        setError('请上传图片文件')
        return false
      }
      if (pool.length + history.length >= MAX_ITEMS) {
        setError(`最多添加 ${MAX_ITEMS} 个对象`)
        return false
      }
      let imageUrl: string | null = null
      if (file) {
        imageUrl = await compressToObjectUrl(file)
      }
      const item: DeckItem = {
        id: crypto.randomUUID(),
        text: trimmed,
        imageUrl,
        color: colorAt(colorIndexRef.current),
        createdAt: createdAtRef.current,
      }
      colorIndexRef.current += 1
      createdAtRef.current += 1
      setPool((prev) => [...prev, item])
      setError(null)
      return true
    },
    [history.length, pool.length, spinning],
  )

  const removeItem = useCallback(
    (id: string) => {
      if (spinning) {
        return
      }
      setPool((prev) => {
        const found = prev.find((item) => item.id === id)
        revokeUrl(found?.imageUrl ?? null)
        return prev.filter((item) => item.id !== id)
      })
    },
    [spinning],
  )

  const spin = useCallback(() => {
    if (spinning || pool.length === 0) {
      return
    }
    const index = Math.floor(Math.random() * pool.length)
    const picked = pool[index]
    if (!picked) {
      return
    }
    pendingRef.current = picked
    setSpinning(true)
    setWinner(null)
    setError(null)

    const from = rotationRef.current
    const to = targetRotation(from, index, pool.length)
    const started = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / SPIN_MS)
      const value = from + (to - from) * easeOutCubic(t)
      rotationRef.current = value
      setRotation(value)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      settleRef.current = window.setTimeout(() => {
        const won = pendingRef.current
        pendingRef.current = null
        if (won) {
          setPool((prev) => prev.filter((item) => item.id !== won.id))
          setHistory((prev) => [won, ...prev])
          setWinner(won)
        }
        rotationRef.current = 0
        setRotation(0)
        setSpinning(false)
      }, SETTLE_MS)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [pool, spinning])

  const reset = useCallback(() => {
    if (spinning) {
      return
    }
    setPool((prev) =>
      [...prev, ...history].sort((a, b) => a.createdAt - b.createdAt),
    )
    setHistory([])
    setWinner(null)
    setError(null)
    rotationRef.current = 0
    setRotation(0)
  }, [history, spinning])

  const clear = useCallback(() => {
    if (spinning) {
      return
    }
    for (const item of [...pool, ...history]) {
      revokeUrl(item.imageUrl)
    }
    setPool([])
    setHistory([])
    setWinner(null)
    setError(null)
    setConfirmClear(false)
    rotationRef.current = 0
    setRotation(0)
  }, [history, pool, spinning])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.clearTimeout(settleRef.current)
    }
  }, [])

  return {
    pool,
    history,
    spinning,
    winner,
    rotation,
    error,
    confirmClear,
    totalCount,
    setConfirmClear,
    addItem,
    removeItem,
    spin,
    reset,
    clear,
  }
}
