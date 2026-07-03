import { supabase } from '../../lib/supabaseClient.ts'
import { optimizeImage } from './image-upload.processor.ts'

const ASSETS_BUCKET = 'assets'

export async function uploadImage(file: File, folder: string) {
  const optimizedFile = await optimizeImage(file)
  const filePath = `${folder}/${optimizedFile.name}`

  const { error } = await supabase.storage
    .from(ASSETS_BUCKET)
    .upload(filePath, optimizedFile, {
      cacheControl: '3600',
      upsert: true,
      contentType: optimizedFile.type,
    })

  if (error) {
    throw new Error(getImageUploadErrorMessage(error.message, folder))
  }

  const { data } = supabase.storage.from(ASSETS_BUCKET).getPublicUrl(filePath)

  if (!data.publicUrl) {
    throw new Error('No pudimos obtener la URL pública de la imagen.')
  }

  return data.publicUrl
}

export function uploadTeamLogo(file: File) {
  return uploadImage(file, 'teams')
}

export function uploadNewsImage(file: File) {
  return uploadImage(file, 'news')
}

function getImageUploadErrorMessage(message: string, folder: string) {
  if (message.toLowerCase().includes('bucket')) {
    return `No pudimos subir la imagen porque falta configurar el bucket "assets" en Supabase Storage para la carpeta "${folder}".`
  }

  return 'No pudimos subir la imagen.'
}
