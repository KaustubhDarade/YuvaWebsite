const byId = (id)=>document.getElementById(id);
const menu = byId('menu');
const navToggle = byId('navToggle');
if(navToggle){
  navToggle.addEventListener('click',()=>{
    menu.classList.toggle('open');
  });
}
const yearEl = document.getElementById('year');
if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

// Hero slider
(function(){
  const slider = byId('heroSlider');
  if(!slider) return;
  const slides = Array.from(slider.querySelectorAll('.slide'));
  const prev = byId('heroPrev');
  const next = byId('heroNext');
  const dotsWrap = byId('heroDots');
  let i = 0, timer;

  function render(){
    slides.forEach((s,idx)=>s.classList.toggle('active', idx===i));
    if(dotsWrap){
      dotsWrap.innerHTML = '';
      slides.forEach((_,idx)=>{
        const b = document.createElement('button');
        if(idx===i) b.classList.add('active');
        b.addEventListener('click',()=>{ i = idx; restart(); });
        dotsWrap.appendChild(b);
      });
    }
  }
  function nextSlide(){ i = (i+1) % slides.length; render(); }
  function prevSlide(){ i = (i-1+slides.length) % slides.length; render(); }
  function start(){ timer = setInterval(nextSlide, 3000); }
  function stop(){ clearInterval(timer); }
  function restart(){ stop(); render(); start(); }

  render(); start();
  if(next) next.addEventListener('click', ()=>{ nextSlide(); restart(); });
  if(prev) prev.addEventListener('click', ()=>{ prevSlide(); restart(); });
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
})();

// Dynamic content loaders
(function(){
  const API_BASE = (window.API_BASE) || 'http://localhost:3000';

  async function fetchJSON(url){
    try{
      const res = await fetch(url);
      if(!res.ok) throw new Error('HTTP '+res.status);
      return await res.json();
    }catch(e){
      console.error('Fetch failed:', url, e);
      return null;
    }
  }

  // Gallery
  const galleryGrid = document.getElementById('galleryGrid');
  if(galleryGrid){
    fetchJSON(API_BASE + '/api/gallery').then(data=>{
      if(!data || !Array.isArray(data.items)) return;
      galleryGrid.innerHTML = '';
      data.items.forEach(item=>{
        const fig = document.createElement('figure');
        fig.className = 'gallery-item';
        const img = document.createElement('img');
        img.className = 'gallery-img';
        img.loading = 'lazy';
        img.alt = item.alt || 'Gallery Image';
        img.src = (typeof item.url === 'string' && (item.url.startsWith('http://') || item.url.startsWith('https://')))
          ? item.url
          : (API_BASE + item.url);
        fig.appendChild(img);
        galleryGrid.appendChild(fig);
      });
    });
  }

  // Events timeline
  const eventsList = document.getElementById('eventsList');
  if(eventsList){
    fetchJSON(API_BASE + '/api/events').then(data=>{
      if(!data || !Array.isArray(data.items)) return;
      eventsList.innerHTML = '';
      data.items.forEach(ev=>{
        const wrap = document.createElement('div');
        wrap.className = 'tl-item';
        const dot = document.createElement('div'); dot.className='tl-dot';
        const cont = document.createElement('div'); cont.className='tl-content';
        const h3 = document.createElement('h3'); h3.textContent = ev.title || ev.month || 'कार्यक्रम';
        const p = document.createElement('p'); p.textContent = ev.desc || '';
        cont.appendChild(h3); cont.appendChild(p);
        wrap.appendChild(dot); wrap.appendChild(cont);
        eventsList.appendChild(wrap);
      });
    });
  }
})();
