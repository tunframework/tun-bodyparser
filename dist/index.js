import { RAW_REQUEST } from '@tunframework/tun';
import formidable from 'formidable';
// [How about koa-bodyparser](https://github.com/koajs/bodyparser/blob/master/index.js)
export function bodyparser() {
    return async (ctx, next) => {
        // await handleQuery(ctx);
        if (['GET'].indexOf(ctx.req.method) === -1 && ctx.req.is('json')) {
            await handleJSON(ctx);
        }
        if (ctx.req.is('multipart')) {
            await handleMultiPart(ctx);
        }
        return next();
    };
}
async function handleJSON(ctx) {
    const req = ctx.req[RAW_REQUEST];
    const dataBuf = await new Promise((resolve, reject) => {
        const chunks = [];
        let size = 0;
        req.on('data', (chunk) => {
            chunks.push(chunk);
            size += chunk.length;
        });
        req.on('end', () => {
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
        req.on('error', reject);
    });
    ctx.req.body = dataBuf.length > 0 ? JSON.parse(dataBuf.toString()) : {};
}
// https://nodejs.org/en/knowledge/HTTP/servers/how-to-handle-multipart-form-data/
async function handleMultiPart(ctx) {
    const _req = ctx.req[RAW_REQUEST];
    const form = new formidable.IncomingForm();
    const { fields, files } = await new Promise((resolve, reject) => {
        form.parse(_req, (err, fields, files) => {
            if (err)
                return reject(err);
            return resolve({ fields, files });
        });
    });
    ctx.req._fields = fields;
    ctx.req._files = files;
    // clear array
    ctx.req.fields = {};
    ctx.req.files = {};
    for (const k of fields) {
        let v = fields[k];
        if (Array.isArray(v)) {
            v = v[0];
        }
        ctx.req.fields[k] = v;
    }
    for (const k of files) {
        let v = files[k];
        if (Array.isArray(v)) {
            v = v[0];
        }
        ctx.req.files[k] = v;
    }
}
