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
  let themeMode='light';
  try{themeMode=localStorage.getItem('brand-demo-theme')||'light'}catch{}
  if(!['light','dark','auto'].includes(themeMode))themeMode='light';
  function applyTheme(mode){
    themeMode=mode;html.dataset.themeMode=mode;
    html.dataset.theme=mode==='auto'?(darkPreference.matches?'dark':'light'):mode;
    const toggle=$('.theme-toggle');
    toggle.innerHTML=svg(mode==='light'?'i-moon':mode==='dark'?'i-sun':'i-settings');
    toggle.title=`Тема: ${mode==='auto'?'автоматична':mode==='light'?'світла':'темна'}. Натисніть, щоб змінити`;
    toggle.setAttribute('aria-label',toggle.title);
    try{localStorage.setItem('brand-demo-theme',mode)}catch{}
  }
  applyTheme(themeMode);
  $('.theme-toggle').addEventListener('click',()=>applyTheme(themeMode==='light'?'dark':themeMode==='dark'?'auto':'light'));
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

  const defaultTour=['hall-1.webp','hall-2.webp','hall-3.webp','equipment-main.webp','gear-makeup.webp'];
  let tourPhotos=defaultTour,currentTour=0;
  function renderTour(){
    const img=$('#tour-image');img.src=imageBase+tourPhotos[currentTour];img.alt=`Фото ${currentTour+1} з ${tourPhotos.length}: зал або оснащення студії`;
    $('#tour-counter').textContent=`${currentTour+1} / ${tourPhotos.length}`;
    $('#tour-prev').disabled=$('#tour-next').disabled=tourPhotos.length<2;
  }
  $$('[data-tour],[data-equipment]').forEach(button=>button.addEventListener('click',()=>{
    tourPhotos=button.dataset.equipment?[button.dataset.equipment]:button.closest('.equipment-section')?['equipment-main.webp','gear-light.webp','gear-backgrounds.webp','gear-furniture.webp','gear-outfits.webp','gear-makeup.webp']:defaultTour;
    currentTour=0;renderTour();showDialog($('#tour-modal'));
  }));
  function moveTour(step){currentTour=(currentTour+tourPhotos.length+step)%tourPhotos.length;renderTour()}
  $('#tour-prev').addEventListener('click',()=>moveTour(-1));$('#tour-next').addEventListener('click',()=>moveTour(1));
  let galleryItems=[],currentGallery=0;
  function renderGallery(){
    const source=$('img',galleryItems[currentGallery]),img=$('#gallery-modal-image');img.src=source.src;img.alt=source.alt;
    $('#gallery-counter').textContent=`${currentGallery+1} / ${galleryItems.length}`;
    $('#gallery-prev').disabled=$('#gallery-next').disabled=galleryItems.length<2;
  }
  $$('[data-gallery]').forEach(button=>button.addEventListener('click',()=>{
    galleryItems=$$('.gallery-photo').filter(p=>!p.hidden);currentGallery=galleryItems.indexOf(button);
    if(currentGallery<0)return;renderGallery();showDialog($('#gallery-modal'));
  }));
  function moveGallery(step){currentGallery=(currentGallery+galleryItems.length+step)%galleryItems.length;renderGallery()}
  $('#gallery-prev').addEventListener('click',()=>moveGallery(-1));$('#gallery-next').addEventListener('click',()=>moveGallery(1));
  document.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight'].includes(e.key))return;
    if($('#gallery-modal').open){e.preventDefault();moveGallery(e.key==='ArrowRight'?1:-1)}
    else if($('#tour-modal').open){e.preventDefault();moveTour(e.key==='ArrowRight'?1:-1)}
  });
  $('#year').textContent=String(new Date().getFullYear());
})();
