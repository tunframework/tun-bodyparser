import { TunApplication, TunContext } from 'tun'
import bodyparser from '../../index.js'

// const app = new TunApplication();

// app.use(bodyparser())
// .listen({ port: 3000 });

// @ts-check

import assert from 'assert'

//
import FormData from 'form-data'
import fs from 'fs'
import http from 'http'

import path from 'path'

import { fileURLToPath } from 'url'

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

function genQuery(
  data,
  scope = '',
  genScope = (parentScope, key) =>
    parentScope ? `${parentScope}[${key}]` : key
) {
  return Object.keys(data)
    .map((item) => {
      if (typeof data[item] === 'object') {
        if (data[item] !== null && data[item] !== undefined) {
          return genQuery(data[item], genScope(scope, item))
        }
      }
      if (scope) {
        return `${scope}[${item}]=${data[item]}`
      }
      return `${item}=${data[item]}`
    })
    .join('&')
}

describe('tun-bodyparser', function () {
  it("should parse buffered-json-data to ctx.req.fields by ctx.req[RAW_REQUEST].on('data', ...)", async function () {
    assert(typeof bodyparser === 'function', 'body should be function')

    let queryData = { a: 22, b: 33 }
    let data = { a: 1, b: '2', c: { d: '4' } }
    let ctx = new TunContext(
      {
        url: `/test?${genQuery(queryData)}`,
        headers: {
          'content-type': 'application/json'
        },
        // mock data
        // @ts-ignore
        on(eventName, callback) {
          callback(Buffer.from(JSON.stringify(data)))
        }
      },
      {}
      // {}
    )

    let middleware = bodyparser()
    assert(
      typeof middleware === 'function',
      'bodyparser() should return a function'
    )

    await middleware(ctx, () => Promise.resolve())

    // console.log('ctx', ctx)

    // console.log('fields', ctx.req['fields'])
    // console.log('data', data)

    // assert(JSON.stringify(ctx.req['fields']) === JSON.stringify(data), 'should convert buf to data correctly.')
    // assert.deepStrictEqual(ctx.fields, data, 'should convert buf to data correctly.');
    // assert.deepStrictEqual(ctx.fields, ctx.req.fields, 'should mount data to two points');

    assert.ok(ctx.req.querystring)
    for (let k in queryData) {
      if (Object.prototype.hasOwnProperty.call(queryData, k)) {
        assert.equal(
          ctx.req.query.get(k),
          queryData[k],
          'should convert query to data correctly.'
        )
      }
    }
    // assert.deepEqual(ctx.query, ctx.request.query, 'should mount data to two points');
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
