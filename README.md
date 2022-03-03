# tun-bodyparser

bodyparser for tun

## install

```sh
npm install @tunframework/tun{,-bodyparser}
```

## example

```js
import { TunApplication } from '@tunframework/tun'
import { bodyparser } from '@tunframework/tun-bodyparser'

const app = new TunApplication()
app.use(bodyparser())
app.use(async (ctx, next) => {
  const data = ctx.req.body
  return { data }
})
const server = app.listen({ host: '127.0.0.1', port: 0 })

server.on('listening', async () => {
  // @type {AddressInfo}
  let addr = server.address() || {}
  console.log(`listening: http://${addr.address}:${addr.port}`)
})
```
