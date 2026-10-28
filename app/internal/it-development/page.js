'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
export default function HiddenIT(){
 const [status,setStatus]=useState('Loading approved payment...'),[busy,setBusy]=useState(false);
 const launched=useRef(false);
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
    try{const response=await fetch('/api/payments/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...result,reference:ref,email:mail})});const verified=await response.json();if(!response.ok)throw Error(verified.error||'Verification pending');setStatus(verified.captured?'Payment captured and verified. Payment ID: '+verified.paymentId:'Payment received; capture is pending. Payment ID: '+verified.paymentId)}
    catch(e){setStatus(e.message+' Please contact support before retrying.')}
   },modal:{ondismiss:()=>setStatus('Checkout closed. You can reopen the approved order.')},theme:{color:'#173c78'}});
   checkout.on('payment.failed',()=>setStatus('Payment failed or was cancelled. Please check status before retrying.'));
   checkout.open();
  }catch(e){setStatus(e.message)}finally{setBusy(false)}
 }
 useEffect(()=>{const q=new URLSearchParams(window.location.search);const ref=q.get('reference')||'',mail=q.get('email')||'';if(q.get('preview')==='rent'){const name=q.get('name')||'',mobile=q.get('mobile')||'',amount=Number(q.get('amount'));if(name.trim().length>=2&&/^\S+@\S+\.\S+$/.test(mail)&&/^\d{10}$/.test(mobile)&&Number.isFinite(amount)&&amount>0&&amount<=1000000){setPreview({name,mail,mobile,amount:amount.toFixed(2)});setStatus('Rent redirect test successful. No payment has been initiated.')}else{setStatus('Incomplete rent preview details. No payment has been initiated.')}return}if(ref&&mail&&!launched.current){launched.current=true;pay(ref,mail)}else if(!ref||!mail){setStatus('Approved payment link is incomplete. Please return to the original service and tap Pay Now again.')}},[]);
 return <main className="policyPage orderPage"><header className="policyHeader"><Link href="/">CHEQ DIGITAL</Link><span>Secure payment</span></header><section className="policyHero digitalPolicy"><div><small>SECURE RAZORPAY CHECKOUT</small><h1>CHEQ DIGITAL</h1><p>Approved service payment. Checkout opens automatically when a valid approved order link is provided.</p></div></section><section className="orderForm"><p role="status">{busy?'Opening Razorpay Checkout...':status}</p>{preview&&<div style={{marginTop:20,display:'grid',gap:12}}><h2>Rent Payment — Preview Only</h2><p><strong>Name:</strong> {preview.name}</p><p><strong>Email:</strong> {preview.mail}</p><p><strong>Mobile:</strong> {preview.mobile}</p><p><strong>Amount:</strong> ₹{preview.amount}</p><p>No Razorpay order or charge has been created.</p></div>}</section></main>
}
