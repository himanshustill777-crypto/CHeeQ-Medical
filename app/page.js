import Link from 'next/link';
const services=[
['💻','Website & IT Services','Business websites, landing pages, website updates and technical support.','₹4,999 onwards'],
['📱','Social Media Management','Profile management, posting plans, page handling and monthly content support.','₹2,999 / month'],
['🎨','Graphic & Creative Design','Social creatives, banners, posters, thumbnails and promotional designs.','₹499 onwards'],
['📷','Photography Services','Product, business and social-media photography with edited deliverables.','₹2,499 onwards'],
['🎬','Photo & Video Editing','Professional photo retouching, reels, short videos and promotional edits.','₹799 onwards'],
['📣','Digital Marketing Support','Campaign creatives, digital presence support and marketing consultation.','₹1,999 onwards']
];
const packages=[
['Starter','For individuals & small businesses','₹999',['5 social creatives','1 promotional banner','Basic brand consultation']],
['Growth','For growing brands','₹2,999',['12 social creatives','Social media handling support','2 reels/video edits','Monthly content plan']],
['Business','Website + digital presence','₹7,999',['Business website setup','10 social creatives','Basic SEO setup','30-day support']]
];
export default function Home(){return <main className="shop digital">
<div className="trustbar"><span>✓ Professional Services</span><span>✓ Clear Pricing</span><span>✓ Secure Online Payment</span><span className="push"><a href="/contact">Contact & Support</a></span></div>
<header className="megahead"><Link href="/" className="brand"><b className="cross">C</b><strong>CHeeQ</strong><i>DIGITAL</i></Link><nav className="digitalNav"><a href="#services">Services</a><a href="#packages">Packages</a><Link href="/about">About</Link><Link href="/contact">Contact</Link></nav><a href="#packages" className="login">Get Started</a></header>
<section className="bigHero digitalHero"><div className="heroCopy"><small>DIGITAL • CREATIVE • CONNECTED</small><h1>Build your brand.<br/><em>Grow online.</em></h1><p>IT, digital, social media, photography and creative services for individuals and businesses.</p><a href="#services">Explore Services →</a></div><div className="heroArt">CHeeQ<br/><b>DIGITAL</b></div></section>
<section id="services" className="serviceSection"><div className="bestHead"><h2>Our Services</h2><span>Everything your digital presence needs</span></div><div className="serviceGrid">{services.map((s,i)=><article className="serviceCard" key={i}><span>{s[0]}</span><h3>{s[1]}</h3><p>{s[2]}</p><b>{s[3]}</b><Link href="/contact">Enquire Now →</Link></article>)}</div></section>
<section className="launch"><b>CHeeQ DIGITAL</b><h2>One team for your digital & creative work</h2><p>From a professional website to social-media content, photography and editing, choose only the services you need. Scope, timeline and final price are confirmed before work begins.</p><Link href="/contact">Discuss Your Project →</Link></section>
<section id="packages" className="packageSection"><div className="bestHead"><h2>Popular Packages</h2><span>Starting packages — final scope is confirmed before payment</span></div><div className="packageGrid">{packages.map((p,i)=><article className="packageCard" key={i}><small>{p[1]}</small><h3>{p[0]}</h3><strong>{p[2]}</strong><ul>{p[3].map((x,j)=><li key={j}>✓ {x}</li>)}</ul><Link href="/contact">Request This Package</Link></article>)}</div></section>
<section className="proof"><strong>IT<small>Web & technical services</small></strong><strong>Creative<small>Design, photo & video</small></strong><strong>Social<small>Management & content</small></strong></section>
<section className="why"><h2>How it works</h2><div><span>1<b>Tell us your requirement</b><small>Share your project goals and scope.</small></span><span>2<b>Get scope & quote</b><small>We confirm deliverables, price and timeline.</small></span><span>3<b>Confirm & pay</b><small>Pay only through the official checkout when enabled.</small></span><span>4<b>Delivery & support</b><small>Receive the agreed digital deliverables.</small></span></div></section>
<footer><b>CHeeQ Digital</b><span>Digital. Creative. Connected.</span><nav><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/returns">Cancellation & Refund</Link></nav><small>Service pricing and timelines depend on the agreed project scope. No medical or pharmacy products are offered by CHeeQ Digital.</small></footer>
</main>}