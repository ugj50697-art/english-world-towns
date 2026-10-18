// 英語でめぐる世界の町 — トップの世界地図
(function () {
  var W = 1000, H = 500;
  var SVG_NS = 'http://www.w3.org/2000/svg';

  // 経度・緯度 → 地図上の位置（正距円筒図法）
  function px(lon, lat) {
    return [(lon + 180) / 360 * W, (90 - lat) / 180 * H];
  }

  // 点を丸くつないで、やわらかい輪郭にする
  function smooth(points) {
    var p = points.map(function (q) { return px(q[0], q[1]); });
    var n = p.length, d = 'M' + p[0][0].toFixed(1) + ' ' + p[0][1].toFixed(1);
    for (var i = 0; i < n; i++) {
      var p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += 'C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d + 'Z';
  }

  var YELLOW = '#f5e2ae', GREEN = '#cfe3b0', GREEN2 = '#bcdaa4', ORANGE = '#f2c994', PEACH = '#f3b98f', SNOW = '#eef3ef';

  var LANDS = [
    { fill: GREEN, pts: [[-168,66],[-160,71],[-140,70],[-125,70],[-95,72],[-80,73],[-65,62],[-56,52],[-66,45],[-70,42],[-76,35],[-81,31],[-80,25],[-83,29],[-90,30],[-97,27],[-97,21],[-92,18],[-87,21],[-88,15],[-83,9],[-79,8],[-86,12],[-92,14],[-105,20],[-110,24],[-115,30],[-118,34],[-124,40],[-124,48],[-133,56],[-150,60],[-158,57],[-165,60]] },
    { fill: SNOW, pts: [[-50,82],[-30,83],[-20,75],[-22,70],[-40,64],[-44,60],[-52,65],[-58,75],[-70,78]] },
    { fill: SNOW, pts: [[-24,65.5],[-14,66.5],[-13.5,64.5],[-22,63.5]] },
    { fill: GREEN2, pts: [[-80,9],[-72,12],[-62,10],[-52,5],[-50,0],[-40,-3],[-35,-7],[-38,-14],[-40,-22],[-48,-26],[-53,-34],[-58,-38],[-65,-41],[-66,-47],[-69,-52],[-72,-54],[-74,-50],[-74,-42],[-72,-30],[-71,-18],[-76,-14],[-81,-6],[-80,0],[-78,5]] },
    { fill: YELLOW, pts: [[-9,37],[-9,43],[-2,44],[-4,48],[2,51],[5,53],[8,55],[8,57],[5,59],[5,62],[12,66],[18,70],[25,71],[32,70],[40,68],[45,68],[60,69],[70,73],[80,73],[100,77],[115,74],[130,72],[145,72],[160,70],[170,69],[180,66],[178,62],[163,60],[160,54],[156,51],[155,57],[142,59],[136,54],[138,47],[133,43],[129,40],[129,35],[126,35],[126,38],[125,40],[121,39],[122,37],[119,35],[121,31],[122,29],[119,25],[114,22],[110,21],[108,22],[106,19],[109,12],[105,9],[103,10],[100,13],[100,6],[103,1],[101,2],[98,8],[98,16],[94,17],[92,22],[88,22],[86,20],[80,15],[80,10],[77,8],[73,16],[72,21],[67,25],[62,25],[57,26],[56,24],[59,22],[55,17],[52,16],[45,13],[43,15],[39,22],[35,28],[33,29],[32,31],[35,33],[36,36],[30,36],[27,37],[26,40],[23,40],[24,37],[22,37],[20,40],[19,42],[14,45],[13,44],[16,41],[18,40],[16,38],[12,42],[10,44],[7,44],[3,43],[3,42],[0,39],[-2,37],[-6,36]] },
    { fill: YELLOW, pts: [[-5,50],[1,51],[2,53],[-1,55],[-2,58],[-5,58],[-6,56],[-3,54],[-5,52]] },
    { fill: YELLOW, pts: [[130,31],[132,33],[135,34],[140,35],[141,38],[142,40],[141,42],[144,43],[145,44],[142,45.5],[140,43],[140,40],[138,37],[136,36],[133,35],[130,34]] },
    { fill: YELLOW, pts: [[120.2,22],[121,25.3],[122,25],[121,22]] },
    { fill: GREEN2, pts: [[120,18.5],[122.5,18.5],[126,7],[124,6.5],[121,13]] },
    { fill: ORANGE, pts: [[-17,21],[-16,28],[-10,30],[-6,35],[10,37],[11,34],[20,31],[30,31],[32,31],[34,28],[38,22],[43,12],[51,12],[50,8],[42,-1],[40,-10],[40,-16],[35,-24],[33,-29],[27,-34],[20,-35],[18,-32],[14,-23],[12,-15],[13,-6],[9,-1],[9,4],[5,6],[-2,5],[-8,4],[-13,8],[-17,14]] },
    { fill: ORANGE, pts: [[49,-12],[50,-16],[47,-25],[44,-24],[44,-17]] },
    { fill: GREEN2, pts: [[95,5],[98,4],[104,-2],[106,-6],[101,-3]] },
    { fill: GREEN2, pts: [[109,1],[111,2],[117,7],[119,1],[116,-4],[110,-3]] },
    { fill: GREEN2, pts: [[105,-6],[114,-7],[114,-8.5],[106,-7.5]] },
    { fill: GREEN2, pts: [[131,-1],[141,-3],[150,-10],[143,-9],[138,-8]] },
    { fill: PEACH, pts: [[114,-22],[122,-18],[130,-12],[136,-12],[137,-16],[141,-12],[143,-14],[146,-19],[153,-25],[151,-33],[147,-38],[141,-38],[138,-35],[131,-31],[124,-34],[116,-35],[115,-30]] },
    { fill: GREEN2, pts: [[173,-35],[178,-38],[175,-41],[171,-45],[167,-46],[172,-41]] }
  ];

  // 旅の町（ready: 読める町 / それ以外は「？」で隠す）
  var TOWNS = [
    { id: 'narita',  en: 'Narita',  lon: 140.4, lat: 35.8, icon: '✈', page: 'narita.html', ready: true },
    { id: 'seoul',   en: 'Seoul',   lon: 127.0, lat: 37.6, icon: '★', page: 'seoul.html', ready: true },
    { id: 'taipei',  en: 'Taipei',  lon: 121.5, lat: 25.0, icon: '☾', page: 'taipei.html', ready: true },
    { id: 'hongkong',en: 'Hong Kong', lon: 114.2, lat: 22.3, icon: '⚓', page: 'hongkong.html', ready: true },
    { id: 'bangkok', en: 'Bangkok', lon: 100.5, lat: 13.75, icon: '☸', page: 'bangkok.html', ready: true },
    { id: 'singapore', en: 'Singapore', lon: 103.8, lat: 1.35, icon: '❀', page: 'singapore.html', ready: true },
    { id: 'mumbai', en: 'Mumbai', lon: 72.88, lat: 19.08, icon: '☀', page: 'mumbai.html', ready: true },
    { id: 'istanbul', en: 'Istanbul', lon: 28.98, lat: 41.01, icon: '☕', page: 'istanbul.html', ready: true },
    { id: 'cairo', en: 'Cairo', lon: 31.24, lat: 30.04, icon: '▲', page: 'cairo.html', ready: true },
    { id: 'athens', en: 'Athens', lon: 23.73, lat: 37.98, icon: 'Ω', page: 'athens.html', ready: true }
  ];

  var VIEWS = {
    world: [0, 40, 1000, 380],
    asia: [530, 105, 470, 178.6]
  };

  function readStamps() {
    try {
      return JSON.parse(localStorage.getItem('ewt-stamps')) || {};
    } catch (e) {
      return {};
    }
  }

  var svg = document.getElementById('world-map');
  var msg = document.getElementById('map-message');
  if (!svg) return;
  var stamps = readStamps();

  function el(name, attrs, text) {
    var e = document.createElementNS(SVG_NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  // 海
  svg.appendChild(el('rect', { x: -500, y: -500, width: 2000, height: 1500, fill: '#cfeaf2' }));

  // 波のもよう
  var waves = el('g', { fill: 'none', stroke: '#acd8e6', 'stroke-width': 2, 'stroke-linecap': 'round' });
  [[300, 240], [345, 330], [120, 200], [640, 300], [70, 330], [920, 260], [560, 380], [960, 340]].forEach(function (w) {
    waves.appendChild(el('path', { d: 'M' + w[0] + ' ' + w[1] + 'q6 -6 12 0t12 0t12 0' }));
  });
  svg.appendChild(waves);

  // 海の名前（英語）
  var seaNames = el('g', { 'font-family': 'Nunito, sans-serif', 'font-style': 'italic', 'font-weight': 700, 'font-size': 13, fill: '#6fa6b8', 'text-anchor': 'middle' });
  [['Pacific Ocean', 110, 265], ['Pacific Ocean', 950, 215], ['Atlantic Ocean', 405, 210], ['Indian Ocean', 700, 330]].forEach(function (s) {
    seaNames.appendChild(el('text', { x: s[1], y: s[2] }, s[0]));
  });
  svg.appendChild(seaNames);

  // 大陸（かげ → 本体）
  var shadow = el('g', { fill: '#a9d4e2', transform: 'translate(2.5 3.5)' });
  var lands = el('g', { stroke: '#8f7f62', 'stroke-width': 1.4, 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' });
  LANDS.forEach(function (l) {
    var d = smooth(l.pts);
    shadow.appendChild(el('path', { d: d }));
    lands.appendChild(el('path', { d: d, fill: l.fill, 'vector-effect': 'non-scaling-stroke' }));
  });
  svg.appendChild(shadow);
  svg.appendChild(lands);

  // 旅の道すじ（点線）
  var routeD = '';
  TOWNS.forEach(function (t, i) {
    var p = px(t.lon, t.lat);
    t.x = p[0]; t.y = p[1];
    if (i === 0) { routeD = 'M' + t.x + ' ' + t.y; return; }
    var a = TOWNS[i - 1], mx = (a.x + t.x) / 2, my = (a.y + t.y) / 2;
    var dx = t.x - a.x, dy = t.y - a.y;
    routeD += 'Q' + (mx - dy * 0.25) + ' ' + (my + dx * 0.25) + ' ' + t.x + ' ' + t.y;
  });
  svg.appendChild(el('path', { d: routeD, fill: 'none', stroke: '#d9472b', 'stroke-width': 2, 'stroke-dasharray': '2 6', 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke', opacity: 0.75 }));

  // 町の印
  var markers = [];
  TOWNS.forEach(function (t, i) {
    var g = el('g', { class: 'town', tabindex: 0, role: 'button' });
    var stamped = !!stamps[t.id];
    // 前の町のスタンプを押すと、次の町が見えてくる
    var open = t.ready && (i === 0 || !!stamps[TOWNS[i - 1].id]);
    var label = { x: 0, y: 25, 'text-anchor': 'middle', 'font-family': 'Nunito, sans-serif', 'font-weight': 800, 'font-size': 10, fill: '#2f3437', stroke: '#fffaf1', 'stroke-width': 3, 'paint-order': 'stroke' };

    if (open && stamped) {
      g.appendChild(el('circle', { r: 12, fill: '#fbe5de', stroke: '#d9472b', 'stroke-width': 2.5 }));
      g.appendChild(el('circle', { r: 8.5, fill: 'none', stroke: '#d9472b', 'stroke-width': 1 }));
      g.appendChild(el('text', { y: 4.5, 'text-anchor': 'middle', 'font-size': 12, fill: '#d9472b' }, t.icon));
      g.appendChild(el('text', label, t.en));
      g.setAttribute('aria-label', t.en + '（スタンプ済み）');
    } else if (open) {
      g.appendChild(el('circle', { class: 'pulse', r: 11, fill: '#d9472b', opacity: 0.6 }));
      g.appendChild(el('circle', { r: 11, fill: '#fff', stroke: '#d9472b', 'stroke-width': 2.5 }));
      g.appendChild(el('text', { y: 4.5, 'text-anchor': 'middle', 'font-size': 12, fill: '#d9472b' }, t.icon));
      g.appendChild(el('text', label, t.en));
      g.appendChild(el('text', { x: 0, y: -17, 'text-anchor': 'middle', 'font-family': 'Nunito, sans-serif', 'font-weight': 800, 'font-size': 9, fill: '#d9472b', stroke: '#fffaf1', 'stroke-width': 3, 'paint-order': 'stroke', 'letter-spacing': 1 }, i === 0 ? 'START' : 'NEXT'));
      g.setAttribute('aria-label', t.en + (i === 0 ? '（ここから出発）' : '（次の町）'));
    } else {
      g.appendChild(el('circle', { r: 9, fill: '#fffaf1', stroke: '#9a8f7a', 'stroke-width': 1.6, 'stroke-dasharray': '3 2' }));
      g.appendChild(el('text', { y: 4.5, 'text-anchor': 'middle', 'font-family': 'Nunito, sans-serif', 'font-weight': 800, 'font-size': 12, fill: '#9a8f7a' }, '?'));
      g.setAttribute('aria-label', 'まだひみつの町');
    }

    function go() {
      if (open) {
        location.href = t.page;
      } else if (msg) {
        msg.textContent = '？ の町は、まだひみつ。前の町でスタンプを押すと見えてくるよ。';
      }
    }
    g.addEventListener('click', go);
    g.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
    svg.appendChild(g);
    markers.push({ g: g, t: t });
  });

  // 表示範囲（世界 / アジア）
  var current = VIEWS.world.slice();

  function apply(vb) {
    svg.setAttribute('viewBox', vb.join(' '));
    // 画面の上で同じくらいの大きさに見えるように（せまい画面で世界全体のときは大きくしすぎない）
    var shown = svg.getBoundingClientRect().width || 1000;
    var s = Math.min(vb[2] / shown * (shown < 600 ? 0.75 : 1), 1.6);
    markers.forEach(function (m) {
      m.g.setAttribute('transform', 'translate(' + m.t.x + ' ' + m.t.y + ') scale(' + s + ')');
    });
    // 海の名前も、拡大しても同じくらいの大きさに
    seaNames.setAttribute('font-size', 13 * Math.min(s, 1));
    current = vb;
  }

  function goTo(name) {
    var from = current.slice(), to = VIEWS[name], start = null;
    document.querySelectorAll('.view-switch button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.view === name ? 'true' : 'false');
    });
    function step(ts) {
      if (start === null) start = ts;
      var k = Math.min(1, (ts - start) / 600);
      var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      apply(from.map(function (v, i) { return v + (to[i] - v) * e; }));
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll('.view-switch button').forEach(function (b) {
    b.addEventListener('click', function () { goTo(b.dataset.view); });
  });

  // スマホでは最初からアジアを大きく
  var first = window.matchMedia('(max-width: 640px)').matches ? 'asia' : 'world';
  apply(VIEWS[first].slice());
  document.querySelectorAll('.view-switch button').forEach(function (b) {
    b.setAttribute('aria-pressed', b.dataset.view === first ? 'true' : 'false');
  });

  window.addEventListener('resize', function () { apply(current); });

  // トップの町カード：前の町のスタンプを押したら出す
  document.querySelectorAll('[data-after]').forEach(function (card) {
    if (stamps[card.dataset.after]) card.hidden = false;
  });

  // スタンプの数
  var count = document.getElementById('stamp-count');
  if (count) {
    count.textContent = TOWNS.filter(function (t) { return stamps[t.id]; }).length;
  }
})();
