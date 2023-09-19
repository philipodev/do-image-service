import { hash } from '../utils/hash'
import { buildOptionsString, getImageFormat } from '../utils/options'
import redis from '../utils/redis'
import { put } from '../utils/s3'
import { processImage } from '../utils/sharp'
import { IncomingMessage, ServerResponse } from 'http'

export async function validateImage(
  request: IncomingMessage,
  response: ServerResponse
): Promise<string> {
  const url = new URL(decodeURIComponent(request.url!), 'http://localhost')
  const { pathname, searchParams } = url

  const query = Object.fromEntries(searchParams)

  const format = getImageFormat(
    request.headers.accept as string,
    query.format as any
  )

  const fileKey = hash(pathname + buildOptionsString(query) + format)
  const fullKey = pathname + '/' + fileKey + '.' + format

  if (await redis.exists(fileKey)) {
    return fullKey
  }

  const imageUrl = process.env.BASE_URL! + pathname
  const fetchResponse = await fetch(imageUrl)
  const blob = await fetchResponse.blob()

  const [optimized, contentType] = await processImage(blob, query, format)
  const optimizedBlob = new Blob([optimized], {
    type: contentType,
  })

  await put(process.env.BUCKET_KEY_PREFIX + fullKey, optimizedBlob)

  await redis.set(fileKey, '1')

  return fullKey
}
