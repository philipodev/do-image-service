import Elysia from 'elysia'
import { hash } from '../utils/hash'
import { buildOptionsString } from '../utils/options'
import { proxyRequest } from '../utils/proxy'
import redis from '../utils/redis'
import { put } from '../utils/s3'
import { processImage } from '../utils/sharp'

const BASE_URL = Bun.env.BASE_URL!
const BUCKET_KEY_PREFIX = Bun.env.BUCKET_KEY_PREFIX!

export default new Elysia()
  //
  .get('/*', async ({ params, query, request, set }) => {
    const path = params['*']
    const imageUrl = `${BASE_URL}${path}`

    const format = getImageFormat(
      request.headers.get('Accept')!,
      query.format as any
    )

    const fileHash = hash(path + buildOptionsString(query as any) + format)
    const fileKey = path + '/' + fileHash + '.' + format

    if (await redis.exists(fileKey)) {
      return proxy()
    }

    const response = await fetch(imageUrl)
    const blob = await response.blob()

    const [optimized, contentType] = await processImage(blob, query, format)
    const optimizedBlob = new Blob([optimized], {
      type: contentType,
    })

    await put(BUCKET_KEY_PREFIX + fileKey, optimizedBlob)

    await redis.set(fileKey, '1')

    return proxy()

    /**
     * Functions
     */

    function getImageFormat(acceptHeader: string, queryFormat?: string) {
      if (queryFormat && queryFormat !== 'auto') {
        return queryFormat
      }

      if (acceptHeader.includes('image/avif')) {
        return 'avif'
      }

      if (acceptHeader.includes('image/webp')) {
        return 'webp'
      }

      return 'base'
    }

    async function proxy() {
      const proxy = await proxyRequest(request, fileKey)

      set.headers = Object.fromEntries(proxy.headers)
      set.status = proxy.status

      return proxy
    }
  })
