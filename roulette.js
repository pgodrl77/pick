(function () {
  var cv = P.$('#wheel'), ctx = cv.getContext('2d'), ta = P.$('#items'), out = P.$('#out'), hist = P.$('#hist'), btn = P.$('#spin');
  var KEY = 'roulette:' + location.pathname;
  var COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6', '#84cc16', '#06b6d4', '#e11d48'];
  var rot = 0, spinning = false, items = [];
  var st = P.fromHash() || P.load(KEY, null) || { items: (window.PRESET || '짜장면\n짬뽕\n김치찌개\n돈가스\n초밥\n햄버거').split('\n'), remove: false, sound: true, dur: 5 };
  ta.value = (st.items || []).join('\n');
  P.$('#remove').checked = !!st.remove; P.$('#sound').checked = st.sound !== false; P.$('#dur').value = st.dur || 5;

  function parse() { // "항목*3" → 가중치 3
    return P.lines(ta.value.replace(/,/g, '，')).map(function (s) { s = s.replace(/，/g, ','); var m = s.match(/^(.*?)\s*[*xX×]\s*(\d{1,3})$/); return m && m[1] ? { t: m[1], w: Math.max(1, +m[2]) } : { t: s, w: 1 }; }).slice(0, 200);
  }
  function persist() { st = { items: ta.value.split('\n').filter(function (s) { return s.trim(); }), remove: P.$('#remove').checked, sound: P.$('#sound').checked, dur: +P.$('#dur').value || 5 }; P.save(KEY, st); }
  function draw() {
    var W = cv.width, R = W / 2 - 6, c = W / 2; ctx.clearRect(0, 0, W, W);
    var total = items.reduce(function (a, b) { return a + b.w; }, 0);
    if (!items.length) { ctx.fillStyle = '#f1f3f7'; ctx.beginPath(); ctx.arc(c, c, R, 0, 7); ctx.fill(); ctx.fillStyle = '#5b6475'; ctx.font = '600 22px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('항목을 입력하세요', c, c); return; }
    var a = rot - Math.PI / 2;
    items.forEach(function (it, i) {
      var sw = it.w / total * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(c, c); ctx.arc(c, c, R, a, a + sw); ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length]; if (items.length % COLORS.length === 1 && i === items.length - 1 && i > 0) ctx.fillStyle = COLORS[5]; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.translate(c, c); ctx.rotate(a + sw / 2); ctx.textAlign = 'right'; ctx.fillStyle = '#fff';
      var fs = Math.max(12, Math.min(30, 260 / Math.max(6, items.length) + 8)); if (sw < 0.12) fs = Math.max(10, fs * 0.7);
      ctx.font = '700 ' + fs + 'px sans-serif'; var label = it.t.length > 14 ? it.t.slice(0, 13) + '…' : it.t;
      if (sw > 0.05) ctx.fillText(label, R - 16, fs / 3);
      ctx.restore(); a += sw;
    });
    ctx.beginPath(); ctx.arc(c, c, 34, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#1d2330'; ctx.stroke();
    ctx.fillStyle = '#1d2330'; ctx.font = '800 16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('SPIN', c, c + 6);
  }
  function refresh() { items = parse(); draw(); P.$('#count').textContent = items.length + '개 항목'; }
  function pickIndex() { var total = items.reduce(function (a, b) { return a + b.w; }, 0), r = P.rand(total), acc = 0; for (var i = 0; i < items.length; i++) { acc += items[i].w; if (r < acc) return i; } return items.length - 1; }
  function spin() {
    if (spinning) return; refresh(); if (items.length < 2) { P.toast('항목을 2개 이상 넣어 주세요'); return; }
    persist(); spinning = true; btn.disabled = true; out.className = 'result empty'; out.textContent = '돌아가는 중…';
    var w = pickIndex(), total = items.reduce(function (a, b) { return a + b.w; }, 0), s = 0;
    for (var i = 0; i < w; i++) s += items[i].w / total * Math.PI * 2;
    var sw = items[w].w / total * Math.PI * 2, u = s + sw * (0.15 + 0.7 * P.randFloat());
    var target = (Math.PI * 2 - u) % (Math.PI * 2), cur = ((rot % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    var dur = Math.min(15, Math.max(2, +P.$('#dur').value || 5)) * 1000, spins = Math.round(dur / 1000 * 1.4) + 3;
    var delta = spins * Math.PI * 2 + ((target - cur + Math.PI * 2) % (Math.PI * 2)), start = rot, t0 = performance.now(), lastSlice = -1, snd = P.$('#sound').checked;
    function frame(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4); rot = start + delta * e; draw();
      if (snd) { var sl = Math.floor(rot / (Math.PI * 2 / Math.max(8, items.length))); if (sl !== lastSlice) { lastSlice = sl; P.tick(700, 0.02); } }
      if (k < 1) requestAnimationFrame(frame); else done(w);
    }
    requestAnimationFrame(frame);
  }
  function done(w) {
    var name = items[w].t; spinning = false; btn.disabled = false;
    out.className = 'result'; out.textContent = '🎉 ' + name; if (P.$('#sound').checked) { P.tick(988, 0.12); setTimeout(function () { P.tick(1319, 0.2); }, 130); }
    var li = document.createElement('li'); li.textContent = P.now() + '  ' + name; hist.insertBefore(li, hist.firstChild);
    if (P.$('#remove').checked) { var lines = ta.value.split('\n'), idx = -1, n = 0; for (var i = 0; i < lines.length; i++) { if (!lines[i].trim()) continue; if (n === w) { idx = i; break; } n++; } if (idx >= 0) { lines.splice(idx, 1); ta.value = lines.join('\n'); } refresh(); persist(); }
  }
  cv.addEventListener('click', spin); btn.addEventListener('click', spin);
  ta.addEventListener('input', function () { refresh(); persist(); });
  ['#remove', '#sound', '#dur'].forEach(function (s) { P.$(s).addEventListener('change', persist); });
  P.$('#shuffle').onclick = function () { ta.value = P.shuffle(ta.value.split('\n').filter(function (s) { return s.trim(); })).join('\n'); refresh(); persist(); };
  P.$('#clear').onclick = function () { ta.value = ''; refresh(); persist(); ta.focus(); };
  P.$('#share').onclick = function () { persist(); P.share(st); };
  P.$('#full').onclick = function () { P.fullscreen(P.$('.stage')); };
  P.$('#clearhist').onclick = function () { hist.innerHTML = ''; };
  P.presets(P.$('#presets'), window.PRESETS || [], function (v) { ta.value = v; refresh(); persist(); });
  refresh();
})();
