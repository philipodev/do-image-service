import sharp from 'sharp'

export async function processImage(
  blob: Blob,
  options: any,
  format: string
): Promise<[Buffer, string]> {
  const {
    w: width,
    h: height,
    q: quality,
    // TODO: later
    maw: maxWidth,
    mah: maxHeight,
  } = options

  const buffer = await blob.arrayBuffer()
  let image = sharp(buffer)

  const metadata = await image.metadata()
  const aspectRatio = metadata.width! / metadata.height!

  if (width && !height) {
    image = image.resize(+width, Math.round(+width / aspectRatio))
  } else if (!width && height) {
    image = image.resize(Math.round(+height * aspectRatio), +height)
  } else if (width && height) {
    image = image.resize(+width, +height)
  }

  let contentType: string = ''

  switch (format) {
    case 'avif':
      contentType = 'image/avif'
      image = image.avif({
        quality: +quality || 75,
      })
      break
    case 'webp':
      contentType = 'image/webp'
      image = image.webp({
        quality: +quality || 75,
      })
      break
    default:
      switch (metadata.format) {
        case 'jpeg':
          contentType = 'image/jpeg'
          image = image.jpeg({
            progressive: true,
            force: false,
            mozjpeg: true,
            quality: +quality || 75,
          })
          break
        case 'png':
          contentType = 'image/png'
          image = image.png({
            progressive: true,
            force: false,
            quality: +quality || 75,
            compressionLevel: 9,
          })
          break
      }
  }

  return [await image.toBuffer(), contentType]
}
