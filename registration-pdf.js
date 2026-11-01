/* Registration PDFs are generated locally; nothing is uploaded by this code. */
(function(root){
'use strict';
function makeId(){const bytes=new Uint8Array(10);root.crypto.getRandomValues(bytes);return 'AUS-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();}
function createPdf(data,id,created,jsPDF,qrFactory,font,language='en'){
 const t=value=>root.AUSI18n?root.AUSI18n.t(value,language):value;
 const pdf=new jsPDF({unit:'mm',format:'a4'});
 pdf.addFileToVFS('Registration.ttf',font);pdf.addFont('Registration.ttf','Registration','normal');pdf.setFont('Registration');
 const green=[18,63,50],gold=[231,184,93];let page=1,y=0;
 const text=(value,x,top,size=10,color=green)=>{pdf.setFontSize(size);pdf.setTextColor(...color);pdf.text(String(value),x,top);};
 function header(){pdf.setFillColor(...green);pdf.rect(0,0,210,45,'F');text('AFRICAN UNITED SOCIETY',18,19,18,[255,255,255]);text(t('WAKEFIELD  /  REGISTERED CHARITY 1160029'),18,30,9,gold);pdf.setFillColor(...gold);pdf.rect(0,45,210,2,'F');y=61;}
 function footer(){pdf.setDrawColor(205,215,205);pdf.line(18,278,192,278);text(t('Registration of interest - not confirmation of membership'),18,284,8);text('Page '+page,178,284,8);text('africanunitedsociety@yahoo.co.uk',18,290,8);}
 function nextPage(){footer();pdf.addPage();page++;header();}
 function paragraph(value,size=10){pdf.setFontSize(size);const lines=pdf.splitTextToSize(String(value),174);for(const line of lines){if(y>265)nextPage();text(line,18,y,size);y+=5.5;}y+=2;}
 function field(label,value){if(y>244)nextPage();text(label.toUpperCase(),18,y,8,[93,108,99]);y+=5;paragraph(value||t('Not provided'),11);y+=1;}
 function qr(payload,x,top,label){const code=qrFactory(0,'M');code.addData(payload);code.make();const count=code.getModuleCount(),size=39,quiet=4,cell=size/(count+quiet*2);pdf.setFillColor(255,255,255);pdf.rect(x,top,size,size,'F');pdf.setFillColor(0,0,0);for(let row=0;row<count;row++)for(let col=0;col<count;col++)if(code.isDark(row,col))pdf.rect(x+(col+quiet)*cell,top+(row+quiet)*cell,cell+.01,cell+.01,'F');text(label,x,top+44,8);}
 header();text(t('Registration of interest'),18,y,22);y+=12;paragraph(t('Reference:')+' '+id,10);paragraph(t('Created:')+' '+created,9);y+=3;
 field(t('Full name'),data.name);field(t('Email address'),data.email);field(t('Phone number'),data.phone);field(t('Interested in'),t(data.interest));field(t('Message'),data.message);
 field(t('Consent'),t('I agree to share these details with the society so it can respond to this enquiry.'));
 if(y>181)nextPage();
 const top=y+3;qr('African United Society registration reference: '+id,18,top,t('REGISTRATION REFERENCE'));
 const contact='https://wa.me/447012346652?text='+encodeURIComponent(t('Hello African United Society. My registration reference is')+' '+id+'.');
 qr(contact,82,top,t('CONTACT ON WHATSAPP'));y=top+56;paragraph(t('The QR codes contain the reference ID and a WhatsApp contact link. They do not verify identity or retrieve a stored record.'),8);paragraph(t('Please attach this PDF to your WhatsApp message to +44 7012 346652. The society will confirm any arrangements directly.'),8);footer();
 pdf.setProperties({title:'AUS '+t('Registration')+' '+id,subject:t('Registration of interest'),author:'African United Society in Wakefield'});return pdf;
}
root.AUSRegistration={makeId,createPdf};
if(typeof module!=='undefined'&&module.exports)module.exports=root.AUSRegistration;
if(typeof document==='undefined')return;
const t=value=>root.AUSI18n.t(value);
const form=document.querySelector('#registration');let signature='',record=null,objectUrl=null;
form.addEventListener('submit',async event=>{
 event.preventDefault();if(!form.reportValidity())return;const status=document.querySelector('#form-status');const submit=event.submitter||form.querySelector('button[type=submit]');submit.disabled=true;
 try{
 const raw=new FormData(form),data=Object.fromEntries(['name','email','phone','interest','message'].map(key=>[key,String(raw.get(key)||'').trim()]));const fresh=JSON.stringify(data);
 if(fresh!==signature||!record){record={id:makeId(),created:new Date().toISOString()};signature=fresh;}
 const pdf=createPdf(data,record.id,record.created,root.jspdf.jsPDF,root.qrcode,root.registrationFont,root.AUSI18n.language);const blob=pdf.output('blob');const filename=record.id+'.pdf';if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(blob);
 const download=document.querySelector('#download-pdf');download.href=objectUrl;download.download=filename;
 const message=t('Hello African United Society in Wakefield, I would like to register my interest. Reference:')+' '+record.id+t('. I will attach my registration PDF to this chat.');
 const whatsapp=document.querySelector('#send-whatsapp');whatsapp.href='https://wa.me/447012346652?text='+encodeURIComponent(message);
 const result=document.querySelector('#pdf-result');result.hidden=false;document.querySelector('#registration-reference').textContent=t('Your reference:')+' '+record.id;
 status.textContent=t('Your PDF is ready. Download it, then attach it in WhatsApp. No registration has been sent yet.');
 const file=new File([blob],filename,{type:'application/pdf'}),share=document.querySelector('#share-pdf');share.hidden=!(navigator.canShare&&navigator.canShare({files:[file]}));share.onclick=async()=>{try{await navigator.share({files:[file],title:t('Registration')+' '+record.id,text:message});status.textContent=t('Share sheet opened. Choose WhatsApp and the society contact to send your PDF.');}catch(error){if(error.name!=='AbortError')status.textContent=t('Sharing is unavailable here. Download the PDF and attach it in WhatsApp instead.');}};
 if(submit.value==='email'){window.location.href='mailto:africanunitedsociety@yahoo.co.uk?subject='+encodeURIComponent(t('Registration')+' '+record.id)+'&body='+encodeURIComponent(message+'\n\n'+t('Please attach the downloaded PDF before sending.'));status.textContent=t('Download your PDF and attach it to your email before sending. Your email app cannot attach it automatically.');}
 result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
 }catch(error){status.textContent=t('The PDF could not be created. Please try again, or contact the society using the contact links below.');console.error('PDF generation failed',error);}
 finally{submit.disabled=false;}
});
form.addEventListener('input',()=>{document.querySelector('#pdf-result').hidden=true;document.querySelector('#form-status').textContent='';});
})(globalThis);
