/* f1-extras.js — animações + página "Classificação" com atualização automática.
   Uso: adicione <script src="f1-extras.js" defer></script> antes de </body>.
   OBS: troca a imagem do carro da Racing Bulls no HTML original (variável `carros`),
   pois o site do ge.globo.com bloqueia acesso a suas imagens vindas de fora. */
(function () {
  'use strict';
  console.log('f1-extras v6 carregado');
  var API = 'https://api.jolpi.ca/ergast/f1/current';
  var LS = 'f1_standings_v1';
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- CSS ---------- */
  var css = [
    '@keyframes pageIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',
    '@keyframes heroUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}',
    '@keyframes drift{from{transform:translateX(0)}to{transform:translateX(-70px)}}',
    '@keyframes rowIn{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}',
    '@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(228,0,43,.6)}100%{box-shadow:0 0 0 10px rgba(228,0,43,0)}}',
    '@keyframes toastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}',
    '.page.active{animation:pageIn .45s ease}',
    '.page.active .hero-kicker,.page.active .hero h1,.page.active .hero p,.page.active .hero-actions{animation:heroUp .8s cubic-bezier(.2,.7,.2,1) both}',
    '.page.active .hero h1{animation-delay:.12s}.page.active .hero p{animation-delay:.24s}.page.active .hero-actions{animation-delay:.36s}',
    '.hero::before{animation:drift 14s ease-in-out infinite alternate}',
    '.nav-link{transition:color .15s ease,border-color .25s ease,transform .2s ease}.nav-link:hover{transform:translateY(-1px)}',
    '.btn{transition:transform .2s ease,background .2s ease,box-shadow .2s ease,border-color .2s ease}.btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(228,0,43,.25)}',
    '.card,.home-card,.driver-card{transition:background .2s ease,transform .3s ease,box-shadow .3s ease}',
    '.card:hover,.driver-card:hover,.home-card:hover{transform:translateY(-4px);box-shadow:0 14px 34px rgba(0,0,0,.45);z-index:2}',
    '.team-car{transition:transform .4s ease}.card:hover .team-car{transform:scale(1.04)}',
    '.rv{opacity:0;transform:translateY(24px);transition:opacity .7s ease var(--d,0ms),transform .7s cubic-bezier(.2,.7,.2,1) var(--d,0ms)}',
    '.rv.in{opacity:1;transform:none}',
    '.tabs{display:flex;gap:8px;margin-bottom:22px}',
    '.tab{font:600 .86rem Inter,sans-serif;color:var(--text-dim);background:transparent;border:1px solid var(--line-strong);padding:10px 20px;border-radius:2px;cursor:pointer;transition:all .2s ease}',
    '.tab:hover{color:#fff}.tab.active{background:var(--red);border-color:var(--red);color:#fff}',
    '.live{display:flex;align-items:center;gap:10px;margin-top:18px;font:.78rem JetBrains Mono,monospace;color:var(--text-dim)}',
    '.pulse{width:9px;height:9px;border-radius:50%;background:var(--red);flex-shrink:0;animation:pulse 1.6s ease-out infinite}',
    '.st-table td.nm{position:relative;border-left:3px solid var(--c);color:#fff;font-weight:600;white-space:nowrap}',
    '.st-table tr[style]{animation:rowIn .5s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i)*35ms)}',
    '.st-table tr[style]:hover td{background:var(--surface)}',
    '.bar{position:absolute;left:0;bottom:-1px;height:2px;width:0;background:var(--c);transition:width 1.1s cubic-bezier(.2,.8,.2,1) calc(var(--i)*40ms)}',
    '.st-note,.st-empty{color:var(--text-dimmer);font-size:.8rem;margin:0 0 80px}',
    '.toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:var(--red);color:#fff;padding:12px 20px;border-radius:3px;font-size:.88rem;font-weight:600;z-index:99;max-width:90vw;animation:toastIn .4s ease both;transition:opacity .5s}',
    '.toast.out{opacity:0}',
    'html.cc,html.cc *{cursor:none !important}',
    '.cc-car{position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;z-index:9999;opacity:0;transition:opacity .25s ease}',
    '.cc-rot{position:absolute;left:-11px;top:-22px;width:22px;height:44px}',
    '.cc-car svg{display:block;width:22px;height:44px;filter:drop-shadow(0 3px 5px rgba(0,0,0,.6));transition:transform .2s ease}',
    '.cc-car.hov svg{transform:scale(1.4)}',
    '.cc-car.down svg{transform:scale(.85)}',
    'html.cc-on .cc-car{opacity:1}',
    '.home-grid .home-card:last-child:nth-child(odd){grid-column:1/-1}',
    '#gcv{display:block;width:100%;max-width:none;margin:0 auto 16px;border:1px solid var(--line-strong);border-radius:6px;background:#14171b;touch-action:none;box-shadow:0 20px 50px rgba(0,0,0,.5)}',
    '#jogo .wrap{max-width:none}',
    '.gpad{display:none;gap:12px;max-width:420px;margin:0 auto 18px}',
    '@media (pointer:coarse){.gpad{display:flex}}',
    '.gpad button{flex:1;font-size:1.6rem;padding:16px;background:var(--surface);color:#fff;border:1px solid var(--line-strong);border-radius:6px;touch-action:none;user-select:none}',
    '.gpad button:active{background:var(--red)}',
    '#jogo .st-note{text-align:center}',
    '#jogo .page-head{padding:14px 0 10px;margin-bottom:10px}',
    '#jogo .page-head p{display:none}',
    '#jogo .page-head .kicker{margin-bottom:4px}',
    '#jogo .page-head h1{font-size:1.5rem}',
    '#jogo .wrap{padding:0 10px}',
    '#gstart{margin:0 0 8px}',
    '@keyframes msgIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',
    '@keyframes dotB{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-4px)}}',
    '.chat{max-width:760px;margin:0 auto 80px}',
    '.chat-log{height:min(460px,60vh);overflow-y:auto;border:1px solid var(--line-strong);background:var(--bg-elev);padding:18px;display:flex;flex-direction:column;gap:12px;border-radius:4px}',
    '.msg{max-width:86%;padding:11px 15px;border-radius:12px;font-size:.92rem;line-height:1.5;animation:msgIn .35s ease both;overflow-wrap:anywhere}',
    '.msg.u{align-self:flex-end;background:var(--red);color:#fff;border-bottom-right-radius:3px}',
    '.msg.b{align-self:flex-start;background:var(--surface-2);color:var(--text);border-bottom-left-radius:3px}',
    '.msg small{display:block;margin-top:7px;font:.68rem JetBrains Mono,monospace;color:var(--text-dimmer)}',
    '.dots i{display:inline-block;width:6px;height:6px;margin:0 2px;border-radius:50%;background:var(--text-dim);animation:dotB 1s infinite}',
    '.dots i:nth-child(2){animation-delay:.15s}.dots i:nth-child(3){animation-delay:.3s}',
    '.chips{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}',
    '.chip{font:500 .8rem Inter,sans-serif;color:var(--text-dim);background:transparent;border:1px solid var(--line-strong);padding:7px 13px;border-radius:99px;cursor:pointer;transition:all .2s ease}',
    '.chip:hover{color:#fff;border-color:var(--red);transform:translateY(-2px)}',
    '.chat-form{display:flex;gap:8px}',
    '.chat-form input[type=text]{flex:1;min-width:0;background:var(--bg-elev);border:1px solid var(--line-strong);color:#fff;padding:13px 15px;font:.92rem Inter,sans-serif;border-radius:3px;outline:none;transition:border-color .2s ease}',
    '.chat-form input[type=text]:focus{border-color:var(--gold)}',
    '.chat-opt{display:flex;align-items:flex-start;gap:8px;margin:14px 0 10px;font-size:.8rem;color:var(--text-dim)}'
  ].join('\n');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- Fotos oficiais dos carros (Racing Bulls e Audi) ----------
     Os links de matérias de notícia (ex.: ge.globo.com) bloqueiam carregamento
     vindo de outros sites, então a imagem não apareceria. Uso fotos oficiais
     das próprias equipes no lugar. */
  var carSwap = {
    'racing bulls': { src: 'https://img.redbull.com/images/q_auto,f_auto/redbullcom/2026/1/16/zhrqfxwxq0l24jdmmqlw/vcarb-2026-live-launch-detroit', alt: 'Carro Racing Bulls VCARB 2026' },
    'audi': { src: 'https://media.formula1.com/image/upload/c_fit,w_3200,h_1800/q_auto/v1740000001/fom-website/2026/Audi/16x9%20single%20image%20(41).webp', alt: 'Carro Audi R26 2026' }
  };
  document.querySelectorAll('#carros-grid .card, #carros-grid .team-card').forEach(function (c) {
    var h = c.querySelector('h3'), key = h && Object.keys(carSwap).filter(function (k) { return new RegExp(k, 'i').test(h.textContent); })[0];
    if (!key) return;
    var img = c.querySelector('.team-car');
    if (img) { img.src = carSwap[key].src; img.alt = carSwap[key].alt; }
  });

  /* ---------- Link no menu, card na home e página ---------- */
  var a = document.createElement('a');
  a.className = 'nav-link'; a.dataset.page = 'classificacao'; a.href = '#classificacao'; a.textContent = 'Classificação';
  $('.nav-links').appendChild(a);

  var hc = document.createElement('a');
  hc.className = 'home-card'; hc.href = '#classificacao'; hc.dataset.page = 'classificacao';
  hc.innerHTML = '<div class="num">06</div><h3>Classificação</h3><p>Pontuação de pilotos e construtores, atualizada automaticamente após cada corrida.</p>';
  $('.home-grid').appendChild(hc);

  [a, hc].forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); history.replaceState(null, '', '#classificacao'); showPage('classificacao'); });
  });

  var main = document.createElement('main');
  main.id = 'classificacao'; main.className = 'page';
  main.innerHTML =
    '<div class="page-head wrap"><div class="kicker">TEMPORADA <span id="st-season">2026</span></div><h1>Classificação</h1>' +
    '<p>Campeonatos de pilotos e de construtores, atualizados automaticamente sempre que uma corrida termina.</p>' +
    '<div class="live"><span class="pulse"></span><span id="st-status">Carregando…</span></div></div>' +
    '<div class="wrap"><div class="tabs"><button class="tab active" data-t="d">Pilotos</button><button class="tab" data-t="c">Construtores</button></div>' +
    '<div id="st-body"></div><p class="st-note">Fonte: Jolpica F1 API. Verificação a cada 30 min e a cada 2 min durante a janela da corrida.</p></div>';
  $('footer').before(main);
  if (location.hash === '#classificacao') showPage('classificacao');

  /* ---------- Revelar ao rolar + contadores ---------- */
  function count(el) {
    var to = parseInt(el.textContent, 10); if (!to || rm) return;
    var t0 = performance.now();
    (function f(t) { var p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in'); io.unobserve(e.target);
      if (e.target.classList.contains('stat')) count(e.target.querySelector('.n'));
    });
  }, { threshold: 0.08 }) : null;
  document.querySelectorAll('.card,.home-card,.driver-card,.team-group-head,.reg-block,.stat,.callout').forEach(function (el) {
    el.classList.add('rv');
    el.style.setProperty('--d', Math.min([].indexOf.call(el.parentNode.children, el), 8) * 60 + 'ms');
    el.addEventListener('transitionend', function (e) { if (e.target === el && el.classList.contains('in')) el.classList.remove('rv', 'in'); });
    if (io) io.observe(el); else el.classList.add('in');
  });

  /* ---------- Cursor em forma de carro (só com mouse; some em telas de toque) ---------- */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var root = document.documentElement;
    var car = document.createElement('div');
    car.className = 'cc-car';
    car.innerHTML = '<div class="cc-rot">' +
      '<svg viewBox="0 0 24 48" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="1" y="1" width="22" height="3" rx="1" fill="#ecece7"/>' +
      '<rect x="7" y="11" width="10" height="1.6" fill="#888"/><rect x="7" y="34" width="10" height="1.6" fill="#888"/>' +
      '<g fill="#111" stroke="#666" stroke-width=".6"><rect x="2" y="7" width="5" height="10" rx="1.5"/><rect x="17" y="7" width="5" height="10" rx="1.5"/>' +
      '<rect x="1.5" y="30" width="5.5" height="11" rx="1.5"/><rect x="17" y="30" width="5.5" height="11" rx="1.5"/></g>' +
      '<path d="M12 3 L14.5 14 L14.5 30 L16 42 L8 42 L9.5 30 L9.5 14 Z" fill="#e4002b"/>' +
      '<rect x="4" y="43" width="16" height="4" rx="1" fill="#e4002b" stroke="#8f0f24" stroke-width=".5"/>' +
      '<circle cx="12" cy="26" r="2.6" fill="#1b1f24" stroke="#d4a93c" stroke-width=".8"/></svg>' + '</div>';
    document.body.appendChild(car);
    var rot = car.firstChild;
    root.classList.add('cc');
    var mx = 0, my = 0, cx = 0, cy = 0, ang = 0, tgt = 0, first = true, k = rm ? 1 : 0.2;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (first) { cx = mx; cy = my; first = false; }
      root.classList.add('cc-on');
      car.classList.toggle('hov', !!(e.target.closest && e.target.closest('a,button,.card,.home-card,.driver-card,.tab')));
    });
    document.addEventListener('mousedown', function () { car.classList.add('down'); });
    document.addEventListener('mouseup', function () { car.classList.remove('down'); });
    root.addEventListener('mouseleave', function () { root.classList.remove('cc-on'); });
    root.addEventListener('mouseenter', function () { root.classList.add('cc-on'); });
    (function f() {
      var px = cx, py = cy;
      cx += (mx - cx) * k; cy += (my - cy) * k;
      var dx = cx - px, dy = cy - py;
      if (Math.hypot(dx, dy) > 0.8) tgt = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      var d = ((tgt - ang) % 360 + 540) % 360 - 180;
      ang += rm ? d : d * 0.18;
      car.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      rot.style.transform = 'rotate(' + ang + 'deg)';
      requestAnimationFrame(f);
    })();
  }

  /* ---------- Classificação ---------- */
  var cols = [[/ferrari/, '#E80020'], [/mclaren/, '#F47600'], [/mercedes/, '#27F4D2'], [/red bull/, '#4781D7'], [/williams/, '#1868DB'], [/aston/, '#229971'], [/alpine/, '#00A1E8'], [/haas/, '#9C9FA2'], [/racing bulls|^rb/, '#6C98FF'], [/audi|sauber/, '#B0B7C3'], [/cadillac/, '#B8860B']];
  function color(n) { n = (n || '').toLowerCase(); var m = cols.filter(function (c) { return c[0].test(n); })[0]; return m ? m[1] : '#666e77'; }

  var data = null, tab = 'd', nextRace = null, lastCheck = null;
  try { data = JSON.parse(localStorage.getItem(LS)); } catch (e) {}

  function j(u) { return fetch(API + u).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }

  function render() {
    var body = $('#st-body');
    if (!data) { body.innerHTML = '<p class="st-empty">Aguardando dados da temporada…</p>'; return; }
    var isD = tab === 'd', rows = isD ? data.d : data.c;
    var max = Math.max.apply(null, rows.map(function (r) { return r.pts; }).concat(1));
    var html = rows.map(function (r, i) {
      return '<tr style="--i:' + i + ';--c:' + color(isD ? r.team : r.name) + '"><td class="n">' + esc(r.pos) + '</td>' +
        '<td class="nm">' + esc(r.name) + '<i class="bar" data-w="' + (r.pts / max * 100).toFixed(1) + '"></i></td>' +
        (isD ? '<td>' + esc(r.team) + '</td>' : '') +
        '<td class="n">' + r.wins + '</td><td class="n">' + r.pts + '</td></tr>';
    }).join('');
    body.innerHTML = '<div class="table-scroll"><table class="st-table"><tr><th>POS</th><th>' + (isD ? 'PILOTO' : 'EQUIPE') + '</th>' +
      (isD ? '<th>EQUIPE</th>' : '') + '<th>VITÓRIAS</th><th>PONTOS</th></tr>' + html + '</table></div>';
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      body.querySelectorAll('.bar').forEach(function (b) { b.style.width = b.dataset.w + '%'; });
    }); });
  }

  function status(err) {
    var el = $('#st-status');
    if (!data) { el.textContent = err ? 'Não foi possível carregar agora. Tentando novamente em breve…' : 'Carregando…'; return; }
    $('#st-season').textContent = data.season;
    var t = (err ? 'Sem conexão, exibindo dados salvos · ' : '') + 'Após ' + (data.race || 'a rodada ' + data.round) + ' (rodada ' + data.round + ')';
    if (nextRace) t += ' · Próximo: ' + nextRace.name + ', ' + new Date(nextRace.start).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    if (lastCheck && !err) t += ' · verificado às ' + lastCheck.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    el.textContent = t;
  }

  function toast(m) {
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t);
    setTimeout(function () { t.classList.add('out'); }, 5000); setTimeout(function () { t.remove(); }, 5600);
  }

  function fetchStandings() {
    return Promise.all([j('/driverstandings.json'), j('/constructorstandings.json')]).then(function (r) {
      var dl = r[0].MRData.StandingsTable.StandingsLists[0], cl = r[1].MRData.StandingsTable.StandingsLists[0];
      if (!dl || !cl) throw new Error('sem dados');
      return j('/' + dl.round + '.json').then(function (x) { return x.MRData.RaceTable.Races[0].raceName; }, function () { return ''; }).then(function (race) {
        return {
          season: dl.season, round: +dl.round, race: race,
          d: dl.DriverStandings.map(function (x) { var c = x.Constructors[x.Constructors.length - 1]; return { pos: x.positionText || x.position, name: x.Driver.givenName + ' ' + x.Driver.familyName, team: c ? c.name : '', wins: +x.wins, pts: parseFloat(x.points) }; }),
          c: cl.ConstructorStandings.map(function (x) { return { pos: x.positionText || x.position, name: x.Constructor.name, wins: +x.wins, pts: parseFloat(x.points) }; })
        };
      });
    });
  }

  function refresh() {
    return fetchStandings().then(function (n) {
      var key = function (o) { return o ? JSON.stringify([o.round, o.d, o.c]) : ''; };
      var changed = key(n) !== key(data), isNew = data && n.round !== data.round;
      data = n; lastCheck = new Date();
      try { localStorage.setItem(LS, JSON.stringify(n)); } catch (e) {}
      if (changed) render();
      if (isNew) toast('Classificação atualizada após o ' + (n.race || 'GP da rodada ' + n.round));
      status();
    }).catch(function () { status(true); });
  }

  function loadNext() {
    return j('/next.json').then(function (x) {
      var r = x.MRData.RaceTable.Races[0];
      nextRace = r ? { start: new Date(r.date + 'T' + (r.time || '14:00:00Z')).getTime(), name: r.raceName } : null;
    }).catch(function () {});
  }

  /* Durante a janela da corrida (30 min antes até 5 h depois) checa a cada 2 min; fora dela, a cada 30 min. */
  function delay() {
    var now = Date.now();
    if (nextRace) {
      var s = nextRace.start;
      if (now >= s - 30 * 60e3 && now <= s + 5 * 36e5) return 120e3;
      if (now > s + 5 * 36e5) loadNext();
    }
    return 30 * 60e3;
  }
  function loop() {
    setTimeout(function () { (document.hidden ? Promise.resolve() : refresh()).then(function () { status(); loop(); }); }, delay());
  }

  document.querySelectorAll('.tab').forEach(function (b) {
    b.addEventListener('click', function () {
      tab = b.dataset.t;
      document.querySelectorAll('.tab').forEach(function (x) { x.classList.toggle('active', x === b); });
      render();
    });
  });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && (!lastCheck || Date.now() - lastCheck > 120e3)) refresh();
  });

  /* ---------- Página "Pergunte à IA" (dúvidas sobre F1, grátis) ---------- */
  (function () {
    var link = document.createElement('a');
    link.className = 'nav-link'; link.dataset.page = 'pergunte'; link.href = '#pergunte'; link.textContent = 'Pergunte à IA';
    $('.nav-links').appendChild(link);
    var card = document.createElement('a');
    card.className = 'home-card'; card.href = '#pergunte'; card.dataset.page = 'pergunte';
    card.innerHTML = '<div class="num">07</div><h3>Pergunte à IA</h3><p>Tire dúvidas sobre regras, pilotos, equipes e pistas. Grátis e sem cadastro.</p>';
    $('.home-grid').appendChild(card);
    [link, card].forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); history.replaceState(null, '', '#pergunte'); showPage('pergunte'); });
    });
    var pg = document.createElement('main');
    pg.id = 'pergunte'; pg.className = 'page';
    pg.innerHTML = '<div class="page-head wrap"><div class="kicker">ASSISTENTE</div><h1>Pergunte sobre F1</h1>' +
      '<p>Tire dúvidas sobre regras, pilotos, equipes, circuitos e a classificação. Gratuito e sem cadastro.</p></div>' +
      '<div class="wrap"><div class="chat"><div class="chat-log" id="pg-log"></div><div class="chips" id="pg-chips"></div>' +
      '<form class="chat-form" id="pg-form" autocomplete="off"><input type="text" id="pg-in" placeholder="Ex.: O que é o parc fermé?" maxlength="300" aria-label="Sua pergunta">' +
      '<button class="btn btn-primary" type="submit">Enviar</button></form>' +
      '<label class="chat-opt"><input type="checkbox" id="pg-ai" checked><span>Usar IA online gratuita (Pollinations). Desmarque para responder só com a base do site, direto no seu navegador, sem enviar nada para fora.</span></label>' +
      '<p class="st-note">A IA gratuita pode errar ou ficar indisponível; nesse caso o assistente usa a base do site. Para fatos recentes, confira nas páginas do site.</p></div></div>';
    $('footer').before(pg);
    if (location.hash === '#pergunte') showPage('pergunte');

    var log = $('#pg-log'), input = $('#pg-in'), hist = [], busy = false;
    var STOP = ' que qual quais como quem por para com sobre foi sao ser tem fale mim formula fala explique explica ola oi me ' ;
    var AL = [[/pontua|ponto/, 'pontos sistema'], [/puni|penal|castig|multa/, 'penalidades parc'], [/motor|hibrid|power/, 'power unit'],
      [/2026|mudan|novidade/, 'nova era 2026'], [/bandeira|safety|vsc/, 'bandeiras safety'], [/pneu|combustivel/, 'pneus combustivel'],
      [/teto|orcamento|cost/, 'orcamento cost cap'], [/sprint|treino|qualifica/, 'fim de semana formato'],
      [/asa|aerodinamica|efeito solo|chassi/, 'chassi aerodinamica'], [/largada|drs|parada|box/, 'largada corrida drs']];
    function norm(t) { return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
    function stem(w) { return w.length > 4 ? w.replace(/(coes|soes|goes)$/, 'cao').replace(/oes$/, 'ao').replace(/ns$/, 'm').replace(/is$/, 'l').replace(/res$/, 'r').replace(/s$/, '') : w; }
    function toks(t) { return norm(t).split(/[^a-z0-9]+/).filter(function (w) { return w.length > 2 && STOP.indexOf(' ' + w + ' ') < 0; }).map(stem); }
    function cut(t, n) { return t.length > n ? t.slice(0, n).replace(/\s\S*$/, '') + '…' : t; }

    var FAQ = [
      { t: 'DRS', k: 'drs asa movel arrasto', m: 'DRS (Drag Reduction System) é a asa traseira móvel que reduz o arrasto do carro para facilitar ultrapassagens. Só pode ser usada em zonas demarcadas da pista, por um carro a menos de 1s do carro à frente, e não nas primeiras voltas nem sob bandeira amarela ou safety car.' },
      { t: 'Pole position', k: 'pole position primeiro lugar grid', m: 'Pole position é a primeira posição no grid de largada, conquistada por quem faz a volta mais rápida na Q3 da classificação. Larga na frente de todos os outros carros.' },
      { t: 'Undercut e overcut', k: 'undercut overcut estrategia parada', m: 'Undercut é parar nos boxes antes do rival para ganhar tempo em pneus novos antes dele. Overcut é o oposto: ficar mais voltas na pista com pneu gasto na esperança de que o ar limpo compense a parada tardia.' },
      { t: 'Box / pit stop', k: 'box pit stop parada boxes troca pneu', m: 'Box (ou pit stop) é a parada do carro na garagem durante a corrida para trocar pneus ou fazer ajustes. Nas equipes de ponta, uma troca de pneus leva cerca de 2 segundos.' },
      { t: 'Pódio', k: 'podio top 3 champagne', m: 'O pódio é a cerimônia após a corrida com os três primeiros colocados, que recebem troféus e comemoram com champanhe (ou bebida alternativa, dependendo do país por questões religiosas).' },
      { t: 'Abandono / DNF', k: 'abandono dnf desistencia quebra', m: 'DNF (Did Not Finish) é quando um piloto abandona a corrida, seja por problema mecânico, acidente ou decisão da equipe. O carro não completa a distância total da prova.' },
      { t: 'Chicane', k: 'chicane curva dupla', m: 'Chicane é uma sequência de duas curvas rápidas em sentidos opostos, geralmente usada para reduzir a velocidade em um trecho de pista por segurança.' },
      { t: 'Downforce', k: 'downforce carga aerodinamica', m: 'Downforce é a força aerodinâmica que empurra o carro contra o chão, gerada pelas asas e pelo efeito solo. Quanto mais downforce, mais grip nas curvas, mas mais arrasto nas retas.' },
      { t: 'Grid de largada', k: 'grid largada ordem carros', m: 'O grid de largada é a ordem em que os carros se posicionam para o início da corrida, definida pelo resultado da classificação do sábado (ou da sprint qualifying, em fins de semana sprint).' },
      { t: 'Halo', k: 'halo protecao capacete cabeca', m: 'O Halo é a estrutura de titânio acima do cockpit que protege a cabeça do piloto contra impactos e detritos. Foi introduzido em 2018 e é considerado um dos maiores avanços de segurança da F1 moderna.' },
      { t: 'Muro dos boxes / pit wall', k: 'muro boxes pit wall engenheiros', m: 'O muro dos boxes (pit wall) é onde ficam o chefe de equipe e os engenheiros durante a corrida, acompanhando dados e se comunicando por rádio com os pilotos.' },
      { t: 'Voltas de formação e reconhecimento', k: 'volta formacao reconhecimento aquecer pneu', m: 'A volta de formação acontece antes da largada: os carros saem da boxes, fazem uma volta completa aquecendo pneus e freios, e se posicionam no grid para o início oficial da corrida.' },
      { t: 'Números dos carros', k: 'numero carro permanente escolha', m: 'Desde 2014 cada piloto escolhe um número fixo (de 2 a 99) para usar durante toda a carreira na F1. O número 1 é reservado ao atual campeão mundial, caso ele opte por usá-lo.' },
      { t: 'O que significa F1', k: 'significado f1 sigla formula um', m: '"F1" é a abreviação de Fórmula 1 (Fórmula Um), nome que vem da categoria de regulamento técnico mais alta do automobilismo com monopostos (carros de um só assento e rodas expostas), a "fórmula" nº 1.' },
      { t: 'Recordes de títulos', k: 'recorde titulos mais campeao historia michael schumacher lewis hamilton', m: 'Michael Schumacher e Lewis Hamilton dividem o recorde de 7 títulos mundiais de pilotos cada. Schumacher também detém o recorde de títulos consecutivos (5, entre 2000 e 2004) pela Ferrari.' },
      { t: 'Ayrton Senna', k: 'ayrton senna tricampeao brasileiro lenda', m: 'Ayrton Senna foi tricampeão mundial (1988, 1990 e 1991) pela McLaren e é considerado um dos maiores pilotos da história da F1. Morreu em um acidente em Ímola, durante o GP de San Marino de 1994, correndo pela Williams.' },
      { t: 'Primeira temporada da F1', k: 'primeira temporada historia 1950 inicio', m: 'O Campeonato Mundial de Fórmula 1 começou em 1950, com a primeira corrida disputada em Silverstone, no Reino Unido, vencida por Giuseppe Farina pela Alfa Romeo.' },
      { t: 'Maior campeão de construtores', k: 'ferrari mais titulos construtores historia', m: 'A Ferrari é a construtora mais vitoriosa da história da F1, com 16 títulos de construtores, e a única equipe presente em todas as temporadas desde 1950.' },
      { t: 'Compostos de pneu', k: 'composto pneu macio medio duro c1 c6 cor', m: 'A Pirelli oferece pneus slick de C1 (mais duro) a C6 (mais macio). Em cada corrida, o macio tem marcação vermelha, o médio amarela e o duro branca, entre os três compostos escolhidos para aquele fim de semana.' },
      { t: 'Bandeira amarela x azul', k: 'bandeira azul ceder passagem retardatario', m: 'A bandeira azul é usada para avisar um piloto retardatário (uma ou mais voltas atrás) que precisa ceder passagem a um carro mais rápido se aproximando por trás.' }
    ];
    FAQ.forEach(function (o) { o.kn = norm(o.k); o.mn = norm(o.m); o.x = o.m; o.pri = 0; });

    function docs() {
      var d = FAQ.slice();
      if (typeof grid2026 !== 'undefined') grid2026.forEach(function (g) {
        g.pilotos.forEach(function (p) { d.push({ t: p.nome, k: p.nome + ' ' + g.equipe, m: p.bio, x: p.nome + ' (' + g.equipe + ', ' + p.nat.replace(/^\S+\s/, '') + '): ' + p.bio, pri: 1 }); });
      });
      if (typeof equipes !== 'undefined') equipes.forEach(function (e) {
        d.push({ t: e.nome, k: e.nome, m: e.desc, x: e.nome + ': ' + e.desc + ' Fundação: ' + e.fundacao + ' · Estreia na F1: ' + e.estreia + ' · Títulos: ' + e.titulos + '.', pri: 1 });
      });
      if (typeof pistas !== 'undefined') pistas.forEach(function (p) {
        d.push({ t: p.nome, k: p.nome + ' ' + p.pais, m: p.desc, x: p.nome + ' (' + p.pais + '): ' + p.desc + ' Extensão: ' + p.ext + ' · ' + p.voltas + ' voltas · estreia em ' + p.estreia + '.', pri: 1 });
      });
      document.querySelectorAll('#regulamento .reg-block').forEach(function (b) {
        var h = b.querySelector('h2'), t = h ? h.textContent : '', body = b.textContent.replace(/\s+/g, ' ').replace(/^\s*\d+\s*/, '').replace(t, '').trim();
        d.push({ t: t, k: t, m: body, x: t + ': ' + cut(body, 650), pri: 1 });
      });
      d.forEach(function (o) { o.kn = norm(o.k); o.mn = norm(o.m); });
      return d;
    }

    function local(q) {
      var n = norm(q);
      if (/^(oi|ola|e ai|bom dia|boa tarde|boa noite)\b/.test(n)) return 'Olá! Pergunte sobre regras, pilotos, equipes, pistas ou a classificação. As sugestões acima ajudam a começar.';
      if (/quem (lidera|esta|ta)|lider|tabela|ranking|campeonato (atual|de pilotos|de construtores)|classificacao (atual|geral|do campeonato)/.test(n)) {
        if (data && data.d) return 'Classificação de pilotos após o ' + (data.race || 'GP da rodada ' + data.round) + ':\n' +
          data.d.slice(0, 5).map(function (r) { return r.pos + '. ' + r.name + ' — ' + r.pts + ' pts'; }).join('\n') + '\nA tabela completa está na página Classificação.';
        return 'Ainda não consegui carregar a classificação. Abra a página Classificação para ver a tabela atualizada.';
      }
      var tk = toks(q);
      AL.forEach(function (a) { if (a[0].test(n)) tk = tk.concat(a[1].split(' ')); });
      if (!tk.length) return 'Pode reformular a pergunta? Tente algo como "O que é o DRS?" ou "Fale sobre a Ferrari".';
      var r = docs();
      r.forEach(function (o) {
        o.s = 0;
        tk.forEach(function (w) {
          if (o.kn.indexOf(w) > -1) o.s += 3;
          else if (o.mn.indexOf(w) > -1) o.s += 1;
          else if (w.length > 4 && (o.kn.indexOf(w.slice(0, -1)) > -1 || o.mn.indexOf(w.slice(0, -1)) > -1)) o.s += 1;
        });
      });
      r.sort(function (a, b) { return b.s - a.s || b.pri - a.pri; });
      if (!r.length || r[0].s <= 0) return 'Não encontrei nada relacionado a isso na base do site. Tente perguntar sobre pilotos (ex.: "Quem é Lando Norris?"), equipes, pistas, regras (ex.: "O que é o DRS?") ou termos do automobilismo.';
      var out = r[0].x;
      if (r[0].s < 3) out = 'Não tenho certeza, mas o mais próximo que encontrei foi:\n\n' + out;
      if (r[1] && r[1].s >= 3 && r[1].s >= r[0].s * 0.7) out += '\n\nVeja também: ' + r[1].t + '.';
      return out;
    }

    function ctx() {
      var t = [];
      try {
        if (typeof grid2026 !== 'undefined') t.push('GRID 2026: ' + grid2026.map(function (g) { return g.equipe + ' (' + g.pilotos.map(function (p) { return p.nome; }).join(', ') + ')'; }).join('; '));
        if (typeof equipes !== 'undefined') t.push('EQUIPES: ' + equipes.map(function (e) { return e.nome + ' (fundada em ' + e.fundacao + ', títulos: ' + e.titulos + ')'; }).join('; '));
        if (typeof pistas !== 'undefined') t.push('PISTAS: ' + pistas.map(function (p) { return p.nome + ' (' + p.pais + ')'; }).join('; '));
        document.querySelectorAll('#regulamento .reg-block').forEach(function (b) { t.push('REGRA: ' + cut(b.textContent.replace(/\s+/g, ' ').trim(), 500)); });
        if (data && data.d) t.push('CLASSIFICAÇÃO ATUAL (' + (data.race || 'rodada ' + data.round) + '): ' + data.d.slice(0, 10).map(function (r) { return r.pos + '. ' + r.name + ' ' + r.pts + ' pts'; }).join('; '));
      } catch (e) {}
      return t.join('\n').slice(0, 9500);
    }

    var AI_MODELS = ['openai', 'openai-fast', 'mistral', 'qwen-coder'];
    function askOne(model, sys) {
      var ctl = new AbortController(), to = setTimeout(function () { ctl.abort(); }, 15000);
      return fetch('https://text.pollinations.ai/openai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal,
        body: JSON.stringify({ model: model, temperature: 0.4, messages: [{ role: 'system', content: sys }].concat(hist.slice(-6)) })
      }).then(function (r) { clearTimeout(to); if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (j) {
          var t = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
          if (!t || (t.length < 400 && /credit|pollen|rate.?limit|too many|api key|unauthor|deprecat|quota/i.test(t))) throw new Error('indisponível');
          return t;
        }, function (e) { clearTimeout(to); throw e; });
    }
    // Tenta uma lista de modelos gratuitos, em sequência, até um responder — o plano
    // grátis da Pollinations às vezes limita ou tira modelos do ar sem aviso.
    function askAI() {
      var sys = 'Você é um assistente de Fórmula 1 em português do Brasil. Responda de forma clara e direta (até uns 120 palavras) e só sobre F1. Use o CONTEXTO quando ajudar; se a pergunta não tiver relação com F1 ou você não souber com certeza, diga isso brevemente em vez de inventar.\n\nCONTEXTO:\n' + ctx();
      var i = 0;
      function next() {
        if (i >= AI_MODELS.length) return Promise.reject(new Error('todos os modelos falharam'));
        var m = AI_MODELS[i++];
        return askOne(m, sys).catch(function (e) { return next(); });
      }
      return next();
    }

    function fmt(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/^[-*] /gm, '• ').replace(/\n/g, '<br>'); }
    function add(cls, html, note) {
      var m = document.createElement('div'); m.className = 'msg ' + cls; m.innerHTML = html;
      if (note) { var sm = document.createElement('small'); sm.textContent = note; m.appendChild(sm); }
      log.appendChild(m); log.scrollTop = log.scrollHeight; return m;
    }
    function done(w, t, src) {
      w.innerHTML = fmt(t); var sm = document.createElement('small'); sm.textContent = src; w.appendChild(sm);
      hist.push({ role: 'assistant', content: t }); busy = false; log.scrollTop = log.scrollHeight;
    }
    function send(q) {
      q = q.trim(); if (!q || busy) return;
      busy = true; input.value = '';
      add('u', esc(q)); hist.push({ role: 'user', content: q });
      var w = add('b', '<span class="dots"><i></i><i></i><i></i></span>');
      if (!$('#pg-ai').checked) { setTimeout(function () { done(w, local(q), 'Base do site (no seu navegador)'); }, 350); return; }
      askAI().then(function (t) { done(w, t, 'IA online gratuita (Pollinations)'); })
        .catch(function () { done(w, local(q), 'Base do site · a IA online não respondeu agora'); });
    }

    $('#pg-form').addEventListener('submit', function (e) { e.preventDefault(); send(input.value); });
    ['Como funciona a pontuação?', 'O que é o parc fermé?', 'O que muda em 2026?', 'Quem é Lando Norris?', 'Fale sobre Interlagos', 'Quem lidera o campeonato?'].forEach(function (t) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = t;
      b.addEventListener('click', function () { send(t); }); $('#pg-chips').appendChild(b);
    });
    add('b', 'Olá! Sou o assistente de F1 do site. Pergunte sobre regras, pilotos, equipes, pistas ou a classificação.');
  })();

  /* ---------- Mini jogo: Desvie dos Carros (estrada com faixas, tráfego vindo de frente) ---------- */
  var ga = document.createElement('a');
  ga.className = 'nav-link'; ga.dataset.page = 'jogo'; ga.href = '#jogo'; ga.textContent = 'Jogo';
  $('.nav-links').appendChild(ga);
  var gcard = document.createElement('a');
  gcard.className = 'home-card'; gcard.href = '#jogo'; gcard.dataset.page = 'jogo';
  gcard.innerHTML = '<div class="num">08</div><h3>Mini jogo</h3><p>Desvie do tráfego e sobreviva o máximo de tempo possível — a velocidade só aumenta.</p>';
  $('.home-grid').appendChild(gcard);
  [ga, gcard].forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); history.replaceState(null, '', '#jogo'); showPage('jogo'); });
  });
  var gm = document.createElement('main');
  gm.id = 'jogo'; gm.className = 'page';
  gm.innerHTML = '<div class="page-head wrap"><div class="kicker">MINI JOGO</div><h1>Desvie dos Carros</h1>' +
    '<p>Troque de faixa para desviar do tráfego que vem na sua direção. A velocidade aumenta com o tempo — bata uma vez e acabou.</p></div>' +
    '<div class="wrap"><canvas id="gcv" width="380" height="620"></canvas>' +
    '<div style="text-align:center;margin:0 0 8px"><button class="btn btn-primary" id="gstart">▶ COMEÇAR / REINICIAR</button></div>' +
    '<div class="gpad"><button id="gl" aria-label="Esquerda">◀</button><button id="gr" aria-label="Direita">▶</button></div>' +
    '<p class="st-note">Teclado: ← → ou A D para trocar de faixa · Espaço para começar · Celular: toque nos lados ou nos botões · f1-extras v8</p></div>';
  $('footer').before(gm);
  if (location.hash === '#jogo') showPage('jogo');

  var cv = $('#gcv'), g = cv.getContext('2d'), W = 380, H = 620;

  /* Faz o canvas ocupar toda a área disponível da página: a largura inteira do
     conteúdo e a altura entre o topo do canvas e os controles abaixo dele
     (botão, gamepad em telas de toque e a nota de instruções). */
  function sizeCanvas() {
    cv.style.height = ''; // deixa a largura ser 100% do container antes de medir
    var w = cv.getBoundingClientRect().width || (window.innerWidth - 32);

    var startBtn = $('#gstart'), gpad = document.querySelector('.gpad'), note = gm.querySelector('.st-note');
    var below = 0;
    if (startBtn) below += startBtn.getBoundingClientRect().height + 16;
    if (gpad && getComputedStyle(gpad).display !== 'none') below += gpad.getBoundingClientRect().height + 18;
    if (note) below += note.getBoundingClientRect().height + 10;
    below += 16; // respiro inferior da página

    var top = cv.getBoundingClientRect().top || 0;
    var h = Math.max(320, window.innerHeight - top - below);

    cv.style.width = Math.round(w) + 'px'; cv.style.height = Math.round(h) + 'px';
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = w; H = h;
  }

  /* ---- Lógica do jogo: 3 faixas, o jogador troca de faixa, carros vêm de cima. ---- */
  var LANES = 3;
  var pal = ['#F47600', '#27F4D2', '#4781D7', '#9C9FA2', '#00A1E8'];
  var keys = { l: 0, r: 0 }, best = 0, state = 'idle', endAt = 0, last = 0, wasAct = false;
  try { best = +localStorage.getItem('f1_dodge_best_v1') || 0; } catch (e) {}

  function roadX() { return W * 0.5; } // centro da estrada
  function roadWidth() { return Math.min(W * 0.86, H * 0.62); }
  function laneW() { return roadWidth() / LANES; }
  function laneCx(lane) { return roadX() - roadWidth() / 2 + laneW() * (lane + 0.5); }
  function carSize() { return { w: laneW() * 0.56, h: Math.min(laneW() * 1.15, H * 0.1) }; }

  function reset() {
    S = {
      t: 0, lane: 1, laneF: 1, // posição real (para animação suave entre faixas)
      speed: 220, dist: 0, spawnGap: 1.15, nextSpawn: 0.9,
      traffic: [], scrollY: 0, dead: false
    };
  }
  var S;
  function restart() { state = 'idle'; start(); cv.focus({ preventScroll: true }); }
  function start() {
    if (state === 'run') return; if (state === 'over' && Date.now() - endAt < 400) return;
    reset(); state = 'run';
  }

  var rzT;
  window.addEventListener('resize', function () {
    clearTimeout(rzT);
    rzT = setTimeout(function () { if (gm.classList.contains('active') && state !== 'run') sizeCanvas(); }, 200);
  });
  window.addEventListener('keydown', function (e) {
    if (!gm.classList.contains('active')) return;
    var k = (e.code === 'Space' ? ' ' : (e.key || '')).toLowerCase();
    if (k === 'arrowleft' || k === 'a') { moveLane(-1); e.preventDefault(); }
    else if (k === 'arrowright' || k === 'd') { moveLane(1); e.preventDefault(); }
    else if (k === ' ' || k === 'enter') { e.preventDefault(); start(); }
  }, true);
  function moveLane(d) {
    if (state !== 'run' || S.dead) { start(); return; }
    S.lane = Math.max(0, Math.min(LANES - 1, S.lane + d));
  }
  cv.tabIndex = 0; cv.style.outline = 'none';
  $('#gstart').addEventListener('click', restart);
  cv.addEventListener('pointerdown', function (e) {
    cv.focus({ preventScroll: true });
    if (state !== 'run') { start(); return; }
    var r = cv.getBoundingClientRect();
    moveLane(e.clientX - r.left < r.width / 2 ? -1 : 1);
  });
  function pad(id, d) {
    var b = $(id);
    b.addEventListener('pointerdown', function (e) { e.preventDefault(); moveLane(d); });
  }
  pad('#gl', -1); pad('#gr', 1);

  function spawnCar() {
    var lane = Math.floor(Math.random() * LANES);
    S.traffic.push({ lane: lane, y: -0.15, c: pal[Math.floor(Math.random() * pal.length)] });
  }
  function update(dt) {
    dt = Math.min(0.05, dt); S.t += dt;
    S.speed = 220 + Math.min(260, S.t * 9); // acelera com o tempo, até um teto
    S.dist += S.speed * dt;
    S.laneF += (S.lane - S.laneF) * Math.min(1, dt * 10);

    S.nextSpawn -= dt;
    if (S.nextSpawn <= 0) {
      spawnCar();
      S.spawnGap = Math.max(0.46, 1.15 - S.t * 0.012);
      S.nextSpawn = S.spawnGap * (0.75 + Math.random() * 0.5);
    }

    var h = H, speedFrac = S.speed / h;
    for (var i = S.traffic.length - 1; i >= 0; i--) {
      var c = S.traffic[i];
      c.y += speedFrac * dt;
      if (c.y > 1.15) { S.traffic.splice(i, 1); continue; }
      // colisão: mesma faixa e sobreposição vertical na zona do jogador
      var cs = carSize(), playerY = H - cs.h * 1.25, carY = c.y * H;
      if (c.lane === S.lane && Math.abs(carY - playerY) < cs.h * 0.78) {
        S.dead = true;
      }
    }
    if (S.dead && state === 'run') {
      state = 'over'; endAt = Date.now();
      var scoreT = S.t;
      if (!best || scoreT > best) { best = scoreT; try { localStorage.setItem('f1_dodge_best_v1', best); } catch (e) {} }
    }
  }

  function txt(t, x, y, size, col, al) {
    g.fillStyle = col; g.textAlign = al || 'left'; g.font = '700 ' + size + 'px Oswald,Arial,sans-serif'; g.fillText(t, x, y);
  }

  /* Clareia (amt>0) ou escurece (amt<0) uma cor hex, para dar volume ao carro sem precisar de imagens. */
  function shade(hex, amt) {
    var c = hex.replace('#', ''); if (c.length === 3) c = c.split('').map(function (x) { return x + x; }).join('');
    var num = parseInt(c, 16), r = (num >> 16) & 255, gg = (num >> 8) & 255, b = num & 255;
    function adj(v) { v = amt < 0 ? v * (1 + amt) : v + (255 - v) * amt; return Math.max(0, Math.min(255, Math.round(v))); }
    return 'rgb(' + adj(r) + ',' + adj(gg) + ',' + adj(b) + ')';
  }
  function roundRect(x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  /* Mesmo desenho do carrinho do cursor do mouse (ponteiro em forma de F1, visto de cima):
     asa dianteira, quatro pneus pretos com friso cinza, bargeboards, monocoque afunilado até
     o cockpit, asa traseira e o cockpit com anel dourado. Redesenhado aqui em coordenadas
     0..24 × 0..48 (o mesmo viewBox do SVG do cursor) e depois escalado para o tamanho w×h
     de cada carro do jogo, com a cor do corpo variando por carro. */
  function drawCarIcon(cx, cy, w, h, c, flip) {
    g.save(); g.translate(cx, cy); if (flip) g.rotate(Math.PI);

    // sombra projetada no chão
    g.save(); g.translate(0, h * 0.1); g.scale(1, 0.4);
    var shg = g.createRadialGradient(0, 0, 0, 0, 0, w * 0.62);
    shg.addColorStop(0, 'rgba(0,0,0,.42)'); shg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = shg; g.beginPath(); g.arc(0, 0, w * 0.62, 0, Math.PI * 2); g.fill(); g.restore();

    g.save();
    g.scale(w / 24, h / 48); g.translate(-12, -24); // espaço local igual ao viewBox "0 0 24 48" do cursor

    // asa dianteira
    g.fillStyle = '#ecece7'; roundRect(1, 1, 22, 3, 1); g.fill();
    // bargeboards / espelhos
    g.fillStyle = '#888'; g.fillRect(7, 11, 10, 1.6); g.fillRect(7, 34, 10, 1.6);
    // pneus
    g.fillStyle = '#111'; g.strokeStyle = '#666'; g.lineWidth = 0.6;
    [[2, 7, 5, 10], [17, 7, 5, 10], [1.5, 30, 5.5, 11], [17, 30, 5.5, 11]].forEach(function (r) {
      roundRect(r[0], r[1], r[2], r[3], 1.5); g.fill(); g.stroke();
    });
    // monocoque afunilado, com gradiente lateral para dar volume
    var grad = g.createLinearGradient(8, 0, 16, 0);
    grad.addColorStop(0, shade(c, -0.4)); grad.addColorStop(0.5, shade(c, 0.22)); grad.addColorStop(1, shade(c, -0.4));
    g.beginPath();
    g.moveTo(12, 3); g.lineTo(14.5, 14); g.lineTo(14.5, 30); g.lineTo(16, 42);
    g.lineTo(8, 42); g.lineTo(9.5, 30); g.lineTo(9.5, 14);
    g.closePath(); g.fillStyle = grad; g.fill();
    g.strokeStyle = shade(c, -0.5); g.lineWidth = 0.4; g.stroke();
    // asa traseira
    g.fillStyle = shade(c, -0.15); roundRect(4, 43, 16, 4, 1); g.fill();
    g.strokeStyle = shade(c, -0.55); g.lineWidth = 0.5; g.stroke();
    // cockpit com anel dourado
    g.beginPath(); g.arc(12, 26, 2.6, 0, Math.PI * 2);
    g.fillStyle = '#1b1f24'; g.fill(); g.strokeStyle = '#d4a93c'; g.lineWidth = 0.8; g.stroke();

    g.restore();
    g.restore();
  }
  function drawRoad() {
    g.fillStyle = '#163018'; g.fillRect(0, 0, W, H);
    var rw = roadWidth(), rx = roadX() - rw / 2;
    g.fillStyle = '#23262c'; g.fillRect(rx, 0, rw, H);
    // acostamento com zebra
    var fb = Math.max(6, rw * 0.018);
    [rx - fb, rx + rw].forEach(function (ex, side) {
      var n = Math.ceil(H / (fb * 2.2)) + 2, off = (S.scrollY % (fb * 2.2));
      for (var i = -1; i < n; i++) {
        g.fillStyle = (i % 2 === 0) ? '#e4002b' : '#fff';
        g.fillRect(ex, i * fb * 2.2 - off, fb, fb * 1.5);
      }
    });
    // faixas tracejadas entre pistas
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = Math.max(2, rw * 0.012);
    g.setLineDash([rw * 0.09, rw * 0.07]);
    g.lineDashOffset = -(S.scrollY % (rw * 0.16));
    for (var l = 1; l < LANES; l++) {
      var lx = rx + laneW() * l;
      g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx, H); g.stroke();
    }
    g.setLineDash([]);
  }
  function draw() {
    S.scrollY += S.speed * (1 / 60);
    drawRoad();
    S.traffic.forEach(function (c) {
      var cs = carSize(), cx = laneCx(c.lane), cy = c.y * H;
      if (cy > -cs.h && cy < H + cs.h) drawCarIcon(cx, cy, cs.w, cs.h, c.c, true);
    });
    var cs = carSize(), px = laneCx(S.laneF), py = H - cs.h * 1.25;
    drawCarIcon(px, py, cs.w, cs.h, '#e4002b', false);

    var fs = function (n) { return Math.round(Math.max(n * 0.78, Math.min(n * 1.35, Math.min(W, H) / 380))); };
    txt(S.t.toFixed(1) + 's', 16, fs(28), fs(22), '#fff');
    txt(Math.round(S.speed) + ' km/h', W - 16, fs(28), fs(15), '#9aa1a9', 'right');
    if (best) txt('MELHOR ' + best.toFixed(1) + 's', W - 16, fs(48), fs(12), '#666e77', 'right');
    if (state !== 'run') {
      g.fillStyle = 'rgba(12,14,17,.72)'; g.fillRect(0, 0, W, H);
      if (state === 'idle') {
        txt('DESVIE DOS CARROS', W / 2, H * 0.4, fs(28), '#fff', 'center');
        txt('Toque ou pressione ESPAÇO para começar', W / 2, H * 0.4 + fs(36), fs(14), '#d4a93c', 'center');
      } else {
        txt('VOCÊ BATEU!', W / 2, H * 0.4, fs(28), '#e4002b', 'center');
        txt('Tempo: ' + S.t.toFixed(1) + 's', W / 2, H * 0.4 + fs(32), fs(16), '#fff', 'center');
        txt('Toque ou ESPAÇO para tentar de novo', W / 2, H * 0.4 + fs(80), fs(13), '#9aa1a9', 'center');
      }
    }
  }
  function gameLoop(t) {
    requestAnimationFrame(gameLoop);
    var dt = (t - last) / 1000 || 0; last = t;
    if (gm.classList.contains('active')) {
      if (!wasAct) { wasAct = true; sizeCanvas(); reset(); cv.focus({ preventScroll: true }); }
      try { if (state === 'run') update(dt); draw(); }
      catch (err) { gm.querySelector('.st-note').textContent = 'Erro no jogo: ' + err.message; }
    } else { wasAct = false; if (state === 'run') { state = 'idle'; reset(); } }
  }
  requestAnimationFrame(gameLoop);

  render(); status();
  refresh();
  loadNext().then(function () { status(); loop(); });
})();
