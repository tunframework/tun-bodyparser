import { RAW_REQUEST } from 'tun'
import type { TunComposable, TunContext } from 'tun'

// [How about koa-bodyparser](https://github.com/koajs/bodyparser/blob/master/index.js)
export function bodyparser(): TunComposable<TunContext> {
  return async (ctx, next) => {
    // await handleQuery(ctx);
    if (['GET'].indexOf(ctx.req.method) === -1 && ctx.req.is('json')) {
      await handleJSON(ctx)
    }

    // if (ctx.req.is('multipart')) {
    //   // save files into os.tmpdir();
    //   await handleMultiPart(ctx);
    // }

    return next()
  }
}

async function handleJSON(ctx: TunContext) {
  const req = ctx.req[RAW_REQUEST]
  const dataBuf: Buffer = await new Promise((resolve, reject) => {
    const chunks: Array<any> = []
    let size = 0

    req.on('data', (chunk) => {
      chunks.push(chunk)
      size += chunk.length
    })

    req.on('end', () => {
      let data = null

      switch (chunks.length) {
        case 0:
          // data = new Buffer(0);
          data = Buffer.alloc(0)
          break
        case 1:
          data = chunks[0]
          break
        default:
          // data = new Buffer(size);
          data = Buffer.alloc(size)
          for (let i = 0, I = chunks.length, pos = 0; i < I; i++) {
            const chunk = chunks[i]
            chunk.copy(data, pos)
            pos += chunk.length
          }
          break
      }

      resolve(data)
    })

    req.on('error', reject)
  })
  ctx.req.body = dataBuf.length > 0 ? JSON.parse(dataBuf.toString()) : {}
}
