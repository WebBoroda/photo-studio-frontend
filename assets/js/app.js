/* Standalone interface preview. No requests, payments or booking writes. */
(()=>{
  'use strict';
  const $=(q,scope=document)=>scope.querySelector(q);
  const $$=(q,scope=document)=>[...scope.querySelectorAll(q)];
  const html=document.documentElement;
  const imageBase=html.dataset.imageBase || new URL('../images/',document.currentScript.src).href;
  const svg=name=>`<svg class="icon" aria-hidden="true"><use href="#${name}"></use></svg>`;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const darkPreference=matchMedia('(prefers-color-scheme: dark)');
  let themeMode='auto';
  try{const stored=localStorage.getItem('brand-demo-theme');if(stored==='light'||stored==='dark')themeMode=stored}catch{}
  function applyTheme(mode){
    themeMode=mode;html.dataset.themeMode=mode;
    html.dataset.theme=mode==='auto'?(darkPreference.matches?'dark':'light'):mode;
    const toggle=$('.theme-toggle');
    const active=html.dataset.theme;
    toggle.innerHTML=svg(active==='light'?'i-moon':'i-sun');
    toggle.title=`Зараз ${active==='light'?'світла':'темна'} тема. Перемкнути на ${active==='light'?'темну':'світлу'}`;
    toggle.setAttribute('aria-label',toggle.title);
    if(mode!=='auto')try{localStorage.setItem('brand-demo-theme',mode)}catch{}
  }
  applyTheme(themeMode);
  $('.theme-toggle').addEventListener('click',()=>applyTheme(html.dataset.theme==='dark'?'light':'dark'));
  const floatingBooking=$('.floating-booking');
  const footerCta=$('.final-cta')||$('.footer-cta');
  const pageFooter=$('.site-footer');
  if(floatingBooking && 'IntersectionObserver' in window){
    const visible=new Set();
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>entry.isIntersecting?visible.add(entry.target):visible.delete(entry.target));
      floatingBooking.classList.toggle('is-footer-hidden',visible.size>0);
    },{threshold:.02});
    [footerCta,pageFooter].filter(Boolean).forEach(node=>observer.observe(node));
  }
  // A persistent fixed CTA must never cover a room-tour action or gallery content.
  // It disappears briefly only while the viewport CTA physically intersects one of them.
  if(floatingBooking){
    const avoid=$$('.tour-strip, .gallery-grid');
    let overlapPending=false;
    function updateFloatingOverlap(){
      overlapPending=false;
      // The approved hero shows the booking CTA immediately on first load.
      if(scrollY<36){floatingBooking.classList.remove('is-content-hidden');return}
      // Read the button's natural fixed position, even while it is visually hidden.
      const button=floatingBooking.getBoundingClientRect();
      const colliding=avoid.some(element=>{
        const rect=element.getBoundingClientRect();
        return rect.bottom>button.top+8 && rect.top<button.bottom-8 &&
          rect.right>button.left+12 && rect.left<button.right-12;
      });
      floatingBooking.classList.toggle('is-content-hidden',colliding);
    }
    function queueOverlap(){if(!overlapPending){overlapPending=true;requestAnimationFrame(updateFloatingOverlap)}}
    window.addEventListener('scroll',queueOverlap,{passive:true});
    window.addEventListener('resize',queueOverlap,{passive:true});
    queueOverlap();
  }
  darkPreference.addEventListener?.('change',()=>{if(themeMode==='auto')applyTheme('auto')});
  let toastTimeout;
  function toast(message){
    const el=$('#toast');el.textContent=message;el.hidden=false;
    clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.hidden=true,3500);
  }
  $('.language-btn').addEventListener('click',()=>toast('У цій версії доступна українська мова.'));
  $$('[data-unconfigured]').forEach(b=>b.addEventListener('click',()=>toast(`Посилання ${b.dataset.unconfigured} для цієї демонстрації ще не налаштоване.`)));

  const menuTrigger=$('.mobile-menu-trigger'),mobileNav=$('#mobile-navigation');
  function closeMenu(returnFocus=false){
    mobileNav.hidden=true;menuTrigger.setAttribute('aria-expanded','false');menuTrigger.setAttribute('aria-label','Відкрити меню');
    if(returnFocus)menuTrigger.focus();
  }
  menuTrigger.addEventListener('click',()=>{
    if(!mobileNav.hidden){closeMenu();return}
    mobileNav.hidden=false;menuTrigger.setAttribute('aria-expanded','true');menuTrigger.setAttribute('aria-label','Закрити меню');
  });
  $$('#mobile-navigation a,#mobile-navigation button[data-book]').forEach(a=>a.addEventListener('click',()=>closeMenu()));
  document.addEventListener('click',e=>{if(!mobileNav.hidden&&!mobileNav.contains(e.target)&&!menuTrigger.contains(e.target))closeMenu()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobileNav.hidden)closeMenu(true)});
  matchMedia('(min-width:901px)').addEventListener?.('change',e=>{if(e.matches)closeMenu()});

  $$('.slider').forEach(track=>{
    const controls=$$('[data-slide]').filter(b=>b.dataset.slide===track.id);
    const update=()=>controls.forEach(b=>{
      const max=track.scrollWidth-track.clientWidth;
      b.disabled=max<2||(Number(b.dataset.direction)<0?track.scrollLeft<=1:track.scrollLeft>=max-1);
    });
    controls.forEach(b=>b.addEventListener('click',()=>{
      const card=track.firstElementChild;if(!card)return;
      track.scrollBy({left:(card.getBoundingClientRect().width+(parseFloat(getComputedStyle(track).gap)||0))*Number(b.dataset.direction),behavior:reducedMotion.matches?'instant':'smooth'});
    }));
    track.addEventListener('scroll',update,{passive:true});
    if(typeof ResizeObserver!=='undefined')new ResizeObserver(update).observe(track);
    window.addEventListener('resize',update,{passive:true});update();
  });
  $$('.heart').forEach(b=>{
    const original=b.getAttribute('aria-label');
    b.addEventListener('click',()=>{
      const selected=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(selected));
      b.setAttribute('aria-label',selected?original.replace('Додати','Вилучити').replace('в обране','з обраного'):original);
      toast(selected?'Додано до обраного в цій демонстрації.':'Вилучено з обраного.');
    });
  });
  $$('.filter').forEach(button=>button.addEventListener('click',()=>{
    $$('.filter').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});
    const filter=button.dataset.filter;$('#gallery-grid').classList.toggle('filtered',filter!=='all');
    let visible=0;
    $$('.gallery-photo').forEach(p=>{p.hidden=filter!=='all'&&!p.dataset.category.split(' ').includes(filter);if(!p.hidden)visible++});
    $('#gallery-empty').hidden=visible>0;
  }));
  $('[data-more-faq]').addEventListener('click',e=>{
    const expand=$$('.extra-faq').every(el=>el.hidden);$$('.extra-faq').forEach(el=>el.hidden=!expand);
    e.currentTarget.setAttribute('aria-expanded',String(expand));
    e.currentTarget.innerHTML=`${expand?'Менше питань':'Більше питань'} ${svg(expand?'i-left':'i-arrow')}`;
  });

  const openers=new WeakMap();
  function showDialog(dialog){
    openers.set(dialog,document.activeElement);dialog.showModal();document.body.classList.add('modal-open');
  }
  function closeDialog(dialog){dialog.close()}
  $$('[data-close]').forEach(b=>b.addEventListener('click',()=>closeDialog(document.getElementById(b.dataset.close))));
  $$('.modal').forEach(dialog=>{
    // Only the actual backdrop closes a dialog, not blank padding inside its bounds.
    dialog.addEventListener('click',e=>{
      if(e.target!==dialog)return;
      const r=dialog.getBoundingClientRect();
      if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(dialog);
    });
    dialog.addEventListener('close',()=>{
      if(!$('.modal[open]')){
        document.body.classList.remove('modal-open');
        const opener=openers.get(dialog);if(opener?.isConnected)opener.focus();
      }
    });
  });

  const asDate=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const dayFormat=new Intl.DateTimeFormat('uk-UA',{day:'numeric',month:'short'});
  const dateInput=$('#booking-date'),timeInput=$('#booking-time'),durationInput=$('#booking-duration');
  function refreshTimes(){
    const now=new Date();dateInput.min=asDate(now);
    if(!dateInput.value||dateInput.value<dateInput.min)dateInput.value=dateInput.min;
    [...timeInput.options].forEach(o=>{o.disabled=new Date(`${dateInput.value}T${o.value}:00`)<=now});
    if(!timeInput.selectedOptions.length||timeInput.selectedOptions[0].disabled){
      const next=[...timeInput.options].find(o=>!o.disabled);timeInput.value=next?next.value:'';
    }
    timeInput.setCustomValidity(timeInput.value?'':'На цю дату доступний час завершився. Оберіть наступну дату.');
  }
  function ensureDate(){
    refreshTimes();
    if(![...timeInput.options].some(o=>!o.disabled)){
      const next=new Date();next.setDate(next.getDate()+1);dateInput.value=asDate(next);refreshTimes();
    }
  }
  function refreshSlots(){
    const now=new Date();
    $$('.slot').forEach(slot=>{
      const day=new Date(now);if(slot.dataset.day==='tomorrow')day.setDate(day.getDate()+1);
      slot.dataset.date=asDate(day);$('.slot-date',slot).textContent=dayFormat.format(day);
      slot.disabled=new Date(`${slot.dataset.date}T${slot.dataset.time}:00`)<=now;
      slot.title=slot.disabled?'Цей демонстраційний час уже минув':'';
    });
  }
  dateInput.addEventListener('change',refreshTimes);timeInput.addEventListener('change',refreshTimes);
  refreshSlots();ensureDate();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){refreshSlots();refreshTimes()}});
  setInterval(refreshSlots,60000);
  $$('.slot').forEach(slot=>slot.addEventListener('click',()=>{
    refreshSlots();if(slot.disabled)return;
    $$('.slot').forEach(s=>s.classList.toggle('selected',s===slot));
    dateInput.value=slot.dataset.date;timeInput.value=slot.dataset.time;durationInput.value='1';refreshTimes();
    showDialog($('#booking-modal'));
  }));
  $$('[data-book]').forEach(button=>button.addEventListener('click',()=>{
    if($('#room-modal').open)closeDialog($('#room-modal'));
    $('#booking-room').value=button.dataset.room||'Циклорама';durationInput.value=button.dataset.duration||'1';
    ensureDate();showDialog($('#booking-modal'));
  }));
  $('#demo-book-form').addEventListener('submit',e=>{
    e.preventDefault();refreshTimes();if(!e.target.reportValidity())return;
    closeDialog($('#booking-modal'));e.target.reset();ensureDate();
    $$('.slot').forEach(s=>s.classList.remove('selected'));
    toast('Форму перевірено. Це демоверсія: бронювання не створено й дані не надіслано.');
  });
  $$('[data-room-details]').forEach(button=>button.addEventListener('click',()=>{
    const card=button.closest('.hall-card');$('#room-title').textContent=$('h3',card).textContent;
    $('#room-image').src=$('img',card).src;$('#room-image').alt=$('img',card).alt;
    $('#room-description').textContent=$('.hall-content>p',card).textContent;
    $('#room-price').textContent=$('.hall-line>span',card).textContent;
    $('#room-specs').replaceChildren(...$$('.hall-specs>span',card).map(s=>{const li=document.createElement('li');li.textContent=s.textContent;return li}));
    $('#room-book').dataset.room=button.dataset.room;showDialog($('#room-modal'));
  }));

  // Video assets are not part of this demo. Never present photos as video playback.
  const tourInfo={
    studio:{title:'Відеотур студією',description:'Відео студії ще не додане до демонстрації.',image:'hall-1.webp'},
    halls:{title:'Відеотур залами',description:'Відео залів ще не додане до демонстрації.',image:'hall-2.webp'},
    equipment:{title:'Відеотур оснащенням',description:'Відео обладнання ще не додане до демонстрації.',image:'equipment-main.webp'}
  };
  $$('[data-tour]').forEach(button=>button.addEventListener('click',()=>{
    const kind=button.dataset.tourType||button.closest('[data-tour-kind]')?.dataset.tourKind||
      (button.closest('.equipment-section')?'equipment':button.closest('.halls-section')?'halls':'studio');
    const info=tourInfo[kind]||tourInfo.studio;
    $('#tour-title').textContent=info.title;
    $('#tour-description').textContent=info.description;
    $('#tour-poster-image').src=imageBase+info.image;
    showDialog($('#tour-modal'));
  }));
  let galleryItems=[],currentGallery=0;
  let galleryChange=0;
  function renderGallery(animate=false){
    const source=$('img',galleryItems[currentGallery]),img=$('#gallery-modal-image');
    const src=source.src,alt=source.alt,revision=++galleryChange;
    $('#gallery-counter').textContent=`${currentGallery+1} / ${galleryItems.length}`;
    $('#gallery-prev').disabled=$('#gallery-next').disabled=galleryItems.length<2;
    if(!animate||reducedMotion.matches){img.classList.remove('is-switching');img.src=src;img.alt=alt;return}
    img.classList.add('is-switching');
    setTimeout(()=>{
      if(revision!==galleryChange||!$('#gallery-modal').open)return;
      img.src=src;img.alt=alt;
      requestAnimationFrame(()=>img.classList.remove('is-switching'));
    },190);
  }
  $$('[data-gallery]').forEach(button=>button.addEventListener('click',()=>{
    galleryItems=$$('.gallery-photo').filter(p=>!p.hidden);currentGallery=galleryItems.indexOf(button);
    if(currentGallery<0)return;$('#gallery-modal-title').textContent='Приклади зйомок';renderGallery();showDialog($('#gallery-modal'));
  }));
  // Equipment cards retain their own clear image preview; they never masquerade as videos.
  $$('[data-equipment]').forEach(button=>button.addEventListener('click',()=>{
    galleryItems=$$('[data-equipment]');currentGallery=galleryItems.indexOf(button);
    $('#gallery-modal-title').textContent='Оснащення студії';
    renderGallery();showDialog($('#gallery-modal'));
  }));
  function moveGallery(step){currentGallery=(currentGallery+galleryItems.length+step)%galleryItems.length;renderGallery(true)}
  $('#gallery-modal').addEventListener('close',()=>{$('#gallery-modal-image').classList.remove('is-switching');galleryChange++});
  $('#gallery-prev').addEventListener('click',()=>moveGallery(-1));$('#gallery-next').addEventListener('click',()=>moveGallery(1));
  document.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight'].includes(e.key))return;
    if($('#gallery-modal').open){e.preventDefault();moveGallery(e.key==='ArrowRight'?1:-1)}
  });
  // Reveal enters visibly from below. No items hidden if JS, IO, or reduced-motion unavailable.
  if(!reducedMotion.matches && 'IntersectionObserver' in window){
    const revealTargets=$$('main > section:not(.hero), main > section:not(.hero) h2, .equipment-catalog h3, .benefit-card, .hall-card, .perk, .gear-card, .gallery-photo, .price-card, .review-card, .faq-grid details, .slot');
    const revealObserver=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.isIntersecting){entry.target.classList.add('is-revealed');revealObserver.unobserve(entry.target)}
      }
    },{threshold:0,rootMargin:'0px 0px -35px 0px'});
    const siblingCounts=new WeakMap();
    revealTargets.forEach(el=>{
      // Keep first viewport content visible; reveal lower elements on approach.
      if(el.getBoundingClientRect().top<innerHeight*.90){return}
      const parent=el.parentElement;
      const index=siblingCounts.get(parent)||0;
      siblingCounts.set(parent,index+1);
      el.classList.add('reveal-ready');
      const isCard=el.matches('.benefit-card,.hall-card,.perk,.gear-card,.gallery-photo,.price-card,.review-card,.slot');
      el.style.setProperty('--reveal-delay',Math.min(index*(isCard?125:45),500)+'ms');
      revealObserver.observe(el);
    });
    reducedMotion.addEventListener?.('change',()=>{
      if(reducedMotion.matches){revealObserver.disconnect();$$('.reveal-ready').forEach(el=>el.classList.add('is-revealed'))}
    });
  }
  // Scroll-dependent parallax only on large screens and only for visible photo cards.
  if(!reducedMotion.matches && matchMedia('(hover:hover) and (min-width:901px)').matches){
    const moving=$$('.hall-card, .benefit-card, .gear-card');
    let busy=false;
    function parallax(){busy=false;for(const card of moving){
      const r=card.getBoundingClientRect();
      if(r.bottom<0||r.top>innerHeight)continue;
      const displacement=Math.max(-16,Math.min(16,((r.top+r.height/2)/innerHeight-.5)*-28));
      card.style.setProperty('--photo-drift',displacement.toFixed(1)+'px');
    }}
    window.addEventListener('scroll',()=>{if(!busy){busy=true;requestAnimationFrame(parallax)}},{passive:true});
    parallax();
  }
  $('#year').textContent=String(new Date().getFullYear());
})();
