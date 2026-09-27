(function () {
  var coin = P.$('#coin'), cout = P.$('#cout'), stat = { h: 0, t: 0 }, deg = 0, dice = P.$('#dice'), dout = P.$('#dout');
  var FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  P.$('#flip').onclick = function () {
    var head = P.rand(2) === 0; deg += 1800 + (head ? 0 : 180) - (deg % 360);
    coin.style.transform = 'rotateY(' + deg + 'deg)'; coin.textContent = ''; cout.className = 'result empty'; cout.textContent = '던지는 중…';
    setTimeout(function () { coin.style.transition = 'none'; coin.style.transform = 'rotateY(0deg)'; void coin.offsetWidth; coin.style.transition = ''; coin.textContent = head ? '앞' : '뒤'; deg = 0; if (head) stat.h++; else stat.t++; cout.className = 'result'; cout.textContent = head ? '앞면' : '뒷면'; P.$('#cstat').textContent = '앞면 ' + stat.h + '회 · 뒷면 ' + stat.t + '회'; P.tick(880, 0.08); }, 950);
  };
  P.$('#roll').onclick = function () {
    var n = Math.max(1, Math.min(6, +P.$('#dn').value || 1)), t0 = performance.now(), vals = [];
    (function f(t) { vals = []; for (var i = 0; i < n; i++) vals.push(P.rand(6)); dice.innerHTML = vals.map(function (v) { return '<div class="die">' + FACES[v] + '</div>'; }).join('');
      if (t - t0 < 700) { P.tick(500 + P.rand(300), 0.01); setTimeout(function () { requestAnimationFrame(f); }, 60); return; }
      var sum = vals.reduce(function (a, b) { return a + b + 1; }, 0); dout.className = 'result'; dout.textContent = vals.map(function (v) { return v + 1; }).join(' + ') + (n > 1 ? ' = ' + sum : ''); P.tick(988, 0.1);
    })(t0);
  };
})();
