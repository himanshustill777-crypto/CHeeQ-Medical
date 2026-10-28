'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
export default function HiddenIT(){
 const [reference,setReference]=useState(''),[email,setEmail]=useState(''),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
 const launched=useRef(false);
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
 useEffect(()=>{const q=new URLSearchParams(window.location.search);const ref=q.get('reference')||'',mail=q.get('email')||'';setReference(ref);setEmail(mail);if(ref&&mail&&!launched.current){launched.current=true;pay(ref,mail)}},[]);
 return <main className="policyPage orderPage"><header className="policyHeader"><Link href="/">CHEQ DIGITAL</Link><span>Secure payment</span></header><section className="policyHero digitalPolicy"><div><small>SECURE RAZORPAY CHECKOUT</small><h1>CHEQ DIGITAL</h1><p>Only approved orders can be paid. Amount is securely loaded from your approved quotation.</p></div></section><form className="orderForm" onSubmit={e=>{e.preventDefault();pay(reference,email)}}><label>Approved order reference<input required value={reference} onChange={e=>setReference(e.target.value)}/></label><label>Customer email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><button className="orderSubmit" disabled={busy}>{busy?'Opening Razorpay...':'Open Razorpay Checkout'}</button><p role="status">{status}</p></form></main>
}