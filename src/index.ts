import { Elysia } from 'elysia'
import get from './groups/get'

const app = new Elysia()
  .get('/', () => 'Hello Elysia')
  .use(get)
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
