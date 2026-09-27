(function () {
  var KEY = 'number:' + location.pathname, out = P.$('#out'), hist = P.$('#hist');
  var D = window.NUMDEF || { min: 1, max: 100, k: 1, dup: false, sort: true };
  var st = P.fromHash() || P.load(KEY, null) || D;
  P.$('#min').value = st.min; P.$('#max').value = st.max; P.$('#k').value = st.k; P.$('#dup').checked = !!st.dup; P.$('#sort').checked = st.sort !== false;
  function persist() { st = { min: +P.$('#min').value, max: +P.$('#max').value, k: +P.$('#k').value, dup: P.$('#dup').checked, sort: P.$('#sort').checked }; P.save(KEY, st); }
  function go() {
    var a = Math.ceil(+P.$('#min').value), b = Math.floor(+P.$('#max').value), k = Math.max(1, Math.min(1000, +P.$('#k').value || 1)), dup = P.$('#dup').checked;
    if (!(isFinite(a) && isFinite(b)) || b < a) { P.toast('최솟값과 최댓값을 확인해 주세요'); return; }
    var span = b - a + 1; if (!dup && k > span) { P.toast('중복 없이 뽑을 수 있는 최대 개수는 ' + span + '개입니다'); return; }
    if (span > 1e9) { P.toast('범위가 너무 큽니다'); return; }
    var res = [];
    if (dup) { for (var i = 0; i < k; i++) res.push(a + P.rand(span)); }
    else if (span <= 20000) { var arr = []; for (var j = a; j <= b; j++) arr.push(j); res = P.shuffle(arr).slice(0, k); }
    else { var seen = {}; while (res.length < k) { var v = a + P.rand(span); if (!seen[v]) { seen[v] = 1; res.push(v); } } }
    if (P.$('#sort').checked) res.sort(function (x, y) { return x - y; });
    persist();
    out.className = 'result'; out.innerHTML = res.length === 1 ? '<span class="big-num">' + res[0] + '</span>' : '<div class="chips">' + res.map(function (n) { return '<span class="chip">' + n + '</span>'; }).join('') + '</div>';
    var li = document.createElement('li'); li.textContent = P.now() + '  ' + res.join(', '); hist.insertBefore(li, hist.firstChild); P.tick(1047, 0.1);
  }
  P.$('#go').onclick = go;
  ['#min', '#max', '#k', '#dup', '#sort'].forEach(function (s) { P.$(s).addEventListener('change', persist); });
  P.$('#copy').onclick = function () { var t = out.textContent.trim(); if (!t || out.classList.contains('empty')) { P.toast('먼저 뽑아 주세요'); return; } P.copy([].map.call(out.querySelectorAll('.chip,.big-num'), function (e) { return e.textContent; }).join(', ')); };
  P.$('#share').onclick = function () { persist(); P.share(st); };
  P.$('#full').onclick = function () { P.fullscreen(P.$('.stage')); };
  P.presets(P.$('#presets'), window.PRESETS || [], function (v) { P.$('#min').value = v.min; P.$('#max').value = v.max; P.$('#k').value = v.k; P.$('#dup').checked = !!v.dup; P.$('#sort').checked = v.sort !== false; persist(); });
})();
