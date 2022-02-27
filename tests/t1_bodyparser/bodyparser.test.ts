import { TunContext } from '@tunframework/tun'
import { bodyparser } from '../../lib/index.js'

import assert from 'assert'

//
import FormData from 'form-data'
import fs from 'fs'
import http from 'http'

import path from 'path'

import { fileURLToPath } from 'url'

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

import fetch from 'node-fetch'
import { prepareApp } from './boot.js'

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

  /*
  it('parse multipart/form-data for files', async function () {
    const app = new App();

    const proto = 'http';
    const hostname = 'localhost';
    let port = 0;// 为 0, 表示 随机 取得一个空闲的端口
    const pathname = '/upload';

    app.use(body())
      .use(async (ctx, next) => {
        assert.ok(ctx.path === pathname, 'should enter the path for test');
        assert.ok(ctx.request.files);
        // console.log('ctx.files', ctx.files);
        assert.ok(ctx.request.files['file'], 'should get the right file');
        ctx.body = fs.readFileSync(ctx.request.files['file'].path, 'utf8');
      });

    const server = await new Promise(resolve => {
      const server = app.listen(port, hostname, () => {
        // refers: https://frontenddev.org/link/use-nodejs-start-a-random-port-available.html
        // @ts-ignore
        port = server.address().port;
        // console.log(`test app is listening on ${proto}://${hostname}:${port}`);
        resolve(server);
      });
    });

    // Nodejs发送multipart/form-data请求
    // refers: https://blog.csdn.net/q1242027878/article/details/81120814

    const filename = path.resolve(__dirname, 'abc.txt');
    assert.ok(fs.existsSync(filename), 'test file should exist');

    const expected = fs.readFileSync(filename, 'utf8');

    const form = new FormData();
    form.append('file', fs.createReadStream(filename, 'utf8'));

    const headers = form.getHeaders();

    const dataBuf = await new Promise((resolve, reject) => {
      const request = http.request({
        method: 'post',
        host: 'localhost',
        port,
        path: pathname,
        headers
      }, (res => {
        const chunks = [];
        let size = 0;

        res.on('data', (chunk) => {
          chunks.push(chunk);
          size += chunk.length;
        });

        res.on('end', () => {
          let data = null;

          switch (chunks.length) {
            case 0:
              // data = new Buffer(0);
              data = Buffer.alloc(0);
              break;
            case 1:
              data = chunks[0];
              break;
            default:
              // data = new Buffer(size);
              data = Buffer.alloc(size);
              for (let i = 0, I = chunks.length, pos = 0; i < I; i++) {
                const chunk = chunks[i];
                chunk.copy(data, pos);
                pos += chunk.length;
              }
              break;
          }

          resolve(data);
        });

        res.on('error', reject);
      }));
      form.pipe(request);
    });

    assert.ok(dataBuf.length > 0);
    assert.strictEqual(dataBuf.toString(), expected);

    await new Promise((resolve, reject) => {
      server.close((err) => {
        if(err) return reject(err);
        resolve();
      });
    });
  })
  */
})
