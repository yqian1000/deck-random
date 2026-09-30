import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { DeckItem } from '../types'

type WheelProps = {
  items: DeckItem[]
  rotation: number
}

function truncate(text: string, max: number): string {
  if (text.length <= max) {
    return text
  }
  return `${text.slice(0, max)}…`
}

export function Wheel({ items, rotation }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const imagesRef = useRef(new Map<string, HTMLImageElement>())
  const itemsRef = useRef(items)
  const rotationRef = useRef(rotation)
  const drawRef = useRef<() => void>(() => {})
  const [imageVersion, setImageVersion] = useState(0)

  useLayoutEffect(() => {
    itemsRef.current = items
    rotationRef.current = rotation
  })

  useEffect(() => {
    let cancelled = false
    for (const item of items) {
      if (!item.imageUrl || imagesRef.current.has(item.imageUrl)) {
        continue
      }
      const img = new Image()
      img.onload = () => {
        if (cancelled) {
          return
        }
        imagesRef.current.set(item.imageUrl as string, img)
        setImageVersion((v) => v + 1)
      }
      img.src = item.imageUrl
    }
    return () => {
      cancelled = true
    }
  }, [items])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) {
      return
    }

    const draw = () => {
      const currentItems = itemsRef.current
      const currentRotation = rotationRef.current
      const dpr = window.devicePixelRatio || 1
      const size = Math.max(1, Math.floor(wrap.clientWidth))
      const pixel = Math.floor(size * dpr)
      if (canvas.width !== pixel || canvas.height !== pixel) {
        canvas.width = pixel
        canvas.height = pixel
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, size, size)

      const cx = size / 2
      const cy = size / 2
      const radius = size / 2 - 10

      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fillStyle = '#1a1c24'
      ctx.fill()

      const count = currentItems.length
      if (count === 0) {
        ctx.beginPath()
        ctx.arc(cx, cy, radius - 6, 0, Math.PI * 2)
        ctx.setLineDash([10, 10])
        ctx.strokeStyle = 'rgba(232, 197, 71, 0.35)'
        ctx.lineWidth = 3
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = 'rgba(243, 236, 216, 0.72)'
        ctx.font = '600 16px system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('添加对象后开始', cx, cy)
        return
      }

      const slice = (Math.PI * 2) / count
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(currentRotation)

      for (let i = 0; i < count; i += 1) {
        const item = currentItems[i]
        if (!item) {
          continue
        }
        const start = -Math.PI / 2 - slice / 2 + i * slice
        const end = start + slice
        const mid = start + slice / 2

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, radius, start, end)
        ctx.closePath()
        ctx.fillStyle = item.color
        ctx.fill()
        ctx.strokeStyle = 'rgba(8, 8, 12, 0.4)'
        ctx.lineWidth = count > 16 ? 1 : 2
        ctx.stroke()

        const image = item.imageUrl
          ? imagesRef.current.get(item.imageUrl)
          : undefined
        if (image) {
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.arc(0, 0, radius, start, end)
          ctx.closePath()
          ctx.clip()
          const dist = count <= 8 ? radius * 0.42 : radius * 0.52
          const imgSize =
            count <= 6 ? radius * 0.36 : count <= 12 ? radius * 0.26 : radius * 0.16
          const ix = Math.cos(mid) * dist
          const iy = Math.sin(mid) * dist
          ctx.save()
          ctx.beginPath()
          ctx.arc(ix, iy, imgSize / 2, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(
            image,
            ix - imgSize / 2,
            iy - imgSize / 2,
            imgSize,
            imgSize,
          )
          ctx.restore()
          ctx.restore()
        }

        if (item.text) {
          ctx.save()
          ctx.rotate(mid)
          ctx.textAlign = 'right'
          ctx.textBaseline = 'middle'
          const fontSize = count <= 8 ? 16 : count <= 16 ? 13 : 11
          ctx.font = `600 ${fontSize}px system-ui, sans-serif`
          const maxChars = count <= 8 ? 10 : count <= 16 ? 7 : 5
          const label = truncate(item.text, maxChars)
          ctx.lineWidth = 4
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)'
          ctx.strokeText(label, radius - 14, 0)
          ctx.fillStyle = '#fff8ee'
          ctx.fillText(label, radius - 14, 0)
          ctx.restore()
        }
      }

      ctx.restore()

      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = '#e8c547'
      ctx.lineWidth = 7
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx, cy, Math.max(18, radius * 0.11), 0, Math.PI * 2)
      ctx.fillStyle = '#14161d'
      ctx.fill()
      ctx.strokeStyle = '#e8c547'
      ctx.lineWidth = 3
      ctx.stroke()
    }

    drawRef.current = draw
    const rafDraw = () => {
      requestAnimationFrame(() => drawRef.current())
    }
    draw()
    const observer = new ResizeObserver(rafDraw)
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    drawRef.current()
  }, [imageVersion, items, rotation])

  return (
    <div className="wheel-wrap" ref={wrapRef}>
      <div className="pointer" aria-hidden="true" />
      <canvas ref={canvasRef} role="img" aria-label="抽奖转盘" />
    </div>
  )
}
