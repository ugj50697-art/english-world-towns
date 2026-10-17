// 英語でめぐる世界の町 — 物語ページ（単語の吹き出し・単語帳・スタンプ）
(function () {
  var town = document.body.dataset.town;
  var bubble = document.getElementById('bubble');
  var list = document.getElementById('wordbook');
  var empty = document.getElementById('word-empty');
  var count = document.getElementById('word-count');
  var active = null;

  function load(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  // ---- 単語帳 ----
  var wordsKey = 'ewt-words-' + town;
  var words = load(wordsKey, []);

  function keyOf(btn) {
    return btn.textContent.trim().toLowerCase();
  }

  function addToBook(en, ja, isNew) {
    var li = document.createElement('li');
    var b = document.createElement('b');
    var span = document.createElement('span');
    b.textContent = en;
    span.textContent = ja;
    li.appendChild(b);
    li.appendChild(span);
    if (isNew) li.className = 'new';
    list.appendChild(li);
    empty.style.display = 'none';
    count.textContent = list.children.length;
  }

  words.forEach(function (w) { addToBook(w.en, w.ja, false); });
  var savedKeys = words.map(function (w) { return w.key; });
  document.querySelectorAll('.w').forEach(function (btn) {
    if (savedKeys.indexOf(keyOf(btn)) !== -1) btn.classList.add('seen');
  });

  // ---- 吹き出し ----
  function showBubble(btn) {
    bubble.innerHTML = '';
    var b = document.createElement('b');
    b.textContent = btn.textContent.trim();
    bubble.appendChild(b);
    bubble.appendChild(document.createTextNode(btn.dataset.ja));
    bubble.classList.add('show');

    var r = btn.getBoundingClientRect();
    var bw = bubble.offsetWidth, bh = bubble.offsetHeight;
    var center = r.left + r.width / 2;
    var left = Math.max(12, Math.min(center - bw / 2, document.documentElement.clientWidth - bw - 12));
    bubble.style.left = (left + window.scrollX) + 'px';
    bubble.style.top = (r.top + window.scrollY - bh - 10) + 'px';
    bubble.style.setProperty('--arrow', (center - left) + 'px');
  }

  function hideBubble() {
    bubble.classList.remove('show');
    if (active) active.classList.remove('active');
    active = null;
  }

  document.querySelectorAll('.w').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (active === btn) { hideBubble(); return; }
      if (active) active.classList.remove('active');
      active = btn;
      btn.classList.add('active');
      showBubble(btn);

      var key = keyOf(btn);
      if (savedKeys.indexOf(key) === -1) {
        savedKeys.push(key);
        words.push({ key: key, en: btn.textContent.trim(), ja: btn.dataset.ja });
        save(wordsKey, words);
        addToBook(btn.textContent.trim(), btn.dataset.ja, true);
        document.querySelectorAll('.w').forEach(function (other) {
          if (keyOf(other) === key) other.classList.add('seen');
        });
      }
    });
  });

  document.addEventListener('click', hideBubble);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hideBubble();
  });
  // スマホでスクロールしたときの小さなリサイズでは閉じない（横幅が変わったときだけ）
  var lastWidth = document.documentElement.clientWidth;
  window.addEventListener('resize', function () {
    var w = document.documentElement.clientWidth;
    if (w !== lastWidth) hideBubble();
    lastWidth = w;
  });

  // ---- スタンプ ----
  var stampBtn = document.getElementById('stamp-btn');
  var stamp = document.getElementById('stamp');
  var stampDate = document.getElementById('stamp-date');
  var nextBox = document.getElementById('next-box');
  var stamps = load('ewt-stamps', {});

  function showStamp(date, animate) {
    stampDate.textContent = date;
    stamp.classList.add('show');
    if (animate) stamp.classList.add('pressed');
    nextBox.classList.add('show');
    stampBtn.disabled = true;
    stampBtn.textContent = 'スタンプを押したよ！';
  }

  if (stamps[town]) showStamp(stamps[town], false);

  stampBtn.addEventListener('click', function () {
    var d = new Date();
    var date = d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate();
    stamps[town] = date;
    save('ewt-stamps', stamps);
    showStamp(date, true);
  });
})();
