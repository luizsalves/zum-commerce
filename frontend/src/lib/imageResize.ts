/** Lado máximo das fotos de produto: suficiente para o zoom da Shopify sem pesar no envio. */
export const MAX_SIDE = 2048
const TARGET_BYTES = 1_000_000

/** Reduz largura e altura para caber em maxSide, mantendo a proporção. Nunca aumenta. */
export function fitWithin(width: number, height: number, maxSide = MAX_SIDE) {
  const scale = Math.min(1, maxSide / Math.max(width, height))
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

/**
 * Diminui a foto no navegador (JPEG de até ~1 MB) antes de enviar para a Shopify.
 * GIF (pode ser animado) e formatos que o navegador não abre (ex.: HEIC fora do Safari) vão como estão.
 */
export async function shrinkImage(file: File): Promise<File> {
  if (file.type === 'image/gif') return file

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file
  }

  const { width, height } = fitWithin(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  // PNG transparente ganha fundo branco, já que o JPEG não tem transparência.
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  let blob: Blob | null = null
  for (const quality of [0.85, 0.75, 0.65]) {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (blob && blob.size <= TARGET_BYTES) break
  }
  if (!blob || blob.size >= file.size) return file
  return new File([blob], file.name.replace(/\.[^.]*$/, '') + '.jpg', { type: 'image/jpeg' })
}
