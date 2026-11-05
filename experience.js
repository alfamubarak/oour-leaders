/* AFCSC touch-first experiential motion layer.
   The exhibition remains functional without network, GSAP, or mouse input. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const pair = $('pair');
  const tabs = {commandant:$('spotlightCommandant'), director:$('spotlightDirector')};
  const reset = $('resetSpotlight');
  const resetButton = $('focusBoth');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  let spotlight = null;
  let motionEnabled = !reduce;
  let lastPointerFrame = 0;

  function animate(el,frames,options){
    if(!el || !motionEnabled || reduce)return;
    if(window.gsap && typeof window.gsap.fromTo === 'function' && frames.length===2){
      const [from,to]=frames;
      window.gsap.fromTo(el,from,{...to,duration:(options.duration||300)/1000,ease:'power3.out',overwrite:'auto'});
    }else if(el.animate){el.animate(frames,{duration:480,easing:'cubic-bezier(.22,1,.36,1)',fill:'none',...options});}
  }
  function setSpotlight(group) {
    spotlight = spotlight === group ? null : group;
    pair.classList.toggle('is-spotlight-commandant',spotlight==='commandant');
    pair.classList.toggle('is-spotlight-director',spotlight==='director');
    for(const key of Object.keys(tabs)){
      tabs[key].setAttribute('aria-pressed',String(spotlight===key));
      tabs[key].classList.toggle('active',spotlight===key);
      tabs[key].classList.toggle('director-active',key==='director'&&spotlight===key);
    }
    reset.setAttribute('aria-label',spotlight ? 'Reset spotlight and show both offices':'Both offices equally highlighted');
    if(spotlight && motionEnabled){
      const card=$('wing-'+spotlight);
      animate(card,[{filter:'brightness(1)'},{filter:'brightness(1.13)'},{filter:'brightness(1)'}],{duration:680});
    }
  }
  function resetSpotlight(){spotlight=null;setSpotlight(null);}
  tabs.commandant.addEventListener('click',()=>setSpotlight('commandant'));
  tabs.director.addEventListener('click',()=>setSpotlight('director'));
  reset.addEventListener('click',resetSpotlight);
  resetButton.addEventListener('click',resetSpotlight);
  resetSpotlight();
  const motionToggle=$('motionToggle');
  function setMotion(on){
    motionEnabled=on;
    document.body.classList.toggle('motion-paused',!on);
    motionToggle.setAttribute('aria-pressed',String(on));
    motionToggle.setAttribute('aria-label',on?'Pause ambient animation':'Resume ambient animation');
    const text=motionToggle.querySelector('.motion-text');
    if(text)text.textContent=on?'MOTION ON':'MOTION OFF';
    if(!on){document.querySelectorAll('.leader-wing').forEach(c=>c.style.transform='');document.querySelectorAll('.wing-photo-shell').forEach(c=>c.style.transform='');}
  }
  motionToggle.addEventListener('click',()=>setMotion(!motionEnabled));
  setMotion(motionEnabled);

  if(finePointer && !reduce){
    document.querySelectorAll('.leader-wing').forEach(card=>{
      const photo=()=>card.querySelector('.wing-photo-shell');
      const move=e=>{
        if(!motionEnabled || document.getElementById('view').classList.contains('is-open'))return;
        const r=card.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`perspective(1400px) rotateY(${(x*3.6).toFixed(2)}deg) rotateX(${(-y*3.1).toFixed(2)}deg) translateY(-3px)`;
        card.style.setProperty('--pointer-x',`${((x+.5)*100).toFixed(1)}%`);
        card.style.setProperty('--pointer-y',`${((y+.5)*100).toFixed(1)}%`);
        // Original app handles the cinematic portrait offset; both layers complement each other.
      };
      card.addEventListener('pointermove',move,{passive:true});
      card.addEventListener('pointerleave',()=>{card.style.transform='';card.style.removeProperty('--pointer-x');card.style.removeProperty('--pointer-y');});
    });
    // A subtle, slow background shift gives depth without following every cursor pixel.
    const glowA=document.querySelector('.glow-a'), glowB=document.querySelector('.glow-b');
    window.addEventListener('pointermove',e=>{
      if(!motionEnabled||performance.now()-lastPointerFrame<35)return;
      lastPointerFrame=performance.now();
      const x=e.clientX/window.innerWidth-.5, y=e.clientY/window.innerHeight-.5;
      if(glowA)glowA.style.transform=`translate(${(x*24).toFixed(1)}px,${(y*19).toFixed(1)}px)`;
      if(glowB)glowB.style.transform=`translate(${(-x*18).toFixed(1)}px,${(-y*12).toFixed(1)}px)`;
    },{passive:true});
  }

  // A one-time cinematic entrance once app.js has revealed the home screen.
  // Avoids timers and keeps the gallery functional even if an animation is skipped.
  const introEl=$('intro');
  let homeSequencePlayed=false;
  const playHomeEntrance=()=>{
    if(homeSequencePlayed || !introEl || introEl.style.display!=='none')return;
    homeSequencePlayed=true;
    if(!motionEnabled || reduce)return;
    const cards=[ $('wing-commandant'), $('wing-director') ];
    cards.forEach((card,i)=>{
      if(window.gsap){
        window.gsap.fromTo(card,{y:45,opacity:0,scale:.97},{y:0,opacity:1,scale:1,duration:1.05,delay:.13+i*.16,ease:'power3.out',clearProps:'transform,opacity'});
        window.gsap.fromTo(card.querySelector('.wing-photo-shell'),{x:60,opacity:.4},{x:0,opacity:1,duration:1.25,delay:.23+i*.16,ease:'power3.out',clearProps:'transform,opacity'});
      }else{
        card.animate([{transform:'translateY(45px) scale(.975)',opacity:.2},{transform:'translateY(0px) scale(1)',opacity:1}],{duration:980,delay:120+i*160,easing:'cubic-bezier(.19,1,.22,1)'});
        card.querySelector('.wing-photo-shell')?.animate([{opacity:.4,transform:'translateX(40px)'},{opacity:1,transform:'translateX(0)'}],{duration:1100,delay:120+i*160,easing:'cubic-bezier(.19,1,.22,1)'});
      }
    });
    const medallion=$('focusBoth');
    if(medallion)animate(medallion,[{opacity:0,transform:'scale(.6) rotate(-30deg)'},{opacity:1,transform:'scale(1) rotate(0deg)'}],{duration:1100,delay:570});
  };
  if(introEl){
    const observer=new MutationObserver(()=>{if(introEl.style.display==='none'){playHomeEntrance();observer.disconnect();}});
    observer.observe(introEl,{attributes:true,attributeFilter:['style']});
    playHomeEntrance();
  }

  // Touchscreen visitors can flick between the two focus states without opening a profile.
  let touchStart=null;
  const strip=document.querySelector('.explore-strip');
  strip.addEventListener('touchstart',e=>{if(e.touches.length===1)touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
  strip.addEventListener('touchend',e=>{
    if(!touchStart)return;
    const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;
    if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.4)setSpotlight(dx<0?'director':'commandant');
    touchStart=null;
  },{passive:true});

  // Key navigation on the landing screen only; view navigation is managed by app.js.
  document.addEventListener('keydown',e=>{
    const intro=$('intro'), view=$('view');
    if(intro&&intro.style.display!=='none' || view?.classList.contains('is-open') || document.querySelector('.help-overlay.is-open') || document.querySelector('.lightbox.is-open'))return;
    if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;
    if(e.key==='1')setSpotlight('commandant');
    if(e.key==='2')setSpotlight('director');
    if(e.key==='0')resetSpotlight();
  });
  // Reveal brief interactivity hint in browser console for developers.
  console.info('AFCSC Our Leaders · press 1 / 2 to highlight an office; 0 resets. All portrait content remains editable in data.js.');
})();
