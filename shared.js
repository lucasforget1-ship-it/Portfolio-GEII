/* shared.js — effets communs à toutes les pages */

(function(){

  /* ══════════════════════════════════
     BARRES D'ÉVALUATION 5 POINTS (demi supporté)
     data-score="3"   → 3 pleins
     data-score="3.5" → 3 pleins + 1 demi
     data-score="0.5" → 1 demi
     Chaque point = SVG cercle : plein / demi / vide
  ══════════════════════════════════ */
  document.querySelectorAll('[data-score]').forEach(el => {
    const raw = parseFloat(el.dataset.score) || 0;
    const val = Math.min(5, Math.max(0, raw));
    el.classList.add('score');
    el.innerHTML = '';

    const R = 4.5;       // rayon du cercle
    const S = R * 2 + 4; // taille du SVG (viewBox)
    const C = S / 2;      // centre

    const FULL  = '#3ac6ff';
    const EMPTY_STROKE = 'rgba(58,198,255,.32)';
    const GLOW  = 'rgba(58,198,255,.4)';

    for (let i = 1; i <= 5; i++) {
      const diff = val - (i - 1); // combien il reste pour ce point
      // diff >= 1 → plein ; 0 < diff < 1 → demi ; <= 0 → vide
      const state = diff >= 1 ? 'full' : diff > 0 ? 'half' : 'empty';

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', S);
      svg.setAttribute('height', S);
      svg.setAttribute('viewBox', `0 0 ${S} ${S}`);

      if (state === 'empty') {
        // cercle vide
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', C); circle.setAttribute('cy', C); circle.setAttribute('r', R);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', EMPTY_STROKE);
        circle.setAttribute('stroke-width', '1.5');
        svg.appendChild(circle);

      } else if (state === 'full') {
        // glow filter
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const uid  = `gf${Math.random().toString(36).slice(2,7)}`;
        defs.innerHTML = `<filter id="${uid}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>`;
        svg.appendChild(defs);
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', C); circle.setAttribute('cy', C); circle.setAttribute('r', R);
        circle.setAttribute('fill', FULL);
        circle.setAttribute('filter', `url(#${uid})`);
        svg.appendChild(circle);

      } else {
        // demi-cercle : moitié gauche pleine, moitié droite vide
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const clipId = `hc${Math.random().toString(36).slice(2,7)}`;
        const uid    = `hg${Math.random().toString(36).slice(2,7)}`;
        defs.innerHTML = `
          <clipPath id="${clipId}">
            <rect x="0" y="0" width="${C}" height="${S}"/>
          </clipPath>
          <filter id="${uid}" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>`;
        svg.appendChild(defs);
        // fond vide (cercle entier)
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bg.setAttribute('cx', C); bg.setAttribute('cy', C); bg.setAttribute('r', R);
        bg.setAttribute('fill', 'none');
        bg.setAttribute('stroke', EMPTY_STROKE);
        bg.setAttribute('stroke-width', '1.5');
        svg.appendChild(bg);
        // moitié gauche pleine
        const half = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        half.setAttribute('cx', C); half.setAttribute('cy', C); half.setAttribute('r', R);
        half.setAttribute('fill', FULL);
        half.setAttribute('clip-path', `url(#${clipId})`);
        half.setAttribute('filter', `url(#${uid})`);
        svg.appendChild(half);
      }

      el.appendChild(svg);
    }
  });

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
