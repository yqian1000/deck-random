const MAX_EDGE = 512

export async function compressToObjectUrl(file: File): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return URL.createObjectURL(file)
    }
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/webp', 0.82)
    })
    if (!blob) {
      return URL.createObjectURL(file)
    }
    return URL.createObjectURL(blob)
  } catch {
    return URL.createObjectURL(file)
  }
}

export function revokeUrl(url: string | null): void {
  if (url) {
    URL.revokeObjectURL(url)
  }
}
