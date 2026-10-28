import {NextResponse} from 'next/server';
import {createHmac,timingSafeEqual} from 'node:crypto';
export const runtime='nodejs';
export async function POST(request){
 try{
  const {razorpay_order_id,razorpay_payment_id,razorpay_signature,reference,email}=await request.json();
  if(!/^order_[a-zA-Z0-9]+$/.test(razorpay_order_id||'')||!/^pay_[a-zA-Z0-9]+$/.test(razorpay_payment_id||'')||!/^[a-fA-F0-9]{64}$/.test(razorpay_signature||'')||!/^CD-[A-F0-9]{12}$/.test(reference||''))return NextResponse.json({error:'Invalid payment details'},{status:400});
  const digest=createHmac('sha256',process.env.RAZORPAY_KEY_SECRET||'').update(razorpay_order_id+'|'+razorpay_payment_id).digest('hex');
  if(!timingSafeEqual(Buffer.from(digest),Buffer.from(razorpay_signature)))return NextResponse.json({error:'Payment signature invalid'},{status:403});
  const auth=Buffer.from(process.env.RAZORPAY_KEY_ID+':'+process.env.RAZORPAY_KEY_SECRET).toString('base64');
  const [paymentResponse,orderResponse,projectResponse]=await Promise.all([
   fetch('https://api.razorpay.com/v1/payments/'+razorpay_payment_id,{headers:{Authorization:'Basic '+auth},cache:'no-store'}),
   fetch('https://api.razorpay.com/v1/orders/'+razorpay_order_id,{headers:{Authorization:'Basic '+auth},cache:'no-store'}),
   fetch('https://cheq-cheq-ce9ed76b.vercel.app/api/cheq-digital-orders?'+new URLSearchParams({reference,email}),{cache:'no-store'})
  ]);
  if(!paymentResponse.ok||!orderResponse.ok||!projectResponse.ok)return NextResponse.json({error:'Unable to verify payment'},{status:502});
  const payment=await paymentResponse.json(),gatewayOrder=await orderResponse.json(),{order:project}=await projectResponse.json();
  const quote=String(project.quote||'').replace(/,/g,'').trim().match(/^(?:₹|INR\s*)?(\d+(?:\.\d{1,2})?)$/i);
  const expected=quote?Math.round(Number(quote[1])*100):0;
  if(payment.order_id!==razorpay_order_id||gatewayOrder.receipt!==reference||payment.amount!==expected||gatewayOrder.amount!==expected||payment.currency!=='INR'||project.status!=='Approved')return NextResponse.json({error:'Payment/order mismatch; contact support'},{status:409});
  return NextResponse.json({verified:true,captured:payment.status==='captured',paymentId:razorpay_payment_id,status:payment.status});
 }catch{return NextResponse.json({error:'Verification unavailable'},{status:500})}
}
