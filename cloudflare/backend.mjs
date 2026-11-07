import { env } from 'cloudflare:workers';
export async function serviceFetch(input, init) {
  const url=new URL(typeof input==='string'?input:input.url);
  if (url.hostname==='cheq-git-main-cheq-ce9ed76b.vercel.app') {
    const headers=new Headers(init?.headers||{});
    headers.set('Origin','https://cheqdigital.shop');
    const target=new URL(url.pathname+url.search,'https://cheq-app.internal');
    return env.CHEQ_APP.fetch(new Request(target,{...init,headers}));
  }
  return globalThis.fetch(input,init);
}
