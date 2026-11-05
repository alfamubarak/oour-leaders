(() => {
  'use strict';
  const DATA = window.LEADERS_DATA;
  if (!DATA) { document.body.insertAdjacentHTML('afterbegin','<p>Unable to load the exhibition data. Please check data.js.</p>'); return; }
  const byId = id => document.getElementById(id);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = () => typeof window.gsap !== 'undefined';
  const state = { view:'home', group:'commandant', id:null, lastFocus:null, search:'', catalogGroup:'director', introComplete:false };
  const list = DATA.leaders;
  const groupMembers = (group) => list.filter(x => x.group === group);
  const pastMembers = (group) => list.filter(x=>x.group===group && !x.current).sort((a,b)=>a.sequence-b.sequence);
  const current = (group) => list.find(x => x.group===group && x.current);
  const person = id => list.find(x => x.id === id);
  const h = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const motion = (target,from,to={}) => {
    if(!target) return;
    if(reduceMotion){Object.assign(target.style, {opacity:1, transform:'none'});return;}
    if(hasGSAP()){window.gsap.fromTo(target,from,{...to,overwrite:'auto'});return;}
    const y = from.y || 0;
    target.animate([{opacity:from.opacity ?? 0,transform:`translateY(${y}px)`},{opacity:1,transform:'translateY(0px)'}],{duration:Math.round((to.duration||.8)*1000),easing:'cubic-bezier(.19,1,.22,1)',fill:'both',delay:(to.delay||0)*1000});
  };
  function placeholder() {return 'assets/portrait-placeholder.svg';}
  function imageHTML(src,alt,cls='') {
    return `<img class="${cls}" src="${h(src || placeholder())}" alt="${h(alt)}" loading="lazy" onerror="this.onerror=null;this.src='assets/portrait-placeholder.svg';" />`;
  }
  function animateStagger(selector, stagger=.06,delay=0){
    const els = [...document.querySelectorAll(selector)];
    if(reduceMotion)return;
    if(hasGSAP())window.gsap.fromTo(els,{y:36,opacity:0,filter:'blur(7px)'},{y:0,opacity:1,filter:'blur(0px)',duration:.9,ease:'power3.out',stagger,delay,overwrite:'auto'});
    else els.forEach((el,i)=>{ el.animate([{opacity:.62,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0px)'}],{duration:390,delay:(delay+i*stagger)*1000,easing:'ease-out'}); });
  }
  function addDust(){
    const root=byId('dust');if(!root)return;
    for(let i=0;i<25;i++){
      const d=document.createElement('i');d.style.left=`${(i*47.23)%100}%`;d.style.top=`${(i*31.77)%100}%`;d.style.animationDelay=`-${(i*1.37)%12}s`;root.append(d);
    }
  }
  function renderFeatured(group){
    const p=current(group),g=DATA.groups[group];
    const container=byId('wing-'+group);
    const wingLabel=group==='commandant'?'COMMANDANT OF THE COLLEGE':'DIRECTOR OF AIR WARFARE';
    container.setAttribute('aria-label',wingLabel+' — open profile');
    container.innerHTML=`
      <span class="wing-giant" aria-hidden="true">${g.code}</span>
      <div class="wing-photo-shell">${imageHTML(p.photo,`Photo supplied as ${p.name}; office pairing is not verified`,'wing-photo')}</div>
      <div class="wing-vignette"></div>
      <div class="wing-inner">
        <div class="wing-top"><span class="wing-index">${g.code} / LEADERSHIP</span><span class="wing-role">FEATURED PROFILE</span></div>
        <div class="wing-middle"><div class="wing-label">THE CURRENT OFFICE / SAMPLE</div>
          <h2 class="wing-office">${group==='commandant'?'Commandant<br>of the College':'Director of<br>Air Warfare'}</h2>
          <div class="wing-rule"></div>
          <div class="wing-rank">${h(p.rank)}</div><div class="wing-name">${h(p.name)}</div>
        </div>
        <div class="wing-bottom"><span class="wing-tenure">${h(p.tenure)}</span>
          <button class="wing-open" data-action="detail" data-id="${h(p.id)}" aria-label="View ${h(p.name)} profile">VIEW PROFILE <span>↗</span></button>
        </div>
      </div>
      <span class="wing-legal">PROVISIONAL OFFICE / PHOTO PAIRING</span>`;
    container.addEventListener('click',e=>{if(!e.target.closest('button'))openDetail(p.id);});
    container.addEventListener('pointermove',e=>{
      if(reduceMotion || matchMedia('(pointer:coarse)').matches)return;
      const rect=container.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width-.5;const y=(e.clientY-rect.top)/rect.height-.5;
      const img=container.querySelector('.wing-photo-shell');
      if(img)img.style.transform=`translate3d(${(-x*15).toFixed(1)}px,${(-y*13).toFixed(1)}px,0) scale(1.025)`;
    });
    container.addEventListener('pointerleave',()=>{const img=container.querySelector('.wing-photo-shell');if(img)img.style.transform='';});
  }
  // Seamless, touch-friendly historic portrait marquee. The original record set is
  // duplicated *visually*, not in data.js, and is hidden from keyboard/AT navigation.
  let liveRail=null;
  const isExiting=()=>byId('exitModal').classList.contains('is-open')||byId('exitComplete').classList.contains('is-open');
  function destroyRail(){if(!liveRail)return;liveRail.destroy();liveRail=null;}
  function initRail(id,buttonId,progressId){
    destroyRail();
    const el=byId(id),button=byId(buttonId),progress=byId(progressId);
    if(!el || !button || !el.children.length || el.querySelector('.no-results'))return;
    const originals=[...el.children];
    originals.forEach(item=>{let clone=item.cloneNode(true);clone.setAttribute('aria-hidden','true');clone.tabIndex=-1;clone.classList.remove('motion-in');el.append(clone);});
    let span=0,raf=0,previous=0,restUntil=0,hover=false,interacting=false,paused=reduceMotion || document.body.classList.contains('motion-paused'), dragging=null,blockedClick=false;
    const measure=()=>{const clone=el.children[originals.length];span=clone?clone.offsetLeft-el.children[0].offsetLeft:0;};
    const setButton=()=>{button.setAttribute('aria-pressed',String(!paused));button.setAttribute('aria-label',paused?'Play automatic horizontal scrolling':'Pause automatic horizontal scrolling');button.querySelector('span').textContent=paused?'▶ PLAY':'Ⅱ PAUSE';};
    const showProgress=()=>{if(progress && span>0)progress.style.width=(Math.min(1,Math.max(0,el.scrollLeft/span))*100).toFixed(1)+'%';};
    const suspend=(ms=3800)=>{restUntil=performance.now()+ms;};
    const tick=t=>{
      if(!el.isConnected)return;
      const dt=previous?Math.min(65,t-previous):0;previous=t;
      if(!paused && !hover && !interacting && t>restUntil && !document.hidden && !document.body.classList.contains('motion-paused') && !isExiting() && byId('view').classList.contains('is-open')){
        if(!span)measure();
        if(span){el.scrollLeft+=dt*(el.id==='catalogGrid'?0.044:0.033);if(el.scrollLeft>=span)el.scrollLeft-=span;showProgress();}
      }
      raf=requestAnimationFrame(tick);
    };
    button.addEventListener('click',()=>{paused=!paused;setButton();if(!paused)restUntil=0;});
    setButton();
    if(matchMedia('(hover:hover)').matches){
      el.addEventListener('mouseenter',()=>hover=true);
      el.addEventListener('mouseleave',()=>{hover=false;suspend(1000);});
    }
    el.addEventListener('focusin',()=>hover=true);
    el.addEventListener('focusout',()=>{hover=false;suspend(1500);});
    el.addEventListener('touchstart',()=>{interacting=true;},{passive:true});
    el.addEventListener('touchend',()=>{interacting=false;suspend();},{passive:true});
    el.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){el.scrollLeft+=e.deltaY*.9;e.preventDefault();}suspend();},{passive:false});
    el.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;dragging={x:e.clientX,scroll:el.scrollLeft,moved:false};interacting=true;el.classList.add('is-grabbing');});
    window.addEventListener('pointermove',onDrag);
    window.addEventListener('pointerup',onStopDrag);
    function onDrag(e){if(!dragging)return;const d=e.clientX-dragging.x;if(Math.abs(d)>9)dragging.moved=true;if(dragging.moved){el.scrollLeft=dragging.scroll-d;e.preventDefault();}}
    function onStopDrag(){if(!dragging)return;blockedClick=dragging.moved;dragging=null;interacting=false;el.classList.remove('is-grabbing');suspend();if(blockedClick)setTimeout(()=>blockedClick=false,120);}
    const preventDragClick=e=>{if(blockedClick){e.preventDefault();e.stopPropagation();blockedClick=false;}};
    el.addEventListener('click',preventDragClick,true);
    el.addEventListener('scroll',()=>{if(span&&el.scrollLeft>=span)el.scrollLeft-=span;showProgress();},{passive:true});
    window.addEventListener('resize',measure);
    const jump=dir=>{measure();suspend(5200);const card=el.children[0];el.scrollBy({left:(card?card.getBoundingClientRect().width+14:260)*dir,behavior:reduceMotion?'instant':'smooth'});};
    const left=byId(id==='rollGrid'?'railLeft':'catalogLeft'),right=byId(id==='rollGrid'?'railRight':'catalogRight');
    left?.addEventListener('click',()=>jump(-1));right?.addEventListener('click',()=>jump(1));
    requestAnimationFrame(measure);raf=requestAnimationFrame(tick);
    liveRail={id,destroy:()=>{cancelAnimationFrame(raf);window.removeEventListener('pointermove',onDrag);window.removeEventListener('pointerup',onStopDrag);window.removeEventListener('resize',measure);}};
  }
  const gallery={items:[],index:0,playing:true,timeout:null,previousFocus:null};
  function galleryItems(src){
    let items;
    if(state.view==='catalog')items=DATA.archive.filter(x=>x.group===state.catalogGroup);
    else if(state.view==='roll')items=pastMembers(state.group);
    else if(state.view==='detail')items=groupMembers(state.group);
    else items=DATA.archive;
    items=items.map(x=>({photo:x.photo,label:(x.rank&&x.rank!=='Not supplied'?x.rank+' · ':'')+x.name}));
    if(!items.some(x=>x.photo===src))items.unshift({photo:src,label:'Supplied portrait'});
    return items;
  }
  function clearGalleryTimeout(){if(gallery.timeout){clearTimeout(gallery.timeout);gallery.timeout=null;}}
  function updateGalleryPlay(){const button=byId('galleryPlay');button.setAttribute('aria-pressed',String(gallery.playing));button.setAttribute('aria-label',gallery.playing?'Pause portrait slideshow':'Play portrait slideshow');byId('galleryPlayIcon').textContent=gallery.playing?'Ⅱ':'▶';byId('galleryPlayText').textContent=gallery.playing?'PAUSE SLIDESHOW':'PLAY SLIDESHOW';}
  function scheduleGallery(){clearGalleryTimeout();const bar=byId('galleryTimerBar');bar.style.animation='none';void bar.offsetWidth;if(gallery.playing&&!reduceMotion&&!document.body.classList.contains('motion-paused')&&!isExiting()&&byId('lightbox').classList.contains('is-open')){bar.style.animation='galleryTimer 6s linear both';gallery.timeout=setTimeout(()=>{switchGallery(1);},6000);}else bar.style.width='0';}
  function switchGallery(delta){if(!gallery.items.length)return;selectGallery((gallery.index+delta+gallery.items.length)%gallery.items.length);}
  function selectGallery(ix,animate=true){
    if(!gallery.items.length)return;gallery.index=(ix+gallery.items.length)%gallery.items.length;
    const entry=gallery.items[gallery.index],img=byId('lightboxImg');
    const apply=()=>{img.src=entry.photo||placeholder();img.alt=entry.label;byId('lightboxLabel').textContent=entry.label;byId('galleryCount').textContent=String(gallery.index+1).padStart(2,'0')+' / '+String(gallery.items.length).padStart(2,'0');document.querySelectorAll('#galleryFilmstrip button').forEach((b,i)=>{const active=i===gallery.index;b.classList.toggle('selected',active);b.setAttribute('aria-current',active?'true':'false');});const selected=byId('galleryFilmstrip').children[gallery.index];selected?.scrollIntoView({behavior:reduceMotion?'instant':'smooth',block:'nearest',inline:'center'});};
    if(animate && !reduceMotion && byId('lightbox').classList.contains('is-open')){
      if(hasGSAP()){window.gsap.to(img,{opacity:0,scale:.89,filter:'blur(13px)',duration:.26,ease:'power2.in',overwrite:true,onComplete:()=>{apply();window.gsap.fromTo(img,{opacity:0,scale:1.09,filter:'blur(13px)'},{opacity:1,scale:1,filter:'blur(0px)',duration:.75,ease:'power3.out',overwrite:true});}});}
      else{const out=img.animate([{opacity:1,transform:'scale(1)',filter:'blur(0)'},{opacity:0,transform:'scale(.92)',filter:'blur(12px)'}],{duration:240,fill:'forwards'});out.onfinish=()=>{out.cancel();apply();img.animate([{opacity:.15,transform:'scale(1.08)',filter:'blur(9px)'},{opacity:1,transform:'scale(1)',filter:'blur(0)'}],{duration:680,easing:'cubic-bezier(.19,1,.22,1)'});};}
    }else apply();
    scheduleGallery();
  }
  function paintGalleryStrip(){byId('galleryFilmstrip').innerHTML=gallery.items.map((x,i)=>`<button type="button" data-gallery-index="${i}" aria-label="View ${h(x.label)}" aria-current="false">${imageHTML(x.photo,x.label)}<span>${String(i+1).padStart(2,'0')}</span></button>`).join('');}
  // Exit confirmation is intentionally a kiosk-safe in-app close state.
  let focusBeforeExit=null;
  function openExit(){if(!state.introComplete)finishIntro();focusBeforeExit=document.activeElement;const box=byId('exitModal');box.classList.add('is-open');box.setAttribute('aria-hidden','false');clearGalleryTimeout();byId('cancelExit').focus();}
  function closeExit(){const box=byId('exitModal');box.classList.remove('is-open');box.setAttribute('aria-hidden','true');focusBeforeExit?.focus?.({preventScroll:true});scheduleGallery();}
  function confirmExit(){const box=byId('exitModal');box.classList.remove('is-open');box.setAttribute('aria-hidden','true');const exit=byId('exitComplete');exit.classList.add('is-open');exit.setAttribute('aria-hidden','false');document.body.classList.add('exhibition-ended');clearGalleryTimeout();byId('returnExhibition').focus();}
  function returnExhibition(){const exit=byId('exitComplete');exit.classList.remove('is-open');exit.setAttribute('aria-hidden','true');document.body.classList.remove('exhibition-ended');focusBeforeExit?.focus?.({preventScroll:true});scheduleGallery();}

  function showView(mode,html,opts={}){
    const box=byId('view');const content=byId('viewContent');
    if(!box.classList.contains('is-open'))state.lastFocus=document.activeElement;
    destroyRail();
    state.view=mode;
    content.innerHTML=html;
    box.classList.add('is-open');box.style.display='flex';box.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';content.scrollTop=0;
    if(!reduceMotion) {
      if(hasGSAP()) window.gsap.fromTo(box,{opacity:0,clipPath:'inset(0 0 100% 0)'},{opacity:1,clipPath:'inset(0 0 0% 0)',duration:.75,ease:'power3.inOut',onComplete:()=>{box.style.clipPath='';}});
      else box.animate([{opacity:0,clipPath:'inset(0 0 100% 0)'},{opacity:1,clipPath:'inset(0 0 0% 0)'}],{duration:610,easing:'cubic-bezier(.19,1,.22,1)'});
    }
    byId('view').focus({preventScroll:true});
    if(opts.animate!==false)requestAnimationFrame(()=>animateStagger('.view-content .motion-in',.055,.09));
  }
  function closeView(){
    destroyRail();
    if(byId('lightbox').classList.contains('is-open')){closeLightbox();return;}
    const box=byId('view');if(!box.classList.contains('is-open'))return;
    const finish=()=>{box.classList.remove('is-open');box.style.display='none';box.style.opacity='';box.style.clipPath='';box.setAttribute('aria-hidden','true');byId('viewContent').innerHTML='';document.body.style.overflow='';state.view='home';state.id=null;state.lastFocus?.focus?.({preventScroll:true});};
    if(!reduceMotion&&hasGSAP())window.gsap.to(box,{opacity:0,duration:.26,ease:'power2.in',onComplete:finish});else finish();
  }
  function detailMarkup(p){
    const group=DATA.groups[p.group];
    const records=groupMembers(p.group);const index=records.findIndex(x=>x.id===p.id);
    const officialBio=p.biography?.trim();const quote=p.quote?.trim();
    const quoteText=quote?`“${h(quote)}”`:'No approved quotation has been supplied for this profile.';
    return `<section class="detail" aria-label="${h(p.name)} profile">
      <div class="detail-art ${p.group==='director'?'red':''} motion-in">
        <span class="detail-num">${h(group.code)} / ${p.current?'FEATURED':'HISTORICAL'} PROFILE</span>
        ${imageHTML(p.photo,p.name+' photograph','detail-photo')}
        <div class="detail-archive-tag"><span>${p.current?'ILLUSTRATIVE CURRENT OFFICE':'ARCHIVAL SAMPLE PROFILE'}</span>
          <button data-action="enlarge" data-src="${h(p.photo)}" data-label="${h(p.name)}" title="Enlarge portrait" aria-label="Enlarge portrait">⤢ VIEW PHOTO</button></div>
      </div>
      <div class="detail-body motion-in">
        <div class="detail-breadcrumb">HALL OF FAME / ${h(group.title).toUpperCase()}</div>
        <span class="rank">${h(p.rank)}</span><h2 id="viewTitle">${h(p.name)}</h2>
        <div class="detail-role">${h(p.appointment)}</div>
        <div class="detail-markers"><span>${p.current?'FEATURED SAMPLE':'HISTORICAL SAMPLE'}</span><span class="sample">PROFILE NOT YET VERIFIED</span></div>
        <div class="detail-lines"><b>TENURE</b><p>${h(p.tenure)}</p></div>
        <div class="detail-lines"><b>BIOGRAPHY</b><p>${officialBio?h(officialBio):'Official biography has not yet been provided by AFCSC. Add the approved text in data.js.'}</p></div>
        <div class="detail-lines"><b>QUOTE / CONTRIBUTIONS</b><p>${quoteText}${p.contributions?.length?' '+h(p.contributions.join(' · ')):''}</p></div>
        <div class="detail-lines"><b>IMAGE SOURCE</b><p>${h(p.photoCredit||'Supplied image archive. Identity pairing awaits confirmation.')}</p></div>
        <div class="detail-controls"><button class="round-arrow" data-action="prev" aria-label="Previous leader">←</button>
          <span class="detail-count">${String(index+1).padStart(2,'0')} / ${String(records.length).padStart(2,'0')}</span>
          <button class="round-arrow" data-action="next" aria-label="Next leader">→</button>
          <button class="ghost-btn" data-action="roll" data-group="${h(p.group)}">VIEW HISTORICAL ROLL ↗</button>
        </div>
      </div>
    </section>`;
  }
  function openDetail(id,animated=true){
    const p=person(id);if(!p)return;
    destroyRail();
    state.id=p.id;state.group=p.group;
    const view=byId('view');
    if(view.classList.contains('is-open') && state.view==='detail'){
      const root=byId('viewContent');
      const set=()=>{root.innerHTML=detailMarkup(p);root.scrollTop=0;requestAnimationFrame(()=>animateStagger('.view-content .motion-in',.07,.01));};
      if(animated&&!reduceMotion&&hasGSAP()) window.gsap.to(root,{opacity:0,x:-18,duration:.18,onComplete:()=>{set();window.gsap.fromTo(root,{opacity:0,x:24},{opacity:1,x:0,duration:.34});}});
      else{set();root.style.opacity=1;root.style.transform='none';}
    }else showView('detail',detailMarkup(p));
    byId('viewKicker').textContent=DATA.groups[p.group].title.toUpperCase();
    byId('viewFootRight').textContent='SAMPLE PROFILE · DATES / BIOGRAPHY TO BE CONFIRMED';
  }
  function moveDetail(delta){
    if(state.view!=='detail')return;
    const records=groupMembers(state.group);const ix=records.findIndex(x=>x.id===state.id);
    openDetail(records[(ix+delta+records.length)%records.length].id);
  }
  function rollCard(p,i){return `<button class="roll-card motion-in" type="button" data-action="detail" data-id="${h(p.id)}" aria-label="View ${h(p.name)}">
    <div class="roll-card-photo">${imageHTML(p.photo,p.name+' archival portrait')}<span class="roll-index">${String(i+1).padStart(2,'0')}</span></div>
    <div class="roll-card-copy"><span class="card-rank">${h(p.rank)}</span><h3>${h(p.name)}</h3>
      <span class="card-tenure">${h(p.tenure)}</span><div class="roll-card-footer">EXPLORE PROFILE <b>↗</b></div></div></button>`;}
  function rollMarkup(group){
    const title=group==='commandant'?'Commandants':'Directors';
    return `<section class="roll-layout">
      <aside class="roll-aside motion-in"><span class="meta-label">02 / THE HISTORICAL ROLL</span>
        <h2 id="viewTitle">THE<br><em>${title}</em><br>ROLL.</h2>
        <p>Explore the sample portraits and service records for both leadership offices. Select any profile to view its details.</p>
        <div class="roll-choice"><button class="${group==='commandant'?'active':''}" data-action="roll" data-group="commandant">01 COMMANDANTS <span>↗</span></button>
          <button class="director ${group==='director'?'active':''}" data-action="roll" data-group="director">02 AIR WARFARE <span>↗</span></button></div>
        <p class="roll-warning">Provisional demonstration roll. Actual names, portrait matches, tenure dates and order of service must be verified before public display.</p>
        <button class="ghost-btn" data-action="catalog" style="margin-top:12px">OPEN COMPLETE PHOTO ARCHIVE ↗</button>
      </aside>
      <div class="roll-right"><div class="roll-tools"><label class="roll-search"><span aria-hidden="true">⌕</span>
        <input id="rollSearch" placeholder="Search rank or name..." type="search" autocomplete="off" aria-label="Search ${title.toLowerCase()}" value="${h(state.search)}" /></label>
        <span class="roll-result-count" id="rollResultCount"></span></div>
        <div class="auto-rail-heading"><span class="auto-rail-kicker"><i></i> THE PREVIOUS OFFICE HOLDERS <small>· AUTO TOUR</small></span><div class="auto-rail-controls"><button type="button" id="railPauseToggle" class="auto-rail-pause" aria-pressed="true"><span>Ⅱ PAUSE</span></button><button id="railLeft" type="button" aria-label="Scroll portraits left">←</button><button id="railRight" type="button" aria-label="Scroll portraits right">→</button></div></div>
        <div class="auto-rail-progress"><i id="railProgress"></i></div><div class="roll-grid" id="rollGrid" aria-label="Horizontally scrolling previous officers"></div><p class="auto-rail-caption">AUTO SCROLL · HOVER TO PAUSE · DRAG OR SWIPE TO EXPLORE · TAP A PORTRAIT</p>
      </div>
    </section>`;
  }
  function refreshRoll(){
    const query=state.search.toLocaleLowerCase().trim();
    const results=pastMembers(state.group).filter(x=>`${x.rank} ${x.name} ${x.tenure}`.toLocaleLowerCase().includes(query));
    const grid=byId('rollGrid');if(!grid)return;
    grid.innerHTML=results.length?results.map((x,i)=>rollCard(x,i)).join(''):'<div class="no-results">No matching sample profiles. Try a different search.</div>';
    byId('rollResultCount').textContent=`${results.length.toString().padStart(2,'0')} OF ${pastMembers(state.group).length.toString().padStart(2,'0')} SAMPLE RECORDS`;
    requestAnimationFrame(()=>{animateStagger('.roll-grid .motion-in:not([aria-hidden])',.04,.01);initRail('rollGrid','railPauseToggle','railProgress');});
  }
  function openRoll(group='commandant'){
    state.group=group;state.search='';
    showView('roll',rollMarkup(group));
    byId('viewKicker').textContent='THE HISTORICAL ROLL / '+DATA.groups[group].title.toUpperCase();
    byId('viewFootRight').textContent='ORDER IS ILLUSTRATIVE · NOT AN OFFICIAL CHRONOLOGY';
    refreshRoll();
  }
  function timelineMarkup(){
    return `<section class="timeline-shell"><div class="view-head motion-in"><div><span class="meta-label">03 / TWO OFFICES · ONE CONTINUUM</span>
      <h2 class="view-title" id="viewTitle">THE <em>TIMELINE.</em></h2><p class="view-subtitle">Browse two matched sequences of sample leadership records. Confirmed dates can be added in the central data file.</p></div>
      <div class="view-actions"><button class="ghost-btn" data-action="roll" data-group="commandant">BROWSE COMMANDANTS ↗</button><button class="ghost-btn" data-action="roll" data-group="director">BROWSE DIRECTORS ↗</button></div></div>
      <div class="timeline-columns">${['commandant','director'].map(group=>`<div class="timeline-column ${group==='director'?'red':''} motion-in">
        <header><h3>${h(DATA.groups[group].title)}</h3><span>${groupMembers(group).length.toString().padStart(2,'0')} PROFILES</span></header>
        ${groupMembers(group).map((p,i)=>`<button class="timeline-row" data-action="detail" data-id="${h(p.id)}">${imageHTML(p.photo,p.name)}
          <span><strong>${h(p.name)}</strong><small>${h(p.current?'Featured sample':p.tenure)}</small></span><b class="timeline-arrow">↗</b></button>`).join('')}
      </div>`).join('')}</div>
      <p class="timeline-notice">Dates and service chronology were not included in the project brief. The two columns therefore show illustrative, numbered profile sequences—not a verified historical tenure timeline.</p>
    </section>`;
  }
  function openTimeline(){
    showView('timeline',timelineMarkup());byId('viewKicker').textContent='TWO OFFICES / ILLUSTRATIVE TIMELINE';
    byId('viewFootRight').textContent='TENURE DATES AWAIT APPROVED AFCSC CONTENT';
  }
  function catalogMarkup(){return `<section class="timeline-shell"><div class="view-head motion-in"><div><span class="meta-label">04 / ASSET CATALOGUE</span>
    <h2 id="viewTitle" class="view-title">PHOTO <em>ARCHIVE.</em></h2><p class="view-subtitle">Explore all supplied photographic assets independently of the sample historical roll.</p></div>
    <button class="ghost-btn" data-action="roll" data-group="director">BACK TO SERVICE ROLL ↗</button></div>
    <div class="catalog-tabs motion-in"><button data-action="cataloggroup" data-group="commandant" class="${state.catalogGroup==='commandant'?'active':''}">HISTORICAL PHOTO SET · 13</button>
      <button data-action="cataloggroup" data-group="director" class="${state.catalogGroup==='director'?'active':''}">DIRECTOR PHOTO SET · 35</button></div>
    <p class="catalog-notice">All photos are user-supplied. Numbered historical portraits have no verified names; officer names on Director files are filename-derived, not officially confirmed appointments.</p>
    <div class="auto-rail-heading"><span class="auto-rail-kicker"><i></i> PORTRAIT COLLECTION <small>· CINEMATIC AUTO TOUR</small></span><div class="auto-rail-controls"><button id="catalogPauseToggle" class="auto-rail-pause" type="button" aria-pressed="true"><span>Ⅱ PAUSE</span></button><button id="catalogLeft" type="button" aria-label="Scroll archive left">←</button><button id="catalogRight" type="button" aria-label="Scroll archive right">→</button></div></div><div class="auto-rail-progress"><i id="catalogProgress"></i></div>
    <div id="catalogGrid" class="catalog-grid" aria-label="Horizontally scrolling portrait archive"></div><p class="auto-rail-caption">AUTO SCROLL · HOVER TO PAUSE · DRAG OR SWIPE · TAP TO ENLARGE</p></section>`;}
  function refreshCatalog(){
    const grid=byId('catalogGrid');if(!grid)return;
    grid.innerHTML=DATA.archive.filter(x=>x.group===state.catalogGroup).map((p,i)=>`<button class="catalog-item motion-in" type="button" data-action="enlarge" data-src="${h(p.photo)}" data-label="${h(p.rank+' · '+p.name)}" title="${h(p.note)}">
      ${imageHTML(p.photo,p.name)}<div class="catalog-copy"><b>${h(p.name)}</b><small>${h(p.rank)}</small></div></button>`).join('');
    requestAnimationFrame(()=>{animateStagger('.catalog-grid .motion-in:not([aria-hidden])',.018,.01);initRail('catalogGrid','catalogPauseToggle','catalogProgress');});
  }
  function openCatalog(group=state.catalogGroup){
    state.catalogGroup=group;showView('catalog',catalogMarkup());refreshCatalog();
    byId('viewKicker').textContent='SUPPLIED PHOTOGRAPH ARCHIVE';
    byId('viewFootRight').textContent='PHOTO / IDENTITY ASSOCIATIONS REQUIRE VERIFICATION';
  }
  function openLightbox(src,label){
    gallery.previousFocus=document.activeElement;
    gallery.items=galleryItems(src);gallery.items=gallery.items.map(x=>x.photo===src?{...x,label}:x);
    gallery.playing=!reduceMotion&&!document.body.classList.contains('motion-paused');
    const box=byId('lightbox');box.classList.add('is-open');box.setAttribute('aria-hidden','false');
    paintGalleryStrip();updateGalleryPlay();selectGallery(Math.max(0,gallery.items.findIndex(x=>x.photo===src)),false);byId('closeLightbox').focus();
    if(!reduceMotion)motion(byId('galleryHero'),{y:35,opacity:0},{duration:.65});
  }
  function closeLightbox(){clearGalleryTimeout();byId('lightbox').classList.remove('is-open');byId('lightbox').setAttribute('aria-hidden','true');gallery.previousFocus?.focus?.({preventScroll:true});}
  function showHelp(){byId('helpOverlay').classList.add('is-open');byId('helpOverlay').setAttribute('aria-hidden','false');byId('closeHelp').focus();}
  function closeHelp(){byId('helpOverlay').classList.remove('is-open');byId('helpOverlay').setAttribute('aria-hidden','true');byId('openGuide').focus();}
  function updateIntroProgress(value){byId('introCounter').textContent=`${String(Math.round(value)).padStart(2,'0')}%`;byId('introProgress').style.width=value+'%';}
  function finishIntro(){
    if(state.introComplete)return;state.introComplete=true;updateIntroProgress(100);
    const intro=byId('intro');
    const done=()=>{intro.style.display='none';intro.setAttribute('aria-hidden','true');if(!reduceMotion)animateStagger('.main-stage .reveal',.11,.05);};
    if(reduceMotion)done();
    else if(hasGSAP())window.gsap.to(intro,{yPercent:-105,opacity:0,duration:1.1,ease:'power4.inOut',onComplete:done});
    else {intro.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(-110%)',opacity:0}],{duration:940,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'}).onfinish=done;}
  }
  function beginIntro(){
    const duration=reduceMotion?60:1950;const start=performance.now();let raf;
    const tick=(t)=>{if(state.introComplete){cancelAnimationFrame(raf);return;}const a=Math.min(1,(t-start)/duration);updateIntroProgress(Math.round((1-Math.pow(1-a,2.4))*100));if(a===1)finishIntro();else raf=requestAnimationFrame(tick);};
    raf=requestAnimationFrame(tick);
    if(!reduceMotion&&hasGSAP())window.gsap.fromTo('.intro-orbit img',{opacity:0,scale:.55,rotation:-16},{opacity:1,scale:1,rotation:0,duration:1.35,ease:'back.out(1.25)'});
  }
  function toggleFullscreen(){if(document.fullscreenElement){document.exitFullscreen?.().catch(()=>{});}else document.documentElement.requestFullscreen?.().catch(()=>{});}
  document.addEventListener('click',e=>{
    if(isExiting())return;const t=e.target.closest('[data-action]');if(!t)return;
    const action=t.dataset.action;
    if(action==='detail')openDetail(t.dataset.id);
    else if(action==='roll')openRoll(t.dataset.group||'commandant');
    else if(action==='timeline')openTimeline();
    else if(action==='catalog')openCatalog();
    else if(action==='cataloggroup')openCatalog(t.dataset.group);
    else if(action==='prev')moveDetail(-1);
    else if(action==='next')moveDetail(1);
    else if(action==='enlarge')openLightbox(t.dataset.src,t.dataset.label||'Portrait');
  });
  byId('brandHome').addEventListener('click',closeView);
  byId('closeView').addEventListener('click',closeView);
  byId('closeViewIcon').addEventListener('click',closeView);
  byId('closeLightbox').addEventListener('click',closeLightbox);
  byId('lightbox').addEventListener('click',e=>{if(e.target.id==='lightbox')closeLightbox();});
  byId('openPhotoArchive').addEventListener('click',()=>openCatalog('director'));
  byId('openGuide').addEventListener('click',showHelp);
  byId('closeHelp').addEventListener('click',closeHelp);
  byId('helpBegin').addEventListener('click',closeHelp);
  byId('toggleFull').addEventListener('click',toggleFullscreen);
  ['exitButton','viewExitButton','galleryExitButton'].forEach(id=>byId(id).addEventListener('click',openExit));
  byId('cancelExit').addEventListener('click',closeExit);
  byId('confirmExit').addEventListener('click',confirmExit);
  byId('returnExhibition').addEventListener('click',returnExhibition);
  byId('exitModal').addEventListener('click',e=>{if(e.target===byId('exitModal')||e.target.classList.contains('exit-modal-dim'))closeExit();});
  byId('galleryPrevious').addEventListener('click',()=>switchGallery(-1));
  byId('galleryNext').addEventListener('click',()=>switchGallery(1));
  byId('galleryPlay').addEventListener('click',()=>{gallery.playing=!gallery.playing;updateGalleryPlay();scheduleGallery();});
  let gallerySwipe=null;
  byId('galleryHero').addEventListener('touchstart',e=>{if(e.touches.length===1)gallerySwipe={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
  byId('galleryHero').addEventListener('touchend',e=>{if(!gallerySwipe)return;const dx=e.changedTouches[0].clientX-gallerySwipe.x,dy=e.changedTouches[0].clientY-gallerySwipe.y;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.3)switchGallery(dx<0?1:-1);gallerySwipe=null;},{passive:true});
  new MutationObserver(()=>{if(document.body.classList.contains('motion-paused')){gallery.playing=false;updateGalleryPlay();}if(byId('lightbox').classList.contains('is-open'))scheduleGallery();}).observe(document.body,{attributes:true,attributeFilter:['class']});
  byId('galleryFilmstrip').addEventListener('click',e=>{const target=e.target.closest('[data-gallery-index]');if(target)selectGallery(Number(target.dataset.galleryIndex));});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearGalleryTimeout();else scheduleGallery();});
  byId('skipIntro').addEventListener('click',finishIntro);
  byId('viewContent').addEventListener('input',e=>{
    if(e.target.id==='rollSearch'){state.search=e.target.value;refreshRoll();}
  });
  document.addEventListener('keydown',e=>{
    if(byId('exitComplete').classList.contains('is-open')){if(e.key==='Escape')returnExhibition();return;}
    if(byId('exitModal').classList.contains('is-open')){
      if(e.key==='Escape'){e.preventDefault();closeExit();return;}
      if(e.key==='Tab'){const a=byId('cancelExit'),b=byId('confirmExit');if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus();}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus();}}return;
    }
    if(!state.introComplete){if(e.key==='Escape'||e.key==='Enter')finishIntro();return;}
    if(byId('helpOverlay').classList.contains('is-open')){if(e.key==='Escape')closeHelp();return;}
    if(byId('lightbox').classList.contains('is-open')){
      if(e.key==='Escape')closeLightbox();
      else if(e.key==='ArrowRight'){e.preventDefault();switchGallery(1);}
      else if(e.key==='ArrowLeft'){e.preventDefault();switchGallery(-1);}
      else if(e.key===' '&&!['BUTTON','INPUT'].includes(document.activeElement?.tagName)){e.preventDefault();gallery.playing=!gallery.playing;updateGalleryPlay();scheduleGallery();}
      return;
    }
    if(e.key==='Escape'&&state.view!=='home'){closeView();return;}
    if(state.view==='detail'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){
      if(e.key==='ArrowRight'){e.preventDefault();moveDetail(1);}
      if(e.key==='ArrowLeft'){e.preventDefault();moveDetail(-1);}
    }
    if(e.key==='f'&&state.view==='home'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))toggleFullscreen();
  });
  let touchX=0,touchY=0;
  byId('view').addEventListener('touchstart',e=>{if(state.view==='detail'&&e.touches.length===1){touchX=e.touches[0].clientX;touchY=e.touches[0].clientY;}},{passive:true});
  byId('view').addEventListener('touchend',e=>{if(state.view!=='detail'||!touchX)return;const dx=e.changedTouches[0].clientX-touchX;const dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>75&&Math.abs(dx)>Math.abs(dy)*1.5)moveDetail(dx<0?1:-1);touchX=0;},{passive:true});
  renderFeatured('commandant');renderFeatured('director');addDust();beginIntro();
})();
