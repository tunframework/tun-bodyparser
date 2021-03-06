import { RAW_REQUEST } from '@tunframework/tun'
import type { File } from '@tunframework/tun'
import type { TunComposable, TunContext } from '@tunframework/tun'
import formidable from 'formidable'

// [How about koa-bodyparser](https://github.com/koajs/bodyparser/blob/master/index.js)
export function bodyparser(): TunComposable<TunContext> {
  return async (ctx, next) => {
    // await handleQuery(ctx);
    if (['GET'].indexOf(ctx.req.method) === -1 && ctx.req.is('json')) {
      await handleJSON(ctx)
    }

    if (ctx.req.is('multipart')) {
      await handleMultiPart(ctx)
    }

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

// https://nodejs.org/en/knowledge/HTTP/servers/how-to-handle-multipart-form-data/
async function handleMultiPart(ctx: TunContext) {
  const _req = ctx.req[RAW_REQUEST]

  const form = new formidable.IncomingForm()

  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(_req, (err, fields, files) => {
      if (err) return reject(err)
      return resolve({ fields, files })
    })
  })

  ctx.req._fields = fields
  ctx.req._files = files
  // clear array
  ctx.req.fields = {}
  ctx.req.files = {}
  for (const k in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, k)) {
      let v = fields[k]
      if (Array.isArray(v)) {
        v = v[0]
      }
      ctx.req.fields[k] = v
    }
  }

  for (const k in files) {
    if (Object.prototype.hasOwnProperty.call(files, k)) {
      // let v: PersistentFile = files[k]
      let v: any = files[k]
      if (Array.isArray(v)) {
        v = v[0]
      }
      const obj: File = {
        size: v.size,
        path: v.filepath,
        name: v.originalFilename,
        type: v.mimetype,
        lastModifiedDate: v.lastModifiedDate,
        hash: v.hash,
        // @ts-ignore
        __raw: v
      }
      obj.toJSON = () => JSON.stringify(obj)
      ctx.req.files[k] = obj
    }
  }
}
