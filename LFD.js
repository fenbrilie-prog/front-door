/* Checkbox — Legal Front Door | behaviors (hero tunnel, routing story,
   why-now chart, integrations spokes, problem map wires, demo modal) */
(function () {
  function init() {

(function(){
  var root = document;

  // Comparison marks
  var marks = {
    yes:'<span class="cbx-r__cmp-mark cbx-r__cmp-mark--yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>',
    partial:'<span class="cbx-r__cmp-mark cbx-r__cmp-mark--partial"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 2.6 20h18.8z"/><line x1="12" y1="10" x2="12" y2="14.5"/><circle cx="12" cy="17.6" r="1" fill="currentColor" stroke="none"/></svg></span>',
    no:'<span class="cbx-r__cmp-mark cbx-r__cmp-mark--no"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></span>'
  };
  root.querySelectorAll('.cbx-r__cmp-table td[data-m]').forEach(function(td){ td.innerHTML = marks[td.getAttribute('data-m')] || ''; });

  // Problem→resolution map: draw tangled in-wires and clean out-wires
  (function(){
    var map = root.querySelector('[data-cbx-map]');
    var svg = root.querySelector('[data-cbx-map-wires]');
    if(!map || !svg) return;
    var wrap = map.parentElement; // .cbx-r__map
    var ins  = Array.prototype.slice.call(map.querySelectorAll('[data-cbx-in]'));
    var outs = Array.prototype.slice.call(map.querySelectorAll('[data-cbx-out]'));
    var hub  = map.querySelector('[data-cbx-hub] .cbx-r__hub-node');
    if(!hub) return;
    // deterministic jitter per in-wire so it doesn't reshuffle on resize
    var JIT = [[-26,18],[34,-22],[-18,-30],[28,26],[-32,-12],[22,30],[-20,28],[30,-18]];
    var NS = 'http://www.w3.org/2000/svg';
    function center(el){
      var r = el.getBoundingClientRect(), w = wrap.getBoundingClientRect();
      return { x: r.left - w.left + r.width/2, y: r.top - w.top + r.height/2,
               l: r.left - w.left, rt: r.right - w.left, w: r.width };
    }
    function edge(el, side){ // side: 'r' right-center, 'l' left-center
      var r = el.getBoundingClientRect(), w = wrap.getBoundingClientRect();
      return { x: (side==='r'? r.right : r.left) - w.left, y: r.top - w.top + r.height/2 };
    }
    function path(d, color, opacity, width, kind, i){
      var p = document.createElementNS(NS,'path');
      p.setAttribute('d', d); p.setAttribute('class','cbx-r__wire cbx-r__wire--'+kind);
      p.setAttribute('stroke', color); p.setAttribute('stroke-width', width);
      p.setAttribute('stroke-opacity', opacity); p.setAttribute('stroke-linecap','round');
      p.style.setProperty('--spd', (kind==='in' ? 2.4 : 2.0) + (i%4)*0.35 + 's');
      p.style.setProperty('--dly', (-(i*0.45)).toFixed(2) + 's');
      svg.appendChild(p);
    }
    function draw(){
      var w = wrap.getBoundingClientRect();
      svg.setAttribute('viewBox', '0 0 ' + w.width + ' ' + w.height);
      svg.setAttribute('width', w.width); svg.setAttribute('height', w.height);
      while(svg.firstChild) svg.removeChild(svg.firstChild);
      var vertical = window.innerWidth < 900;
      var hc = center(hub);
      var hubIn  = vertical ? {x:hc.x, y:hc.l!==undefined? (hub.getBoundingClientRect().top - w.top):hc.y} : edge(hub,'l');
      var hubOut = vertical ? {x:hc.x, y:(hub.getBoundingClientRect().bottom - w.top)} : edge(hub,'r');
      // tangled in-wires
      ins.forEach(function(el, i){
        var c = vertical ? {x:center(el).x, y:(el.getBoundingClientRect().bottom - w.top)} : edge(el,'r');
        var col = el.style.getPropertyValue('--c').trim() || '#8A8A95';
        var j = JIT[i % JIT.length];
        var mx = (c.x + hubIn.x)/2, my = (c.y + hubIn.y)/2;
        var d = 'M '+c.x+' '+c.y+' C '+(mx+j[0])+' '+(c.y+j[1])+' '+(mx+j[1])+' '+(hubIn.y+j[0])+' '+hubIn.x+' '+hubIn.y;
        path(d, col, 0.5, 2, 'in', i);
      });
      // clean out-wires
      outs.forEach(function(el, i){
        var c = vertical ? {x:center(el).x, y:(el.getBoundingClientRect().top - w.top)} : edge(el,'l');
        var col = el.style.getPropertyValue('--c').trim() || '#0BB870';
        var dx = (c.x - hubOut.x);
        var d = 'M '+hubOut.x+' '+hubOut.y+' C '+(hubOut.x+dx*0.45)+' '+hubOut.y+' '+(c.x-dx*0.45)+' '+c.y+' '+c.x+' '+c.y;
        path(d, col, 0.9, 2.5, 'out', i);
      });
    }
    draw();
    if(typeof ResizeObserver !== 'undefined'){ new ResizeObserver(draw).observe(wrap); }
    else { window.addEventListener('resize', draw); }
    window.addEventListener('load', draw);
  })();

  // Outcome bands
  var out = root.querySelector('.cbx-r__out');
  if(out){
    out.querySelectorAll('[data-out]').forEach(function(tab){
      tab.addEventListener('click', function(){
        var key = tab.getAttribute('data-out');
        out.setAttribute('data-active', key);
        out.querySelectorAll('[data-out]').forEach(function(t){ t.setAttribute('aria-selected', t===tab?'true':'false'); });
        out.querySelectorAll('[data-out-panel]').forEach(function(p){ p.setAttribute('data-active', p.getAttribute('data-out-panel')===key ? 'true':'false'); });
      });
    });
  }

  // FAQ accordion
  root.querySelectorAll('.cbx-r__faq-item .cbx-r__faq-q').forEach(function(q){
    q.addEventListener('click', function(){
      var item = q.closest('.cbx-r__faq-item');
      item.setAttribute('data-open', item.getAttribute('data-open')==='true' ? 'false':'true');
    });
  });
})();

/* ---- */

/* HERO — REQUEST TUNNEL: legal-request cards drawn into a perspective door.
   Canvas streak field converges on the same vanishing point. No deps.
   Respects reduced motion, pauses offscreen. */
(function () {
  var root = document.querySelector('[data-cbx-r-gravity]');
  if (!root) return;
  var field = root.querySelector('[data-cbx-r-gravity-field]');
  var canvas = root.querySelector('.cbx-r__hg-fx');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ICONS = {
    mail:   '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    hash:   '<path d="M9 4 7.5 20M16.5 4 15 20M4 8.5h16M3.5 15.5h16"/>',
    people: '<circle cx="9" cy="9" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 7.2a3 3 0 0 1 0 5.6"/><path d="M17.5 19a5.5 5.5 0 0 0-2.3-4.5"/>',
    form:   '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M9 8h6M9 12h6M9 16h3"/>'
  };
  function srcIc(key) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[key] || '') + '</svg>';
  }

  var REQUESTS = [
    ['Sales',          'Can Legal review this customer contract?', 'hash',   'med'],
    ['Procurement',    'We need a vendor agreement approved.',     'mail',   'med'],
    ['People',         'Can you review this employee policy?',      'form',   'low'],
    ['Marketing',      'Can we use this campaign claim?',           'people', 'low'],
    ['Product',        'Does this feature create privacy risk?',    'hash',   'high'],
    ['Executive',      'Can you assess this regulatory issue?',     'mail',   'high']
  ];

  var TIERS = [
    { s: 1.06, z: 6, r: [42, 60], dur: [9.5, 13.5] },
    { s: 0.82, z: 4, r: [30, 46], dur: [8.0, 11.0] },
    { s: 0.60, z: 2, r: [18, 32], dur: [6.5, 9.0] }
  ];
  var VFAC = 0.82;
  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeItem(team, question, srcKey, urgency, tier) {
    var d = TIERS[tier];
    var phi = Math.PI + (Math.random() * 2 - 1) * 1.45;
    var r0 = rand(d.r[0], d.r[1]);
    var dx0 = Math.cos(phi) * r0;
    var dy0 = Math.sin(phi) * r0 * VFAC;
    var dur = rand(d.dur[0], d.dur[1]);
    var delay = -rand(0.3, dur);
    var el = document.createElement('div');
    el.className = 'cbx-r__hg-item';
    el.style.cssText =
      '--dx0:' + dx0.toFixed(1) + 'cqmin;--dy0:' + dy0.toFixed(1) + 'cqmin;' +
      '--dur:' + dur.toFixed(2) + 's;--delay:' + delay.toFixed(2) + 's;' +
      '--s-max:' + d.s + ';--z:' + d.z + ';';
    el.innerHTML =
      '<div class="cbx-r__hg-card-in"><div class="cbx-r__hg-head">' +
        '<span class="cbx-r__hg-dot" data-u="' + urgency + '"></span>' +
        '<span class="cbx-r__hg-dept">' + team + '</span>' +
        '<span class="cbx-r__hg-src">' + srcIc(srcKey) + '</span>' +
      '</div><div class="cbx-r__hg-q">' + question + '</div></div>';
    return el;
  }

  function build() {
    if (!field) return;
    var hw = root.getBoundingClientRect().width;
    VFAC = (hw && hw < 460) ? 0.5 : 0.82;
    var frag = document.createDocumentFragment(), n = 0;
    for (var pass = 0; pass < 2; pass++) {
      for (var i = 0; i < REQUESTS.length; i++) {
        var r = REQUESTS[i];
        frag.appendChild(makeItem(r[0], r[1], r[2], r[3], n % 3));
        n++;
      }
    }
    field.appendChild(frag);
  }

  var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  var W = 0, H = 0, DPR = 1, vx = 0, vy = 0, Rmax = 1, coreR = 1, SQUASH = 0.92;
  var parts = [], raf = 0, visible = true;

  function resize() {
    if (!ctx) return;
    var rect = root.getBoundingClientRect();
    W = rect.width; H = rect.height;
    if (W === 0 || H === 0) return;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    vx = W * 0.66; vy = H * 0.48;
    Rmax = Math.hypot(vx, H * 0.55) * 1.06;
    coreR = Math.min(W, H) * 0.05;
  }
  function spawn(p, atRim) {
    p.phi = Math.PI + (Math.random() * 2 - 1) * 1.5;
    p.r = atRim ? Rmax * rand(0.7, 1.06) : Rmax * Math.random();
    p.green = Math.random() < 0.20; p.w = rand(0.7, 1.7); p.spd = rand(0.6, 1.2);
  }
  function initParticles() {
    parts = [];
    var n = reduce ? 80 : 116;
    for (var i = 0; i < n; i++) { var p = {}; spawn(p, false); parts.push(p); }
  }
  function drawStreak(p) {
    var f = 1 - p.r / Rmax;
    var nr = p.r - (0.9 + f * f * 5.0) * p.spd;
    var c = Math.cos(p.phi), s = Math.sin(p.phi);
    var x1 = vx + c * p.r, y1 = vy + s * p.r * SQUASH;
    var x2 = vx + c * nr,  y2 = vy + s * nr * SQUASH;
    p.r = nr;
    if (p.r <= coreR) { spawn(p, true); return; }
    var edge = Math.min(1, (p.r - coreR) / (coreR * 2.2));
    var a = Math.max(0, Math.min(0.55, (0.10 + f * 1.0) * edge));
    ctx.strokeStyle = p.green ? 'rgba(11,184,112,' + a + ')' : 'rgba(120,122,132,' + (a * 0.8) + ')';
    ctx.lineWidth = p.w;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  function step() {
    if (!ctx || W === 0) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.075)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    for (var i = 0; i < parts.length; i++) drawStreak(parts[i]);
  }
  function loop() { step(); raf = requestAnimationFrame(loop); }
  function start() { if (!raf && visible) raf = requestAnimationFrame(loop); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  function staticFrame() {
    if (!ctx || W === 0) return;
    ctx.clearRect(0, 0, W, H); ctx.lineCap = 'round';
    for (var i = 0; i < parts.length; i++) { parts[i].r = Rmax * rand(0.12, 0.95); drawStreak(parts[i]); }
  }

  build();
  if (ctx) {
    resize(); initParticles();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(function () { resize(); if (reduce) staticFrame(); }).observe(root);
    } else {
      window.addEventListener('resize', function () { resize(); if (reduce) staticFrame(); });
    }
    if (reduce) { staticFrame(); }
    else if (typeof IntersectionObserver !== 'undefined') {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { visible = e.isIntersecting; if (visible) start(); else stop(); });
      }, { threshold: 0.01 }).observe(root);
    } else { start(); }
  }
})();

