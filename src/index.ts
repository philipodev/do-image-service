require('dotenv').config()

import { validateImage } from './image/validate'
import * as http from 'http'
import * as https from 'https'

const TIMEOUT = 5000

console.info('AWS_ACCESS_KEY_ID: ' + process.env.AWS_ACCESS_KEY_ID)

const server = http.createServer((req, res) => {
  validateImage(req, res)
    .then((key) => {
      const proxyUrl = new URL(key, `https://${process.env.CDN_HOST}`)

      console.info('proxyUrl', proxyUrl.toString())

      // Make the request to the target host
      const proxyReq = https.request(proxyUrl, (proxyRes) => {
        res.writeHead(proxyRes.statusCode!, proxyRes.headers)
        proxyRes.pipe(res)
      })

      // Handle errors on the proxy request
      proxyReq.on('error', (err) => {
        console.error(`Error during proxy request: ${err.message}`)
        res.writeHead(500)
        res.end('Internal Server Error')
      })

      proxyReq.setTimeout(TIMEOUT, () => {
        console.error('Proxy request timed out')
        proxyReq.destroy()
        res.writeHead(504) // 504 Gateway Timeout
        res.end('Gateway Timeout')
      })

      req.pipe(proxyReq)
    })
    .catch((err) => {
      console.error(`Error during image validation: ${err.message}`)
      res.writeHead(500)
      res.end('Internal Server Error')
    })
})

server.listen(3000, () => {
  console.log('Listening on port 3000')
})
