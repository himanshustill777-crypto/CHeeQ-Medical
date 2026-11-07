import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire, builtinModules } from 'node:module';
const require=createRequire(import.meta.url),esbuild=require(process.env.CHEQ_ESBUILD||'esbuild');
const root=path.resolve(import.meta.dirname,'..'),assets={};
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.txt':'text/plain; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon'};
async function visit(dir,prefix=''){for(const d of await fs.readdir(dir,{withFileTypes:true})){const full=path.join(dir,d.name),rel=prefix+'/'+d.name;if(d.isDirectory())await visit(full,rel);else assets[rel]={type:types[path.extname(d.name)]||'application/octet-stream',body:(await fs.readFile(full)).toString('base64')};}}
await visit(path.join(root,'out'));
await fs.writeFile(path.join(root,'cloudflare/generated-assets.mjs'),'export const assets='+JSON.stringify(assets)+';');
await fs.mkdir(path.join(root,'dist'),{recursive:true});
await esbuild.build({entryPoints:[path.join(root,'cloudflare/worker.mjs')],outfile:path.join(root,'dist/worker.mjs'),bundle:true,format:'esm',platform:'node',target:'es2022',minify:true,
  external:['cloudflare:*',...builtinModules,...builtinModules.map(x=>'node:'+x)],
  plugins:[{name:'portable-api',setup(build){
    build.onResolve({filter:/^next\/server$/},()=>({path:path.join(root,'cloudflare/next-response.mjs')}));
    build.onLoad({filter:/cloudflare\/api\/.*\.js$/},async a=>({contents:"import {serviceFetch as fetch} from '"+path.join(root,'cloudflare/backend.mjs')+"';\n"+await fs.readFile(a.path,'utf8'),loader:'js'}));
  }}]});
console.log(JSON.stringify({staticAssets:Object.keys(assets).length,workerBytes:(await fs.stat(path.join(root,'dist/worker.mjs'))).size}));
