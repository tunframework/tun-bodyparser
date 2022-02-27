import assert from 'assert'

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import fetch from 'node-fetch'
import FormData from 'form-data'

import { prepareApp } from './boot.js'

// @ts-ignore
const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('tun-bodyparser', () => {
  it('should be able to parse request body', (done) => {
    const { app, boot } = prepareApp()

    const params = { a: 'A', b: 'B' }
    let data = { a: 1, b: '2', c: { d: '4' } }
    app.use(async (ctx, next) => {
      return {
        params,
        data
      }
    })
    boot(async (server, url) => {
      try {
        const querystring = new URLSearchParams(params).toString()
        const response = await fetch(`${url}?${querystring}`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          }
        })
        const result: any = await response.json()

        assert.deepEqual(result.params, params)
        assert.deepEqual(result.data, data)
        done()
      } catch (error) {
        done(error)
      }
    })
  })

  it('parse multipart/form-data for files', function (done) {
    const { app, boot } = prepareApp()
    app.use(async (ctx, next) => {
      assert.ok(ctx.req.files)
      assert.ok(ctx.req.files['file'], 'should get the right file')
      const path = ctx.req.files['file'].path
      ctx.body = fs.readFileSync(path, 'utf8')
      fs.unlinkSync(path)
    })

    // [Nodejs发送multipart/form-data请求](https://blog.csdn.net/q1242027878/article/details/81120814)
    // [Node-Fetch文件上传简单示例](https://www.jianshu.com/p/34f72dbb5f13)

    const filename = path.resolve(__dirname, 'abc.txt')
    assert.ok(fs.existsSync(filename), 'test file should exist')

    const expected = fs.readFileSync(filename, 'utf8')

    const form = new FormData()
    form.append('file', fs.createReadStream(filename, 'utf8'))

    const headers = form.getHeaders()

    boot(async (server, url) => {
      try {
        const _url = new URL(url)

        const result = await fetch(url, {
          method: 'POST',
          body: form,
          headers
        }).then((res) => res.text())

        assert.equal(result, expected)

        done()
      } catch (error) {
        done(error)
      }
    })
  })
})
