(function () {
  var KEY = 'team', ta = P.$('#items'), box = P.$('#teams');
  var st = P.fromHash() || P.load(KEY, null) || { items: '*김민준\n*이서연\n박도윤\n최지우\n정하준\n강서윤\n조시우\n윤하은\n장민서\n임지호\n한예은\n오준우'.split('\n'), mode: 'count', num: 3, names: '' };
  ta.value = (st.items || []).join('\n'); P.$('#mode').value = st.mode || 'count'; P.$('#num').value = st.num || 3; P.$('#tnames').value = st.names || '';
  var last = null;
  function persist() { st = { items: ta.value.split('\n').filter(function (s) { return s.trim(); }), mode: P.$('#mode').value, num: +P.$('#num').value || 2, names: P.$('#tnames').value }; P.save(KEY, st); }
  function label() { P.$('#numlabel').textContent = P.$('#mode').value === 'count' ? '팀(조) 수' : '한 팀 인원'; var n = P.lines(ta.value.replace(/,/g, '\n')).length; P.$('#count').textContent = n + '명'; }
  function make() {
    var all = P.lines(ta.value.replace(/,/g, '\n')); if (all.length < 2) { P.toast('2명 이상 입력해 주세요'); return; }
    var lead = [], rest = []; all.forEach(function (s) { if (/^\*/.test(s)) lead.push(s.replace(/^\*+\s*/, '')); else rest.push(s); });
    var num = Math.max(1, +P.$('#num').value || 2), T = P.$('#mode').value === 'count' ? Math.min(num, all.length) : Math.max(1, Math.ceil(all.length / num));
    var teams = []; for (var i = 0; i < T; i++) teams.push([]);
    var order = P.shuffle(teams.map(function (_, i) { return i; }));
    P.shuffle(lead).forEach(function (s, i) { teams[order[i % T]].push('★ ' + s); });
    P.shuffle(rest).forEach(function (s) { var min = Infinity, cand = []; teams.forEach(function (t, i) { if (t.length < min) { min = t.length; cand = [i]; } else if (t.length === min) cand.push(i); }); teams[cand[P.rand(cand.length)]].push(s); });
    var tn = P.lines(P.$('#tnames').value.replace(/,/g, '\n'));
    last = teams.map(function (t, i) { return { name: tn[i] || (i + 1) + '팀', members: t }; });
    box.innerHTML = last.map(function (t) { return '<div class="team"><b>' + P.esc(t.name) + ' (' + t.members.length + '명)</b><ol>' + t.members.map(function (m) { return '<li>' + P.esc(m) + '</li>'; }).join('') + '</ol></div>'; }).join('');
    persist(); P.tick(1047, 0.1);
  }
  P.$('#go').onclick = make;
  P.$('#copy').onclick = function () { if (!last) { P.toast('먼저 팀을 나눠 주세요'); return; } P.copy(last.map(function (t) { return '[' + t.name + '] ' + t.members.join(', '); }).join('\n'), '결과를 복사했습니다'); };
  ta.addEventListener('input', function () { persist(); label(); });
  ['#mode', '#num', '#tnames'].forEach(function (s) { P.$(s).addEventListener('change', function () { persist(); label(); }); });
  P.$('#share').onclick = function () { persist(); P.share(st); };
  P.$('#full').onclick = function () { P.fullscreen(P.$('.stage')); };
  label();
})();