/* ---- */

/* HOW IT WORKS — interactive routing story.
   Pick a request (or auto-play); a token travels from the front door along
   the matching branch to its outcome, which lights up while a caption narrates. */
(function(){
  var root = document.querySelector('[data-cbx-router]');
  if(!root) return;
  var stage = root.querySelector('[data-router-stage]');
  var svg   = root.querySelector('[data-router-wires]');
  var door  = root.querySelector('[data-router-door] .cbx-r__door2-node');
  var token = root.querySelector('[data-router-token]');
  var pill  = root.querySelector('[data-router-pill]');
  var cap   = root.querySelector('[data-router-cap]');
  var picks = Array.prototype.slice.call(root.querySelectorAll('[data-req]'));
  var dests = {};
  root.querySelectorAll('[data-dest]').forEach(function(d){ dests[d.getAttribute('data-dest')] = d; });
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  var REQS = [
    {label:"What\u2019s our standard NDA policy?", dest:'self',  result:'answered instantly from the policy library, no ticket, no wait.'},
    {label:"Generate an MSA for a new vendor",      dest:'auto',  result:'drafted, approved, and returned by workflow, with no lawyer touching it.'},
    {label:"Review this $40M acquisition",          dest:'legal', result:'routed to the right counsel, fully triaged with context attached.'},
    {label:"Renew this supplier contract",          dest:'auto',  result:'ran through the renewal workflow automatically.'}
  ];
  var DNAME = {self:'Self-service', auto:'Automation', legal:'Legal review'};
  var DCOL  = {self:'#0BB870', auto:'#6B4BFF', legal:'#E5A93B'};
  var paths = {};

  function relPt(el, sx, sy){ // point at fractional (sx,sy) of el, relative to stage
    var r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
    return { x: r.left - s.left + r.width*sx, y: r.top - s.top + r.height*sy };
  }
  function buildWires(){
    var s = stage.getBoundingClientRect();
    svg.setAttribute('viewBox','0 0 '+s.width+' '+s.height);
    svg.setAttribute('width',s.width); svg.setAttribute('height',s.height);
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    var vertical = window.innerWidth <= 760;
    paths = {};
    ['self','auto','legal'].forEach(function(k){
      var a = vertical ? relPt(door,0.5,1) : relPt(door,1,0.5);
      var b = vertical ? relPt(dests[k],0.5,0) : relPt(dests[k],0,0.5);
      var d;
      if(vertical){ var my=(a.y+b.y)/2; d='M '+a.x+' '+a.y+' C '+a.x+' '+my+' '+b.x+' '+my+' '+b.x+' '+b.y; }
      else { var mx=(a.x+b.x)/2; d='M '+a.x+' '+a.y+' C '+mx+' '+a.y+' '+mx+' '+b.y+' '+b.x+' '+b.y; }
      var p = document.createElementNS(NS,'path');
      p.setAttribute('d',d); p.setAttribute('class','cbx-r__rwire'); p.setAttribute('stroke',DCOL[k]);
      svg.appendChild(p); paths[k]=p;
    });
  }

  var animating=false, rafId=0;
  function setActiveWire(k){
    ['self','auto','legal'].forEach(function(key){
      if(paths[key]) paths[key].setAttribute('data-active', key===k ? 'true':'false');
    });
  }
  function activateDest(k){
    for(var key in dests){ dests[key].setAttribute('data-on', key===k ? 'true':'false'); }
  }
  function setCap(req){
    cap.innerHTML = '<b>'+req.label+'</b> &rarr; <span class="to" style="color:'+DCOL[req.dest]+'">'+DNAME[req.dest]+'</span>: '+req.result;
  }
  function travel(req, cb){
    var p = paths[req.dest]; if(!p){ activateDest(req.dest); setCap(req); cb&&cb(); return; }
    setActiveWire(req.dest);
    pill.textContent = req.label;
    if(reduce){ activateDest(req.dest); setCap(req); cb&&cb(); return; }
    activateDest(null);
    var L = p.getTotalLength(), dur = 1150, start=null;
    if(rafId) cancelAnimationFrame(rafId);
    token.style.opacity = '1';
    function frame(ts){
      if(!start) start=ts;
      var t = Math.min(1,(ts-start)/dur);
      var e = t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
      var pos = p.getPointAtLength(e*L);
      token.style.transform = 'translate('+pos.x+'px,'+pos.y+'px)';
      if(t<1){ animating=true; rafId=requestAnimationFrame(frame); }
      else { animating=false; token.style.opacity='0'; activateDest(req.dest); setCap(req); cb&&cb(); }
    }
    rafId = requestAnimationFrame(frame);
  }

  var idx=0, timer=null;
  function select(i){
    idx = i;
    picks.forEach(function(b,j){ b.setAttribute('aria-pressed', j===i ? 'true':'false'); });
    travel(REQS[i]);
  }
  function next(){ if(animating) return; select((idx+1)%REQS.length); }
  function startAuto(){ stopAuto(); timer=setInterval(next, 3400); }
  function stopAuto(){ if(timer){ clearInterval(timer); timer=null; } }

  picks.forEach(function(b,i){
    b.addEventListener('click', function(){ stopAuto(); select(i); restartSoon(); });
  });
  var resumeT=null;
  function restartSoon(){ if(resumeT) clearTimeout(resumeT); resumeT=setTimeout(startAuto, 6000); }
  stage.addEventListener('pointerenter', stopAuto);
  stage.addEventListener('pointerleave', function(){ restartSoon(); });

  buildWires();
  // first render after layout settles
  requestAnimationFrame(function(){ buildWires(); select(0); });
  window.addEventListener('load', function(){ buildWires(); });
  if(typeof ResizeObserver !== 'undefined'){
    var rdebounce;
    new ResizeObserver(function(){ clearTimeout(rdebounce); rdebounce=setTimeout(buildWires, 120); }).observe(stage);
  } else { window.addEventListener('resize', buildWires); }

  if(typeof IntersectionObserver !== 'undefined'){
    new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ buildWires(); startAuto(); } else { stopAuto(); } });
    }, {threshold:0.25}).observe(root);
  } else { startAuto(); }
})();

