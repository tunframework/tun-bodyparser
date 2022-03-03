# tun-bodyparser

bodyparser for tun

## install

```sh
npm install @tunframework/tun{,-bodyparser}
```

## example

```ts
import { TunApplication } from '@tunframework/tun'
import { bodyparser } from '@tunframework/tun-bodyparser'
import type { AddressInfo, ListenOptions } from 'net'

const app = new TunApplication()
app.use(bodyparser())
const option: ListenOptions = { host: '127.0.0.1', port: 0 }
const server = app.listen(option)

server.on('listening', async () => {
  let addr = (server.address() || {}) as AddressInfo
  const url = 'http://' + [addr.address, addr.port].filter(Boolean).join(':')
  console.log(`listening: ${url}`)
})
```
