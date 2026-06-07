/* shared.js — effets communs à toutes les pages */

(function(){

  /* ── Cursor discret (anneau seul, lag doux) ── */
  const ring = document.getElementById('cursorRing');
  if(ring){
    let mx=window.innerWidth/2, my=window.innerHeight/2;
    let rx=mx, ry=my;
    document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
    (function animRing(){
      rx+=(mx-rx)*.1; ry+=(my-ry)*.1;
      ring.style.left=rx+'px'; ring.style.top=ry+'px';
      requestAnimationFrame(animRing);
    })();
  }

  /* ── Barre de lecture ── */
  const bar = document.getElementById('progress-bar');
  const nav = document.getElementById('topNav');
  if(bar){
    document.addEventListener('scroll',()=>{
      const s=document.documentElement;
      const pct=s.scrollTop/(s.scrollHeight-s.clientHeight)*100;
      bar.style.width=pct+'%';
      if(nav) nav.classList.toggle('scrolled',s.scrollTop>40);
    },{passive:true});
  }

  /* ── Reveal au scroll ── */
  const reveals = document.querySelectorAll('.reveal');
  if(reveals.length){
    const io = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    },{threshold:.08, rootMargin:'0px 0px -30px 0px'});
    reveals.forEach(el=>io.observe(el));
  }

  /* ── Compteurs animés ── */
  const countersEl = document.getElementById('counters');
  if(countersEl){
    function animCounter(el,target){
      const numEl=el.querySelector('.num');
      const start=performance.now();
      (function tick(now){
        const t=Math.min((now-start)/1400,1);
        const ease=1-Math.pow(1-t,4);
        numEl.textContent=Math.floor(ease*target);
        if(t<1) requestAnimationFrame(tick);
        else numEl.textContent=target;
      })(start);
    }
    const cObs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.querySelectorAll('.counter-val').forEach(v=>animCounter(v,+v.dataset.target));
          cObs.unobserve(e.target);
        }
      });
    },{threshold:.3});
    cObs.observe(countersEl);
  }

  /* ── Copie email ── */
  const copyBtn = document.getElementById('copyEmail');
  const toast   = document.getElementById('toast');
  if(copyBtn && toast){
    let timer;
    copyBtn.addEventListener('click',()=>{
      navigator.clipboard.writeText('lucas.forget1@gmail.com').then(()=>{
        clearTimeout(timer);
        toast.classList.add('show');
        timer=setTimeout(()=>toast.classList.remove('show'),2200);
      });
    });
  }

  /* ── Lightbox ── */
  const lb    = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbClose = document.getElementById('lbClose');
  if(lb && lbImg){
    document.querySelectorAll('[data-lightbox]').forEach(img=>{
      img.style.cursor='zoom-in';
      img.addEventListener('click',e=>{
        e.preventDefault(); e.stopPropagation();
        lbImg.src=img.src;
        lb.classList.add('open');
      });
    });
    if(lbClose) lbClose.addEventListener('click',()=>lb.classList.remove('open'));
    lb.addEventListener('click',e=>{if(e.target===lb) lb.classList.remove('open')});
    document.addEventListener('keydown',e=>{if(e.key==='Escape') lb.classList.remove('open')});
  }

})();
