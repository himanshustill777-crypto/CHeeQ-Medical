'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
export default function HiddenIT(){
 const [status,setStatus]=useState('Loading approved payment...'),[busy,setBusy]=useState(false);
 const launched=useRef(false);
 const [closed,setClosed]=useState(false);
 const [paid,setPaid]=useState(false);
 const [preview,setPreview]=useState(null);
 async function pay(ref,mail){
  if(!/^CD-[A-F0-9]{12}$/.test(ref)||!/^\S+@\S+\.\S+$/.test(mail)){setStatus('A verified order reference and email are required.');return}
  setBusy(true);setStatus('Preparing secure Razorpay checkout...');
  try{
   const orderResponse=await fetch('/api/payments/create-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reference:ref,email:mail})});
   const order=await orderResponse.json();if(!orderResponse.ok)throw Error(order.error||'Payment unavailable');
   if(!window.Razorpay){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://checkout.razorpay.com/v1/checkout.js';s.onload=resolve;s.onerror=()=>reject(Error('Unable to load Razorpay'));document.head.appendChild(s)})}
   const checkout=new window.Razorpay({key:order.key,amount:order.amount,currency:'INR',name:'CHEQ DIGITAL',description:'Approved service payment',order_id:order.orderId,handler:async(result)=>{
    setStatus('Verifying payment...');
    try{const response=await fetch('/api/payments/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...result,reference:ref,email:mail})});const verified=await response.json();if(!response.ok)throw Error(verified.error||'Verification pending');setPaid(true);setClosed(false);setStatus(verified.captured?'Payment captured and verified. Payment ID: '+verified.paymentId:'Payment received; capture is pending. Payment ID: '+verified.paymentId)}
    catch(e){setStatus(e.message+' Please contact support before retrying.')}
   },modal:{ondismiss:()=>{window.location.replace('https://cheq-ten.vercel.app/')}},theme:{color:'#173c78'}});
   checkout.on('payment.failed',()=>{setClosed(true);setStatus('Payment failed. No successful payment has been confirmed. Check status before retrying.')});
   checkout.open();
  }catch(e){setStatus(e.message)}finally{setBusy(false)}
 }
 useEffect(()=>{const q=new URLSearchParams(window.location.search);const ref=q.get('reference')||'',mail=q.get('email')||'';if(q.get('preview')==='rent'){const name=q.get('name')||'',mobile=q.get('mobile')||'',amount=Number(q.get('amount'));if(name.trim().length>=2&&/^\S+@\S+\.\S+$/.test(mail)&&/^\d{10}$/.test(mobile)&&Number.isFinite(amount)&&amount>0&&amount<=1000000){setPreview({name,mail,mobile,amount:amount.toFixed(2)});setStatus('Rent redirect test successful. No payment has been initiated.')}else{setStatus('Incomplete rent preview details. No payment has been initiated.')}return}if(ref&&mail&&!launched.current){launched.current=true;pay(ref,mail)}else if(!ref||!mail){setStatus('Approved payment link is incomplete. Please return to the original service and tap Pay Now again.')}},[]);
 return <main style={{minHeight:'100dvh',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
  <div style={{maxWidth:430,width:'100%',textAlign:'center'}}>
   {(closed||paid||preview||(!busy&&status!=='Preparing secure Razorpay checkout...'&&status!=='Loading approved payment...'))&&<p role="status" style={{fontSize:15,color:'#334155'}}>{status}</p>}
   {busy&&<p role="status" style={{color:'#64748b'}}>Opening secure checkout...</p>}
   {closed&&!paid&&<div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginTop:20}}>
    <a href="https://cheq-ten.vercel.app/" style={{padding:'12px 18px',borderRadius:10,background:'#173c78',color:'#fff',textDecoration:'none'}}>Back to CHEQ</a>
    <button type="button" onClick={()=>{setClosed(false);const q=new URLSearchParams(window.location.search);pay(q.get('reference')||'',q.get('email')||'')}} style={{padding:'12px 18px',borderRadius:10,border:'1px solid #cbd5e1',background:'#fff'}}>Reopen Checkout</button>
   </div>}
   {preview&&<p>No payment has been initiated.</p>}
  </div>
 </main>
}
