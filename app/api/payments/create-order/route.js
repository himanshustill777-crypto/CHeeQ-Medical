import {NextResponse} from 'next/server';
export const runtime='nodejs';
export async function POST(request){
 try{
  if(!process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live_')||!process.env.RAZORPAY_KEY_SECRET)return NextResponse.json({error:'Live payment configuration incomplete'},{status:503});
  const {reference,email}=await request.json();
  if(!/^CD-[A-F0-9]{12}$/.test(reference||'')||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email||''))return NextResponse.json({error:'Valid reference and email required'},{status:400});
  const base='https://cheq-cheq-ce9ed76b.vercel.app/api/cheq-digital-orders';
  const response=await fetch(base+'?'+new URLSearchParams({reference,email}),{cache:'no-store'});
  if(!response.ok)return NextResponse.json({error:'Order not found or unavailable'},{status:404});
  const {order}=await response.json();
  if(order.status!=='Approved')return NextResponse.json({error:'Admin approval required'},{status:403});
  const raw=String(order.quote||'').replace(/,/g,'').trim();
  const match=raw.match(/^(?:₹|INR\s*)?(\d+(?:\.\d{1,2})?)$/i);
  if(!match)return NextResponse.json({error:'A numeric final quotation is required'},{status:422});
  const paise=Math.round(Number(match[1])*100);
  if(!Number.isSafeInteger(paise)||paise<100||paise>100000000)return NextResponse.json({error:'Invalid approved amount'},{status:422});
  const auth=Buffer.from(process.env.RAZORPAY_KEY_ID+':'+process.env.RAZORPAY_KEY_SECRET).toString('base64');
  const razor=await fetch('https://api.razorpay.com/v1/orders',{method:'POST',headers:{Authorization:'Basic '+auth,'Content-Type':'application/json'},body:JSON.stringify({amount:paise,currency:'INR',receipt:reference,notes:{reference,service:order.service}}),cache:'no-store'});
  const data=await razor.json();
  if(!razor.ok||!data.id)return NextResponse.json({error:'Unable to start payment'},{status:502});
  return NextResponse.json({key:process.env.RAZORPAY_KEY_ID,orderId:data.id,amount:paise,currency:'INR',reference});
 }catch{return NextResponse.json({error:'Payment setup unavailable'},{status:500})}
}
