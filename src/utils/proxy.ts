export function proxyRequest(request: Request, path: string) {
  const url = new URL(request.url)
  url.host = Bun.env.CDN_HOST!
  url.pathname = path
  url.port = '80'

  return fetch(url.toString(), {
    method: 'GET',
  })
}
