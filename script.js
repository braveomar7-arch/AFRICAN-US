'use strict';
const menu=document.querySelector('.menu'),nav=document.querySelector('nav');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);menu.textContent=AUSI18n.t(open?'Close ×':'Menu ☰');});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent=AUSI18n.t('Menu ☰');}));
const photos=[...document.querySelectorAll('[data-photo]')],dialog=document.querySelector('#lightbox');let current=0;
function displayPhoto(index){current=(index+photos.length)%photos.length;const photo=photos[current];document.querySelector('#lightbox-image').src=photo.dataset.photo;document.querySelector('#lightbox-image').alt=photo.querySelector('img').alt;document.querySelector('#caption').textContent=photo.dataset.caption+' · '+(current+1)+' / '+photos.length;}
photos.forEach((photo,index)=>photo.addEventListener('click',()=>{displayPhoto(index);dialog.showModal();}));
document.querySelector('.close').addEventListener('click',()=>dialog.close());
document.querySelector('#previous').addEventListener('click',()=>displayPhoto(current-1));document.querySelector('#next').addEventListener('click',()=>displayPhoto(current+1));
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight')displayPhoto(current+1);if(event.key==='ArrowLeft')displayPhoto(current-1);});
dialog.addEventListener('close',()=>photos[current].focus());
document.querySelector('#year').textContent=new Date().getFullYear();

document.addEventListener('aus-languagechange',()=>{if(dialog.open)displayPhoto(current);});