/* ---- */

/* WHY NOW — animate the diverging chart when it scrolls into view (replays on re-entry) */
(function(){
  var why = document.querySelector('.cbx-r__why');
  if(!why) return;
  if(typeof IntersectionObserver === 'undefined'){ why.classList.add('is-in'); return; }
  new IntersectionObserver(function(entries){
    entries.forEach(function(e){ why.classList.toggle('is-in', e.isIntersecting); });
  }, {threshold:0.35}).observe(why);
})();

/* ---- */

/* INTEGRATIONS — draw dashed spokes from each app tile into the hub (desktop) */
(function(){
  var stage = document.querySelector('[data-intg]');
  if(!stage) return;
  var svg = stage.querySelector('[data-intg-wires]');
  var hub = stage.querySelector('[data-intg-hub] .cbx-r__intg-hub-node');
  var ics = Array.prototype.slice.call(stage.querySelectorAll('.cbx-r__intg-ic'));
  var NS = 'http://www.w3.org/2000/svg';
  function center(el){ var r=el.getBoundingClientRect(), s=stage.getBoundingClientRect(); return {x:r.left-s.left+r.width/2, y:r.top-s.top+r.height/2}; }
  function draw(){
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    if(window.innerWidth <= 720) return;
    var s = stage.getBoundingClientRect();
    svg.setAttribute('viewBox','0 0 '+s.width+' '+s.height);
    svg.setAttribute('width', s.width); svg.setAttribute('height', s.height);
    var h = center(hub);
    ics.forEach(function(ic){
      var c = center(ic);
      var dx = h.x - c.x, dy = h.y - c.y;
      var dist = Math.sqrt(dx*dx + dy*dy) || 1;
      var bow = dist * 0.16;                 // gentle orbital arc
      var mx = (c.x + h.x) / 2, my = (c.y + h.y) / 2;
      var cx = mx + (-dy / dist) * bow;      // control point offset perpendicular
      var cy = my + ( dx / dist) * bow;      // consistent direction = swirl around hub
      var p = document.createElementNS(NS,'path');
      p.setAttribute('d','M '+c.x+' '+c.y+' Q '+cx+' '+cy+' '+h.x+' '+h.y);
      p.setAttribute('class','cbx-r__intg-wire');
      svg.appendChild(p);
    });
  }
  draw();
  requestAnimationFrame(draw);
  window.addEventListener('load', draw);
  if(typeof ResizeObserver !== 'undefined'){ var t; new ResizeObserver(function(){ clearTimeout(t); t=setTimeout(draw,100); }).observe(stage); }
  else window.addEventListener('resize', draw);
})();

/* ---- */

/* Book a demo modal: open from any [data-cbx-demo], close on backdrop / X / Esc */
(function(){
  var modal = document.querySelector('[data-cbx-modal]');
  if(!modal) return;
  /* Portal to <body>: a transformed/containing ancestor (e.g. Webflow wrappers) would otherwise
     trap position:fixed, clipping the modal on mobile. Carry the cbx-r class so tokens/box-sizing/font still apply. */
  modal.classList.add('cbx-r');
  if(modal.parentNode !== document.body){ document.body.appendChild(modal); }
  function open(){ modal.setAttribute('data-open','true'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
  function close(){ modal.setAttribute('data-open','false'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  document.querySelectorAll('[data-cbx-demo]').forEach(function(b){ b.addEventListener('click', function(e){ e.preventDefault(); open(); }); });
  modal.addEventListener('click', function(e){ if(e.target === modal) close(); });
  modal.querySelectorAll('[data-cbx-modal-close]').forEach(function(b){ b.addEventListener('click', close); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') close(); });
})();

  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
