import {redirect} from 'next/navigation';
export default async function DemoPayment({searchParams}){
 const params=await searchParams;
 const reference=typeof params?.reference==='string'?params.reference:'';
 const email=typeof params?.email==='string'?params.email:'';
 const query=new URLSearchParams();
 if(reference)query.set('reference',reference);
 if(email)query.set('email',email);
 redirect('/internal/it-development'+(query.size?'?'+query.toString():''));
}
