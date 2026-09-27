(function () {
  var KEY = 'ladder', cv = P.$('#lad'), ctx = cv.getContext('2d'), namesBox = P.$('#names'), resBox = P.$('#results'), summary = P.$('#summary');
  var COLORS = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6', '#84cc16'];
  var st = P.fromHash() || P.load(KEY, null) || { n: 5, win: 1, names: [], results: [] };
  var rungs = [], ROWS = 0, revealed = {}, busy = false, colW = 70, H = 360, TOP = 10;
  P.$('#n').value = st.n; P.$('#win').value = st.win;

  function build(keep) {
    var n = Math.min(30, Math.max(2, +P.$('#n').value || 5)), win = Math.min(n, Math.max(0, +P.$('#win').value || 0));
    P.$('#n').value = n; P.$('#win').value = win;
    var oldN = [].map.call(namesBox.querySelectorAll('input'), function (i) { return i.value; }), oldR = [].map.call(resBox.querySelectorAll('input'), function (i) { return i.value; });
    if (!keep) { oldN = st.names || []; oldR = st.results || []; }
    namesBox.innerHTML = ''; resBox.innerHTML = '';
    namesBox.style.gridTemplateColumns = resBox.style.gridTemplateColumns = 'repeat(' + n + ',' + colW + 'px)';
    var defaultRes = []; for (var i = 0; i < n; i++) defaultRes.push(i < win ? '당첨' : '꽝');
    var resVals = (keep === 'win' || !oldR.length || oldR.length !== n) ? P.shuffle(defaultRes) : oldR;
    for (var j = 0; j < n; j++) {
      var a = document.createElement('input'); a.type = 'text'; a.maxLength = 12; a.value = oldN[j] || (j + 1) + '번'; a.dataset.i = j; a.title = '누르면 이 사람의 사다리를 탑니다';
      a.addEventListener('dblclick', function () { run(+this.dataset.i); });
      namesBox.appendChild(a);
      var b = document.createElement('input'); b.type = 'text'; b.maxLength = 12; b.value = resVals[j]; resBox.appendChild(b);
    }
    newLadder(); save();
  }
  function newLadder() {
    var n = namesBox.children.length; ROWS = Math.max(8, Math.min(22, n + 6)); rungs = [];
    for (var r = 0; r < ROWS; r++) { var row = []; for (var c = 0; c < n - 1; c++) { row.push(!row[c - 1] && P.rand(100) < 45); } rungs.push(row); }
    for (var c2 = 0; c2 < n - 1; c2++) { var any = rungs.some(function (row) { return row[c2]; }); if (!any) { var rr = P.rand(ROWS); rungs[rr][c2] = true; if (rungs[rr][c2 - 1]) rungs[rr][c2 - 1] = false; if (rungs[rr][c2 + 1]) rungs[rr][c2 + 1] = false; } }
    revealed = {}; hideResults(true); drawBase(); summary.innerHTML = '';
  }
  function hideResults(h) { [].forEach.call(resBox.querySelectorAll('input'), function (i) { i.type = h ? 'password' : 'text'; i.style.background = h ? '#f1f3f7' : '#fff'; }); P.$('#hideState').textContent = h ? '결과 가림' : '결과 공개'; }
  function x(c) { return c * colW + colW / 2; }
  function y(r) { return TOP + (r + 1) * (H - 2 * TOP) / (ROWS + 1); }
  function drawBase() {
    var n = namesBox.children.length; cv.width = n * colW; cv.height = H; ctx.clearRect(0, 0, cv.width, H);
    ctx.strokeStyle = '#9aa3b2'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (var c = 0; c < n; c++) { ctx.beginPath(); ctx.moveTo(x(c), 0); ctx.lineTo(x(c), H); ctx.stroke(); }
    rungs.forEach(function (row, r) { row.forEach(function (on, c) { if (on) { ctx.beginPath(); ctx.moveTo(x(c), y(r)); ctx.lineTo(x(c + 1), y(r)); ctx.stroke(); } }); });
    Object.keys(revealed).forEach(function (k) { drawPath(+k, 1); });
  }
  function path(c) { var pts = [[x(c), 0]]; for (var r = 0; r < ROWS; r++) { pts.push([x(c), y(r)]); if (rungs[r][c]) c++; else if (c > 0 && rungs[r][c - 1]) c--; pts.push([x(c), y(r)]); } pts.push([x(c), H]); return { pts: pts, end: c }; }
  function drawPath(c, k) {
    var p = path(c).pts, len = 0, seg = []; for (var i = 1; i < p.length; i++) { var d = Math.abs(p[i][0] - p[i - 1][0]) + Math.abs(p[i][1] - p[i - 1][1]); seg.push(d); len += d; }
    var want = len * k; ctx.strokeStyle = COLORS[c % COLORS.length]; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
    for (var j = 1; j < p.length; j++) { if (want <= 0) break; var s = seg[j - 1]; if (want >= s) { ctx.lineTo(p[j][0], p[j][1]); want -= s; } else { var t = want / s; ctx.lineTo(p[j - 1][0] + (p[j][0] - p[j - 1][0]) * t, p[j - 1][1] + (p[j][1] - p[j - 1][1]) * t); want = 0; } }
    ctx.stroke();
  }
  function run(c, cb) {
    if (busy) return; busy = true; save(); var t0 = performance.now(), dur = 1400;
    function f(t) { var k = Math.min(1, (t - t0) / dur); drawBase(); drawPath(c, k); if (k < 1) requestAnimationFrame(f); else { revealed[c] = 1; busy = false; show(c); if (cb) cb(); } }
    requestAnimationFrame(f);
  }
  function show(c) {
    var end = path(c).end, res = resBox.children[end], name = namesBox.children[c].value;
    res.type = 'text'; res.style.background = '#eef0ff'; P.tick(988, 0.08);
    var line = document.createElement('div'); line.innerHTML = '<b style="color:' + COLORS[c % COLORS.length] + '">' + P.esc(name) + '</b> → ' + P.esc(res.value); summary.appendChild(line);
  }
  function runAll() { var n = namesBox.children.length, i = 0; revealed = {}; summary.innerHTML = ''; hideResults(true); (function next() { if (i >= n) return; var c = i++; if (busy) return setTimeout(next, 50); run(c, next); })(); }
  function save() { st = { n: namesBox.children.length, win: +P.$('#win').value, names: [].map.call(namesBox.querySelectorAll('input'), function (i) { return i.value; }), results: [].map.call(resBox.querySelectorAll('input'), function (i) { return i.value; }) }; P.save(KEY, st); }
  namesBox.addEventListener('click', function (e) { if (e.target.tagName === 'INPUT' && e.detail === 0) return; });
  namesBox.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(+e.target.dataset.i); });
  P.$('#n').addEventListener('change', function () { build(true); });
  P.$('#win').addEventListener('change', function () { build('win'); });
  P.$('#new').onclick = newLadder;
  P.$('#all').onclick = runAll;
  P.$('#shareres').onclick = function () { var t = summary.innerText.trim(); if (!t) { P.toast('먼저 사다리를 타 주세요'); return; } P.shareResult('🪜 사다리 결과\n' + t); };
  P.$('#pickone').onclick = function () { var n = namesBox.children.length, left = []; for (var i = 0; i < n; i++) if (!revealed[i]) left.push(i); if (!left.length) { P.toast('모두 확인했습니다. 새 사다리를 만들어 보세요'); return; } run(left[0]); };
  P.$('#toggle').onclick = function () { hideResults(resBox.children[0].type === 'text'); };
  P.$('#share').onclick = function () { save(); P.share(st); };
  P.$('#full').onclick = function () { P.fullscreen(P.$('.stage')); };
  cv.addEventListener('click', function (e) { var r = cv.getBoundingClientRect(), c = Math.floor((e.clientX - r.left) / (r.width / namesBox.children.length)); if (c >= 0) run(c); });
  build(false);
})();
