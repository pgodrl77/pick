/* 픽툴 공통 유틸 — 모든 추첨은 브라우저의 암호학적 난수(crypto.getRandomValues)로 한다. 서버 전송 없음. */
var P = (function () {
  function rand(n) { // 0..n-1 균등
    if (n <= 1) return 0;
    var max = Math.floor(4294967296 / n) * n, x = new Uint32Array(1);
    do { crypto.getRandomValues(x); } while (x[0] >= max);
    return x[0] % n;
  }
  function randFloat() { var x = new Uint32Array(1); crypto.getRandomValues(x); return x[0] / 4294967296; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rand(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function lines(t) { return String(t || '').split(/\r?\n|,/).map(function (s) { return s.trim(); }).filter(Boolean); }
  function load(k, d) { try { var v = localStorage.getItem('pick:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem('pick:' + k, JSON.stringify(v)); } catch (e) {} }
  function enc(o) { var s = JSON.stringify(o), b = new TextEncoder().encode(s), bin = ''; b.forEach(function (c) { bin += String.fromCharCode(c); }); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function dec(s) { try { s = s.replace(/-/g, '+').replace(/_/g, '/'); var bin = atob(s), b = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i); return JSON.parse(new TextDecoder().decode(b)); } catch (e) { return null; } }
  function fromHash() { var m = location.hash.match(/[#&]s=([^&]+)/); return m ? dec(m[1]) : null; }
  function toast(msg) { var t = document.querySelector('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); } t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 1800); }
  function copy(text, msg) {
    function ok() { toast(msg || '복사했습니다'); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
    function fallback() { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) { prompt('아래 내용을 복사하세요', text); } ta.remove(); }
  }
  function share(state, msg) { var url = location.origin + location.pathname + '#s=' + enc(state); copy(url, msg || '공유 링크를 복사했습니다'); return url; }
  function shareResult(text) { // 결과 한 줄 + 도구 주소 → 모바일은 공유 시트, PC는 복사
    var url = location.origin + location.pathname;
    if (navigator.share) { navigator.share({ title: document.title, text: text, url: url }).catch(function () {}); return; }
    copy(text + '\n' + url, '결과를 복사했습니다 — 단체방에 붙여넣으세요');
  }
  function fullscreen(el) { if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen(); }
  var ac = null;
  function tick(freq, dur) { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); var o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = freq || 880; g.gain.value = 0.06; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + (dur || 0.03)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(s) { return document.querySelector(s); }
  function now() { var d = new Date(); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2); }
  function presets(box, list, onPick) { if (!box) return; list.forEach(function (p) { var b = document.createElement('button'); b.type = 'button'; b.textContent = p[0]; b.onclick = function () { onPick(p[1]); }; box.appendChild(b); }); }
  return { rand: rand, randFloat: randFloat, shuffle: shuffle, lines: lines, load: load, save: save, enc: enc, dec: dec, fromHash: fromHash, toast: toast, copy: copy, share: share, shareResult: shareResult, fullscreen: fullscreen, tick: tick, esc: esc, $: $, now: now, presets: presets };
})();
