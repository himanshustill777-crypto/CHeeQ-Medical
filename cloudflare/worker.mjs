import { assets } from './generated-assets.mjs';
import { POST as submit } from './api/digital-order-submit/route.js';
import { POST as createOrder } from './api/payments/create-order/route.js';
import { POST as verify } from './api/payments/verify/route.js';
import { serviceFetch } from './backend.mjs';
export default {
  async fetch(request, env) {
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/';
    if(path==='/__migration/health')return Response.json({service:'cheq-digital',hosting:'cloudflare',mode:env.CHEQ_MIGRATION_MODE||'testing',backendConnected:!!env.CHEQ_APP,paymentsEnabled:env.CHEQ_DIGITAL_PAYMENTS_ENABLED==='true'},{headers:{'Cache-Control':'no-store'}});
    if(path.startsWith('/api/')){
      try {
        if(path==='/api/digital-orders'&&request.method==='GET'){
          const query=new URLSearchParams({reference:url.searchParams.get('reference')||'',email:url.searchParams.get('email')||''});
          return serviceFetch('https://cheq-git-main-cheq-ce9ed76b.vercel.app/api/cheq-digital-orders?'+query);
        }
        if(request.method!=='POST')return Response.json({error:'Method not allowed'},{status:405});
        if(path==='/api/digital-order-submit')return submit(request);
        if(['/api/payments/create-order','/api/payments/verify'].includes(path)){
          if(env.CHEQ_DIGITAL_PAYMENTS_ENABLED!=='true')return Response.json({error:'Payments are unavailable during migration testing. No payment has been initiated.'},{status:503});
          return path.endsWith('create-order')?createOrder(request):verify(request);
        }
        return Response.json({error:'Not found'},{status:404});
      }catch(e){console.error(JSON.stringify({event:'digital_api_failed',path,code:e.name||'Error'}));return Response.json({error:'Service temporarily unavailable'},{status:502});}
    }
    if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
    const candidates=[url.pathname,url.pathname+'index.html',url.pathname+'/index.html'];
    const key=candidates.find(x=>assets[x]);
    if(!key)return new Response('Not found',{status:404});
    const asset=assets[key];
    return new Response(request.method==='HEAD'?null:Uint8Array.from(atob(asset.body),c=>c.charCodeAt(0)),{headers:{'Content-Type':asset.type,'Cache-Control':key.endsWith('.html')?'no-cache':'public,max-age=86400','X-Content-Type-Options':'nosniff'}});
  }
};
