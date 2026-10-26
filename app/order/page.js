'use client';
import Link from 'next/link';
import {useMemo,useState} from 'react';
const options=[
['Website & IT Services','₹4,999 onwards','5–15 working days'],
['Social Media Management','₹2,999 / month','Monthly service cycle'],
['Graphic & Creative Design','₹499 onwards','2–5 working days'],
['Photography Services','₹2,499 onwards','Schedule confirmed before booking'],
['Photo & Video Editing','₹799 onwards','2–7 working days'],
['Digital Marketing Support','₹1,999 onwards','Campaign period confirmed before start'],
['Starter Package','₹999','Scope as listed on website'],
['Growth Package','₹2,999','Monthly/content scope confirmed'],
['Business Package','₹7,999','Website + digital scope confirmed']
];
export default function Order(){
 const [service,setService]=useState(options[0][0]); const [sent,setSent]=useState(false);
 const selected=useMemo(()=>options.find(x=>x[0]===service),[service]);
 function submit(e){e.preventDefault();setSent(true);window.scrollTo({top:0,behavior:'smooth'});}
 return <main className="policyPage orderPage"><header className="policyHeader"><Link href="/" className="policyBrand"><b>C</b><span>CHeQ<small>DIGITAL</small></span></Link><Link href="/">‹  Back to home</Link></header>
 <section className="policyHero digitalPolicy"><div><small>PROJECT REQUEST</small><h1>Start your project</h1><p>Share your requirement. We confirm the final scope, price and delivery timeline before payment or work begins.</p></div></section>
 {sent?<section className="orderSuccess"><span>✓</span><h2>Request prepared</h2><p>Your project details have been prepared for review. CHeQ Digital will confirm the final scope, quotation and delivery timeline before requesting payment.</p><div className="policyNote"><b>Payment status</b><p>No payment has been collected on this website yet. Secure online checkout will be enabled only after an approved payment gateway is connected.</p></div><a href="mailto:support@cheqdigital.shop">Email CHeQ Digital</a></section>:
 <form className="orderForm" onSubmit={submit}><div className="formIntro"><div><small>STEP 1 OF 2</small><h2>Project details</h2></div><span>Clear scope before payment</span></div>
 <label>Service / package<select value={service} onChange={e=>setService(e.target.value)}>{options.map(x=><option key={x[0]}>{x[0]}</option>)}</select></label>
 <div className="orderSummary"><span><small>Displayed price</small><b>{selected[1]}</b></span><span><small>Expected timeline</small><b>{selected[2]}</b></span></div>
 <div className="formGrid"><label>Full name<input required name="name" placeholder="Your name"/></label><label>Mobile number<input required name="mobile" inputMode="tel" placeholder="+91"/></label><label>Email address<input required name="email" type="email" placeholder="you@example.com"/></label><label>Business / brand name<input name="business" placeholder="Optional"/></label></div>
 <label>Project requirement<textarea required name="requirement" rows="5" placeholder="Tell us what you need, preferred style, quantity/pages, platform and any deadline."/></label>
 <label>Preferred completion date<input name="date" type="date"/></label>
 <div className="consentBox"><label><input required type="checkbox"/> <span>I have reviewed the <Link href="/terms">Terms & Conditions</Link>, <Link href="/returns">Cancellation & Refund Policy</Link> and <Link href="/shipping">Service Delivery Policy</Link>.</span></label><p>Submitting this form does not charge you. Custom requirements and third-party costs, if any, are confirmed before payment.</p></div>
 <button className="orderSubmit" type="submit">Submit Project Request <i>›</i></button><p className="secureLine">🔒 Payment credentials, UPI PIN, card PIN or OTP are never requested in this form.</p></form>}
 </main>
}