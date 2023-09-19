import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export const put = async (key: string, blob: Blob) => {
  const url = await getS3SignedUrl(key, blob.type)

  return fetch(url, {
    method: 'PUT',
    body: blob,
    headers: {
      'Content-Type': blob.type,
    },
  })
}

const getS3SignedUrl = async (key: string, contentType: string) => {
  const command = new PutObjectCommand({
    Key: key,
    Bucket: process.env.AWS_BUCKET_NAME,
    ContentType: contentType,
  })

  return getSignedUrl(client, command, { expiresIn: 600 })
}
