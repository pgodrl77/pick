(function () {
  var KEY = 'draw:' + location.pathname, ta = P.$('#items'), out = P.$('#out'), hist = P.$('#hist'), btn = P.$('#go');
  var st = P.fromHash() || P.load(KEY, null) || { items: (window.PRESET || '김민준\n이서연\n박도윤\n최지우\n정하준\n강서윤\n조시우\n윤하은').split('\n'), k: 1, exclude: true };
  ta.value = (st.items || []).join('\n'); P.$('#k').value = st.k || 1; P.$('#exclude').checked = st.exclude !== false;
  var picked = [], last = [];
  function persist() { st = { items: ta.value.split('\n').filter(function (s) { return s.trim(); }), k: +P.$('#k').value || 1, exclude: P.$('#exclude').checked }; P.save(KEY, st); }
  function pool() { var all = P.lines(ta.value.replace(/,/g, '\n')); return P.$('#exclude').checked ? all.filter(function (s) { return picked.indexOf(s) < 0; }) : all; }
  function count() { P.$('#count').textContent = P.lines(ta.value.replace(/,/g, '\n')).length + '명(개) · 남은 후보 ' + pool().length; }
  function go() {
    var p = pool(), k = Math.max(1, +P.$('#k').value || 1);
    if (!p.length) { P.toast('남은 후보가 없습니다. 초기화를 눌러 주세요'); return; }
    if (k > p.length) k = p.length;
    persist(); btn.disabled = true; out.className = 'result';
    var t0 = performance.now(), dur = 1300;
    (function f(t) { if (t - t0 < dur) { out.textContent = p[P.rand(p.length)]; P.tick(600 + P.rand(400), 0.015); setTimeout(function () { requestAnimationFrame(f); }, 45 + (t - t0) / 18); return; }
      var win = P.shuffle(p).slice(0, k); picked = picked.concat(win);
      out.innerHTML = '<div><div style="font-size:14px;color:#5b6475;font-weight:600">당첨 ' + win.length + '명</div><div class="chips">' + win.map(function (w) { return '<span class="chip">' + P.esc(w) + '</span>'; }).join('') + '</div></div>';
      var li = document.createElement('li'); li.textContent = P.now() + '  ' + win.join(', '); hist.insertBefore(li, hist.firstChild);
      btn.disabled = false; count(); P.tick(1175, 0.15); P.$('#after').hidden = false; last = win;
    })(t0);
  }
  btn.onclick = go; P.$('#again').onclick = go;
  P.$('#shareres').onclick = function () { if (last.length) P.shareResult('🎟️ 추첨 결과: ' + last.join(', ')); };
  ta.addEventListener('input', function () { persist(); count(); });
  ['#k', '#exclude'].forEach(function (s) { P.$(s).addEventListener('change', function () { persist(); count(); }); });
  P.$('#reset').onclick = function () { picked = []; hist.innerHTML = ''; out.className = 'result empty'; out.textContent = '버튼을 누르면 뽑습니다'; count(); };
  P.$('#numfill').onclick = function () { var n = Math.min(500, Math.max(2, +prompt('몇 번까지 만들까요? (예: 30)', '30') || 0)); if (!n) return; var a = []; for (var i = 1; i <= n; i++) a.push(i + '번'); ta.value = a.join('\n'); persist(); count(); };
  P.$('#share').onclick = function () { persist(); P.share(st); };
  P.$('#full').onclick = function () { P.fullscreen(P.$('.stage')); };
  P.presets(P.$('#presets'), window.PRESETS || [], function (v) { ta.value = v; persist(); count(); });
  count();
})();
