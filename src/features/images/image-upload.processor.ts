import {
  ALLOWED_IMAGE_MIME_TYPES,
  type AllowedImageMimeType,
  type OptimizedImageOptions,
} from './image-upload.types.ts'

const MAX_ORIGINAL_IMAGE_SIZE_BYTES = 20 * 1024 * 1024
const DEFAULT_OPTIMIZATION_OPTIONS: OptimizedImageOptions = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.85,
}

export function validateImageFile(file: File) {
  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(file.type as AllowedImageMimeType)
  ) {
    throw new Error('La imagen debe ser PNG, JPG, JPEG o WEBP.')
  }

  if (file.size > MAX_ORIGINAL_IMAGE_SIZE_BYTES) {
    throw new Error('La imagen original no puede superar los 20 MB.')
  }
}

export async function optimizeImage(
  file: File,
  options: OptimizedImageOptions = DEFAULT_OPTIMIZATION_OPTIONS,
) {
  validateImageFile(file)

  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(objectUrl)
    const dimensions = getTargetDimensions(
      image.width,
      image.height,
      options.maxWidth,
      options.maxHeight,
    )

    const canvas = document.createElement('canvas')
    canvas.width = dimensions.width
    canvas.height = dimensions.height

    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('No pudimos preparar la imagen para subir.')
    }

    context.drawImage(image, 0, 0, dimensions.width, dimensions.height)

    const blob = await canvasToBlob(canvas, options.quality)
    const optimizedFileName = `image-${Date.now()}-${crypto.randomUUID()}.webp`

    return new File([blob], optimizedFileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('No pudimos leer la imagen seleccionada.'))
    image.src = source
  })
}

function getTargetDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
) {
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return {
      width: originalWidth,
      height: originalHeight,
    }
  }

  const scale = Math.min(maxWidth / originalWidth, maxHeight / originalHeight)

  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale),
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('No pudimos optimizar la imagen seleccionada.'))
          return
        }

        resolve(blob)
      },
      'image/webp',
      quality,
    )
  })
}
