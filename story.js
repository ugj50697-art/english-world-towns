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

  // ---- 単語と前後の記号（" . , ! など）が別の行に分かれないようにする ----
  document.querySelectorAll('.w').forEach(function (btn) {
    var prev = btn.previousSibling, next = btn.nextSibling;
    var before = prev && prev.nodeType === 3 ? (prev.textContent.match(/["'“‘]+$/) || [''])[0] : '';
    var after = next && next.nodeType === 3 ? (next.textContent.match(/^[.,!?:;"'”’…]+/) || [''])[0] : '';
    if (!before && !after) return;
    var span = document.createElement('span');
    span.style.whiteSpace = 'nowrap';
    btn.parentNode.insertBefore(span, btn);
    if (before) {
      prev.textContent = prev.textContent.slice(0, -before.length);
      span.appendChild(document.createTextNode(before));
    }
    span.appendChild(btn);
    if (after) {
      next.textContent = next.textContent.slice(after.length);
      span.appendChild(document.createTextNode(after));
    }
  });

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

  // ---- 英文の読み上げ（1文ずつ読む。止めたら、その文の頭から再開） ----
  var story = document.querySelector('.story');
  var synth = window.speechSynthesis;
  if (story) {
    var bar = document.createElement('div');
    bar.className = 'listen';
    story.parentNode.insertBefore(bar, story);

    if (!synth || !window.SpeechSynthesisUtterance) {
      bar.innerHTML = '<p class="listen-note">このブラウザでは、英文の音声が使えません。</p>';
    } else {
      bar.innerHTML =
        '<span class="listen-label">🔊 英文を聞く</span>' +
        '<button type="button" class="listen-btn" data-act="play">▶ はじめから</button>' +
        '<button type="button" class="listen-btn" data-act="pause" disabled>⏸ 止める</button>' +
        '<button type="button" class="listen-btn" data-act="resume" disabled>⏯ 再開</button>';

      var lines = Array.prototype.slice.call(story.querySelectorAll('li'));
      var playBtn = bar.querySelector('[data-act="play"]');
      var pauseBtn = bar.querySelector('[data-act="pause"]');
      var resumeBtn = bar.querySelector('[data-act="resume"]');
      var index = 0, run = 0, voice = null;

      // 英語の声をえらぶ（なめらかな声があれば、それを使う）
      function pickVoice() {
        var all = synth.getVoices().filter(function (v) { return /^en[-_]/i.test(v.lang); });
        var us = all.filter(function (v) { return /en[-_]US/i.test(v.lang); });
        var good = function (v) { return /Google|Natural|Online/i.test(v.name); };
        voice = us.filter(good)[0] || all.filter(good)[0] || us[0] || all[0] || null;
      }
      pickVoice();
      if (synth.addEventListener) synth.addEventListener('voiceschanged', pickVoice);

      function mark(i) {
        lines.forEach(function (li, k) { li.classList.toggle('speaking', k === i); });
      }

      function setState(state) {
        pauseBtn.disabled = state !== 'playing';
        resumeBtn.disabled = state !== 'paused';
        if (state === 'idle') mark(-1);
      }

      function speakFrom(i, id) {
        if (id !== run) return;
        if (i >= lines.length) { index = 0; setState('idle'); return; }
        index = i;
        mark(i);
        var u = new SpeechSynthesisUtterance(lines[i].querySelector('.en').textContent.replace(/\s+/g, ' ').trim());
        u.lang = 'en-US';
        if (voice) u.voice = voice;
        u.rate = 0.85;
        u.onend = function () { speakFrom(i + 1, id); };
        synth.speak(u);
      }

      function start(i) {
        run++;
        var id = run;
        setState('playing');
        if (synth.speaking || synth.pending) {
          synth.cancel();
          // cancel のすぐあとに speak すると読まないブラウザがあるので、少し待つ
          setTimeout(function () { speakFrom(i, id); }, 80);
        } else {
          // iPhone などでは、押したその場で読みはじめないと音が出ない
          speakFrom(i, id);
        }
      }

      playBtn.addEventListener('click', function () { start(0); });
      pauseBtn.addEventListener('click', function () {
        run++;
        synth.cancel();
        setState('paused');
        mark(index);
      });
      resumeBtn.addEventListener('click', function () { start(index); });

      // ページを離れたら止める
      window.addEventListener('pagehide', function () { run++; synth.cancel(); });
    }
  }

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
