export const runtime = 'nodejs';
const BACKEND = 'https://cheq-git-main-cheq-ce9ed76b.vercel.app/api/cheq-digital-orders';
export async function POST(request) {
  try {
    const payload = await request.json();
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return Response.json({error:'Invalid request'}, {status:400});
    }
    const response = await fetch(BACKEND, {
      method:'POST',
      headers:{'Content-Type':'application/json','Origin':'https://cheqdigital.shop'},
      body:JSON.stringify(payload),
      cache:'no-store',
      signal:AbortSignal.timeout(15000)
    });
    const data = await response.json().catch(()=>({error:'Unexpected response from submission service'}));
    return Response.json(data,{status:response.status,headers:{'Cache-Control':'no-store'}});
  } catch(error) {
    console.error('Digital order submit proxy failed:', error?.name || 'Unknown error');
    return Response.json({error:'Project request service temporarily unavailable. Please try again.'},{status:502,headers:{'Cache-Control':'no-store'}});
  }
}
