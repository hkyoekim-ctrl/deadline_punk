/* 마감펑크 오프닝: 새벽 3시 작업실 (곡 인트로 0~17초)
 * 책상 앞에 앉은 작가를 뒤에서 본 한 화면. 장면은 160x90 칸(게임 픽셀의 2배 굵기)에 그려 320x180 으로 키움.
 *   MP.Opening.draw(ctx, ot, t[, cue])   ctx = 320x180 논리 좌표(지금 게임과 같음), ot = 곡 재생 시각(초), t = 화면용 시계(초)
 * 가사 타이밍(cue.lines)은 게임 쪽 CUE 와 같은 형식: [시작, 끝, '가사'].
 * 0~2초 전화벨, 가사마다 말풍선, 13.6초 "작가님"부터 화면 흔들림, 15.7초 "계세요?"에서 작가가 벌떡 깸.
 */
(function (root) {
  const GW = 160, GH = 90, SW = 320, SH = 180;
  const DEF = {
    ringEnd: 1.75, drop: 17.0,
    lines: [[2.0, 3.1, '여보세요'], [5.8, 7.3, '작가님 마감이'], [9.3, 11.0, '펑크가 났어요 작가님'], [13.6, 14.2, '작가님'], [15.7, 16.3, '계세요?']]
  };
  const FONT = '"Mulmaru", sans-serif';
  const K = '#120c22';
  let c = null;
  const px = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w || 1, h || 1); };

  // ── 도트 도구: 반투명·곡선 없이 4x4 디더링과 계단식 도형만 씀
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const on = (x, y, lv) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16 < lv;
  function dfill(x0, y0, x1, y1, test, col, lv) {
    c.fillStyle = col;
    for (let y = Math.floor(y0); y <= y1; y++) for (let x = Math.floor(x0); x <= x1; x++) if (test(x + 0.5, y + 0.5) && on(x, y, lv)) c.fillRect(x, y, 1, 1);
  }
  function dEllipse(cx, cy, rx, ry, col, lv) { dfill(cx - rx, cy - ry, cx + rx, cy + ry, (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1, col, lv); }
  function inPolyXY(P, x, y) { let r = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) r = !r; } return r; }
  function dPoly(P, col, lv) { const xs = P.map(p => p[0]), ys = P.map(p => p[1]); dfill(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), (x, y) => inPolyXY(P, x, y), col, lv); }
  function pline(x0, y0, x1, y1, w, col) {   // 계단식 선(굵기 w 칸, 중심 기준)
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1, o = Math.floor(w / 2);
    for (let i = 0; i <= n; i++) px(Math.round(x0 + (x1 - x0) * i / n) - o, Math.round(y0 + (y1 - y0) * i / n) - o, w, w, col);
  }
  function rr(x, y, w, h, r, col) {   // 모서리를 계단식으로 깎은 사각형
    for (let i = 0; i < h; i++) { const d = Math.min(i, h - 1 - i); const inset = d < r ? Math.round(r - Math.sqrt(r * r - (r - d) * (r - d))) : 0; px(x + inset, y + i, w - inset * 2, 1, col); }
  }
  function ro(x, y, w, h, r, col) { rr(x - 1, y - 1, w + 2, h + 2, r + 1, K); rr(x, y, w, h, r, col); }   // 1칸 외곽선
  function rng(seed) { return () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }; }

  // ── 3x5 숫자(시계·타이머용)
  const DIG = {
    '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001',
    '5': '111100111001111', '6': '111100111101111', '7': '111001001001001', '8': '111101111101111', '9': '111101111001111', ':': '000010000010000'
  };
  function digW(str) { let w = 0; for (const ch of str) w += ch === ':' ? 2 : 4; return w - 1; }
  function digits(str, x, y, col) {
    for (const ch of str) { if (ch === ':') { px(x, y + 1, 1, 1, col); px(x, y + 3, 1, 1, col); x += 2; continue; } const g = DIG[ch]; for (let i = 0; i < 15; i++) if (g[i] === '1') px(x + (i % 3), y + Math.floor(i / 3), 1, 1, col); x += 4; }
  }

  // ── 글자: 안티에일리어싱을 걷어내 또렷한 도트로(320x180 좌표)
  const tcv = (typeof document !== 'undefined') ? document.createElement('canvas') : null;
  function ptext(str, x, y, size, col, align, shadow) {
    if (!str) return 0;
    const t = tcv.getContext('2d', { willReadFrequently: true });
    t.font = size + 'px ' + FONT;
    const w = Math.ceil(t.measureText(str).width) + 4, h = Math.ceil(size * 1.3) + 4;
    if (tcv.width < w || tcv.height < h) { tcv.width = Math.max(tcv.width, w); tcv.height = Math.max(tcv.height, h); }
    t.clearRect(0, 0, tcv.width, tcv.height); t.font = size + 'px ' + FONT; t.textBaseline = 'top'; t.fillStyle = '#000'; t.fillText(str, 2, 2);
    const d = t.getImageData(0, 0, w, h).data;
    const ox = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x) - 2, oy = Math.round(y) - 2;
    const pts = []; for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) if (d[(yy * w + xx) * 4 + 3] > 110) pts.push(xx, yy);
    if (shadow) { c.fillStyle = shadow; for (let i = 0; i < pts.length; i += 2) c.fillRect(ox + pts[i] + 1, oy + pts[i + 1] + 1, 1, 1); }
    c.fillStyle = col; for (let i = 0; i < pts.length; i += 2) c.fillRect(ox + pts[i], oy + pts[i + 1], 1, 1);
    return w - 4;
  }
  function tw(str, size) { const t = tcv.getContext('2d'); t.font = size + 'px ' + FONT; return Math.ceil(t.measureText(str).width); }

  // ── 면 음영: 같은 색으로 칠한 면마다 윗줄은 밝게, 아래로 갈수록 디더링 그림자, 오른쪽 끝은 한 톤 어둡게
  const KRGB = 0xff220c12;   // K (ABGR)
  function shadePass(cv) {
    const w = cv.width, h = cv.height, x2 = cv.getContext('2d', { willReadFrequently: true }), img = x2.getImageData(0, 0, w, h), a = new Uint32Array(img.data.buffer), src = a.slice();
    const tone = (v, f) => { const r = v & 255, g = (v >> 8) & 255, b = (v >> 16) & 255, k = f > 0 ? (q => q + (255 - q) * f) : (q => q * (1 + f)); return (v & 0xff000000) | (Math.round(k(b)) << 16) | (Math.round(k(g)) << 8) | Math.round(k(r)); };
    const up = new Uint8Array(w * h), dn = new Uint8Array(w * h);
    for (let x = 0; x < w; x++) {
      for (let y = 1; y < h; y++) { const i = y * w + x; up[i] = src[i] === src[i - w] ? Math.min(30, up[i - w] + 1) : 0; }
      for (let y = h - 2; y >= 0; y--) { const i = y * w + x; dn[i] = src[i] === src[i + w] ? Math.min(30, dn[i + w] + 1) : 0; }
    }
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x, v = src[i];
      if (v === KRGB || (v >>> 24) === 0) continue;
      const hh = up[i] + dn[i] + 1;
      if (hh < 3) continue;
      if (up[i] === 0 && src[i + 1] === v && src[i - 1] === v) { a[i] = tone(v, 0.16); continue; }
      if (src[i + 1] !== v && src[i + 1] !== KRGB && src[i - 1] === v) { a[i] = tone(v, -0.12); continue; }
      const k = up[i] / (hh - 1);
      if (k > 0.5 && on(x, y, (k - 0.5) * 1.1)) a[i] = tone(v, -0.16);
      else if (hh >= 8 && k < 0.22 && on(x + 2, y, 0.5 - k * 2)) a[i] = tone(v, 0.08);
    }
    x2.putImageData(img, 0, 0);
  }

  // ── 방(고정 배경) ─ 책상 윗면 y 50~64, 바닥 y 66~
  const DT = 50;
  const MINT = '#27c4b0', MINT2 = '#17897c', MINT3 = '#6fe8d4', SKIN = '#f7cbb2', SKIN2 = '#e0a88e', HAIR = '#ff3b7a', HAIR2 = '#c42a5e', HAIR3 = '#ff86b0';
  function buildStatic(make) {
    const cv = make(GW, GH); c = cv.getContext('2d');
    const r = rng(7);
    // 벽: 세로 줄무늬
    px(0, 0, GW, DT, '#1d1534');
    for (let x = 0; x < GW; x += 8) px(x, 0, 4, DT, '#221a3d');
    px(0, 0, GW, 3, '#140e27'); px(0, 3, GW, 1, '#3a2d63');
    for (let i = 0; i < 40; i++) px(Math.floor(r() * GW), 6 + Math.floor(r() * 40), 1, 1, '#2d2350');
    // 창문 x 4~40, y 7~40
    const wx = 4, wy = 8, ww = 38, wh = 32;
    px(wx - 2, wy - 2, ww + 4, wh + 4, K); px(wx - 1, wy - 1, ww + 2, wh + 2, '#3b2f66');
    ['#0b0820', '#100c2c', '#161238', '#1d1744', '#251d52', '#33245e'].forEach((col, i) => px(wx, wy + i * 6, ww, i === 5 ? wh - 30 : 6, col));
    for (let i = 0; i < 14; i++) px(wx + Math.floor(r() * ww), wy + Math.floor(r() * 18), 1, 1, i % 4 ? '#9d8fd0' : '#f7e8b0');
    // 시계 달(게임 속 달처럼 시계 얼굴)
    for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) { const d = Math.hypot(dx, dy); if (d <= 5.2) px(wx + 26 + dx, wy + 7 + dy, 1, 1, d > 4.0 ? '#c9a24a' : '#ffe9a8'); }
    px(wx + 26, wy + 3, 1, 1, '#c9a24a'); px(wx + 26, wy + 11, 1, 1, '#c9a24a'); px(wx + 22, wy + 7, 1, 1, '#c9a24a'); px(wx + 30, wy + 7, 1, 1, '#c9a24a');
    px(wx + 26, wy + 5, 1, 3, '#c9a24a'); px(wx + 27, wy + 7, 2, 1, '#c9a24a');
    // 먼 빌딩 + 가까운 빌딩(불 켜진 창)
    let bx = wx; while (bx < wx + ww) { const bw = 5 + Math.floor(r() * 6), bh = 10 + Math.floor(r() * 10); px(bx, wy + wh - bh, Math.min(bw, wx + ww - bx), bh, '#1a1640'); bx += bw + 1; }
    bx = wx - 2; while (bx < wx + ww) {
      const bw = 8 + Math.floor(r() * 7), bh = 8 + Math.floor(r() * 14), top = wy + wh - bh, x0 = Math.max(wx, bx), x1 = Math.min(wx + ww, bx + bw);
      if (x1 > x0) {
        px(x0, top, x1 - x0, bh, '#262055'); px(x0, top, x1 - x0, 1, '#352d70');
        for (let yy = top + 2; yy < wy + wh - 1; yy += 3) for (let xx = bx + 2; xx < bx + bw - 2; xx += 3) { if (xx < wx || xx >= wx + ww) continue; const v = r(); if (v < 0.4) px(xx, yy, 1, 1, v < 0.1 ? '#ffe9a8' : '#ffc94a'); else if (v < 0.5) px(xx, yy, 1, 1, '#3c63a8'); }
      }
      bx += bw + 1;
    }
    // 창틀
    px(wx + ww / 2 - 1, wy, 2, wh, '#3b2f66'); px(wx, wy + 13, ww, 2, '#3b2f66'); px(wx - 3, wy + wh + 1, ww + 6, 2, '#4c3f80'); px(wx - 3, wy + wh + 3, ww + 6, 1, K);
    // 화분(창턱)
    px(wx + 3, wy + wh - 4, 5, 4, '#c4683a'); px(wx + 3, wy + wh - 4, 5, 1, '#e08850'); px(wx + 5, wy + wh - 9, 1, 5, '#2f8a5a'); px(wx + 3, wy + wh - 7, 2, 1, '#3fae6c'); px(wx + 6, wy + wh - 8, 2, 1, '#3fae6c');
    // 달력(11월, 20일 동그라미)
    const kx = 88, ky = 7;
    px(kx - 1, ky - 1, 20, 24, K); px(kx, ky, 18, 22, '#f4efe2'); px(kx, ky, 18, 6, '#e2483b'); px(kx, ky + 6, 18, 1, '#a8302a');
    px(kx + 4, ky - 3, 2, 3, '#8c8aa0'); px(kx + 12, ky - 3, 2, 3, '#8c8aa0');
    digits('11', kx + 5, ky + 1, '#f4efe2');
    for (let i = 0; i < 15; i++) { const col = i % 5, row = Math.floor(i / 5); px(kx + 2 + col * 3, ky + 9 + row * 4, 2, 2, col === 0 ? '#e9b3ad' : '#c9c1ae'); }
    px(kx + 11, ky + 12, 4, 1, '#e2483b'); px(kx + 11, ky + 16, 4, 1, '#e2483b'); px(kx + 11, ky + 13, 1, 3, '#e2483b'); px(kx + 14, ky + 13, 1, 3, '#e2483b');
    // 포스트잇
    for (const [x, y, col] of [[58, 23, '#ffd23f'], [68, 27, '#ff8ab8'], [60, 33, '#7fe0c4']]) { px(x, y, 8, 7, K); px(x + 1, y + 1, 6, 5, col); px(x + 2, y + 3, 4, 1, '#5a4a6a'); px(x + 2, y + 5, 3, 1, '#5a4a6a'); }
    // 책상 윗면 + 가장자리
    px(0, DT, GW, 14, '#8a5a34'); px(0, DT, GW, 1, '#a8724a'); px(0, DT + 5, GW, 1, '#7a4a2a'); px(0, DT + 10, GW, 1, '#7a4a2a');
    for (let x = 0; x < GW; x += 26) { px(x + 6, DT + 2, 8, 1, '#8c5834'); px(x + 16, DT + 7, 6, 1, '#6b3f22'); }
    px(0, DT + 14, GW, 2, '#4a2a16');
    // 바닥(마룻바닥)
    px(0, DT + 16, GW, GH - DT - 16, '#2a1a2c');
    for (let x = 0; x < GW; x += 10) { px(x, DT + 16, 5, GH - DT - 16, '#2f1d36'); px(x + 5, DT + 16, 1, GH - DT - 16, '#221630'); }
    // 책상 다리(양끝)
    px(0, DT + 16, 5, 6, '#4a2a16'); px(GW - 5, DT + 16, 5, 6, '#4a2a16');
    // 원고 더미 (왼쪽)
    const books = [['#e2483b', 20], ['#3a6fd8', 18], ['#f4efe2', 21], ['#1fae8c', 19], ['#f2b134', 20], ['#f4efe2', 18], ['#6a4cc9', 16]];
    let yy = DT + 13;
    books.forEach(([col, w], i) => { const h = col === '#f4efe2' ? 2 : 3, x = 6 + (i % 3); yy -= h; px(x - 1, yy - 1, w + 2, h + 2, K); px(x, yy, w, h, col); if (col !== '#f4efe2') px(x + 2, yy + 1, 6, 1, 'rgba(255,255,255,0)'); });
    px(14, yy - 5, 1, 5, '#e2483b');
    // 구겨진 종이·지우개·샤프
    px(28, DT + 11, 3, 2, '#ddd3c0'); px(100, DT + 12, 3, 2, '#ddd3c0'); px(30, DT + 8, 5, 1, '#3a6fd8'); px(96, DT + 9, 7, 1, '#9aa0b5');
    return cv;
  }

  // ── 움직이는 소품
  function clock(t) {
    const x = 58, y = 5;
    dfill(x - 2, y - 2, x + 29, y + 12, () => true, '#5a1830', 0.25);
    px(x - 1, y - 1, 28, 12, K); px(x, y, 26, 10, '#3b2f66'); px(x + 1, y + 1, 24, 8, '#0a0612');
    const col = '#ff2a3a', sx = x + 5;
    digits('03', sx, y + 2, col); if (Math.floor(t * 2) % 2 === 0) { px(sx + 8, y + 3, 1, 1, col); px(sx + 8, y + 5, 1, 1, col); } digits('00', sx + 10, y + 2, col);
    px(x + 23, y + 2, 1, 1, '#ff6b78');
  }
  function lamp() {
    const x = 142, y = 14;
    dPoly([[x - 4, y + 7], [x - 34, DT + 12], [x + 8, DT + 12], [x + 6, y + 7]], '#6a5a6a', 0.25);
    dPoly([[x - 2, y + 7], [x - 20, DT + 12], [x + 4, DT + 12], [x + 4, y + 7]], '#8c7a6a', 0.25);
    dEllipse(x - 12, DT + 10, 22, 3, '#c9a46a', 0.5);
    px(x + 6, DT + 7, 12, 5, K); px(x + 7, DT + 8, 10, 3, '#3a3550'); px(x + 7, DT + 8, 10, 1, '#5c5680');
    pline(x + 12, DT + 6, x + 11, y + 14, 2, '#4a4566'); pline(x + 11, y + 14, x + 4, y + 4, 2, '#4a4566');
    px(x - 6, y, 16, 6, K); px(x - 5, y + 1, 14, 4, '#f2b134'); px(x - 5, y + 1, 14, 1, '#ffd23f'); px(x - 4, y + 4, 12, 1, '#fff3b8');
  }
  function laptop(t) {
    const x = 46, y = 30;
    dEllipse(x + 24, DT + 11, 30, 3, '#4a6fb8', 0.25);
    px(x - 1, y - 1, 50, 29, K); px(x, y, 48, 27, '#9aa0b5'); px(x + 2, y + 2, 44, 23, '#1b1d33'); px(x + 3, y + 3, 42, 21, '#24345e');
    px(x + 3, y + 3, 42, 3, '#3a4f86'); px(x + 4, y + 4, 1, 1, '#e2483b'); px(x + 6, y + 4, 1, 1, '#f2b134'); px(x + 8, y + 4, 1, 1, '#1fae8c');
    [20, 24, 14, 22, 17, 8].forEach((w, i) => px(x + 6, y + 8 + i * 2, w, 1, i === 5 ? '#ffd23f' : '#9db7e8'));
    px(x + 32, y + 8, 9, 7, '#00c2d1'); px(x + 33, y + 9, 7, 5, '#0a4f6e');
    if (Math.floor(t * 2) % 2) px(x + 15, y + 19, 1, 2, '#ffffff');
    px(x - 3, y + 27, 54, 3, '#7d8296'); px(x - 3, y + 27, 54, 1, '#c3c8d8'); px(x - 4, y + 30, 56, 1, K);
  }
  function mug() {
    const x = 102, y = DT + 3;
    px(x - 1, y - 1, 8, 10, K); px(x, y, 6, 8, '#e8e4f4'); px(x + 4, y, 2, 8, '#c3bed6'); px(x + 1, y + 1, 4, 1, '#4a2a16');
    px(x + 6, y + 2, 2, 4, K); px(x + 6, y + 3, 1, 2, '#e8e4f4'); px(x + 2, y + 4, 2, 2, '#e2483b');
  }

  // ── 스마트폰: 거치대에 세워 둠. 프로필 사진 없이 이름·타이머·버튼을 모두 가운데 정렬
  function phone(t, ot, cue, state) {
    const shake = state === 'ring' ? (Math.floor(t * 30) % 2 ? 1 : -1) : 0;
    const bx = 111 + shake, by = 21, sx = bx + 3, cx = sx + 10;
    const gcol = state === 'shout' ? '#7a2a4a' : '#3a5a8a', glv = state === 'ring' ? (Math.floor(t * 8) % 2 ? 0.38 : 0.25) : 0.19;
    dEllipse(bx + 13, by + 20, 30, 28, gcol, glv); dEllipse(bx + 13, by + 20, 20, 22, gcol, glv * 0.6);
    dEllipse(bx + 13, DT + 11, 22, 3, state === 'shout' ? '#c4506a' : '#6a9ad8', 0.5);
    px(bx + 3, DT + 11, 20, 3, '#3a3550'); px(bx + 3, DT + 11, 20, 1, '#5c5680');
    px(bx - 1, by - 1, 28, 42, K); px(bx, by, 26, 40, '#2b2840'); px(bx, by, 26, 1, '#4a4566');
    px(bx + 10, by + 2, 6, 1, '#0d0a18');
    const bg = state === 'shout' ? (Math.floor(t * 6) % 2 ? '#5a1830' : '#431226') : state === 'ring' ? (Math.floor(t * 4) % 2 ? '#1f3a66' : '#1a3058') : '#16284a';
    px(sx, 27, 20, 28, bg);
    // 상태바(가운데 점 세 개)
    px(cx - 3, 29, 1, 1, '#cfe0ff'); px(cx - 1, 29, 1, 1, '#cfe0ff'); px(cx + 1, 29, 1, 1, '#cfe0ff'); px(cx + 3, 29, 1, 1, '#cfe0ff');
    // 이름은 글자로(draw 에서), 아래는 점 3개(수신 중) 또는 타이머
    if (state === 'ring') { for (let i = 0; i < 3; i++) if (i <= Math.floor(t * 3) % 3) px(cx - 4 + i * 3, 43, 2, 2, '#9db7e8'); }
    else {
      const s = Math.max(0, Math.floor(ot - cue.ringEnd)), str = '00:' + String(s % 60).padStart(2, '0'), col = state === 'shout' ? '#ff8aa0' : '#2ecc71';
      digits(str, Math.round(cx - digW(str) / 2), 42, col);
    }
    // 버튼(가운데)
    if (state === 'ring') {
      px(cx - 9, 48, 7, 5, '#e2483b'); px(cx - 7, 50, 3, 1, '#ffffff');
      const g = Math.floor(t * 6) % 2; px(cx + 2 - g, 48 - g, 7 + g * 2, 5 + g * 2, '#2ecc71'); px(cx + 4, 50, 3, 1, '#ffffff'); px(cx + 5, 49, 1, 3, '#ffffff');
    } else { px(cx - 4, 48, 8, 5, '#e2483b'); px(cx - 2, 50, 4, 1, '#ffffff'); }
    if (state === 'ring') {
      const o = Math.floor(t * 10) % 2 * 2;
      for (let i = 0; i < 2; i++) { px(bx - 4 - i * 3 - o, by + 12 - i * 2, 1, 10 + i * 4, '#ffd23f'); px(bx + 29 + i * 3 + o, by + 12 - i * 2, 1, 10 + i * 4, '#ffd23f'); }
    } else if (state === 'shout') {
      for (let i = 0; i < 3; i++) { const rad = 14 + Math.floor(((t * 30 + i * 11) % 33) / 2) * 2; if (rad > 36) continue; pline(bx + 13 - rad, by + 4, bx + 13 - rad + 2, by - 2, 1, rad < 26 ? '#ff5a7a' : '#a8344e'); pline(bx + 13 + rad, by + 4, bx + 13 + rad - 2, by - 2, 1, rad < 26 ? '#ff5a7a' : '#a8344e'); }
    }
    return { cx: cx, nameY: 33 };
  }

  // ── 작가(뒷모습). 의자 등받이 + 후드티 + 분홍 머리
  function chair() {
    ro(52, 60, 36, 21, 7, '#3a2f6a');
    ro(50, 77, 40, 5, 2, '#2a2150');
    px(68, 82, 4, 4, K); px(69, 82, 2, 4, '#4a4566');
    px(55, 86, 30, 2, K); px(56, 86, 28, 1, '#4a4566');
    for (const x of [53, 68, 83]) { px(x - 1, 87, 4, 3, K); px(x, 87, 2, 2, '#8c87b0'); }
  }
  function spikes(hx, hy, n, wob) {   // 뾰족 머리카락(뒤에서 본 머리 위)
    const xs = [hx + 1, hx + 5, hx + 9, hx + 13];
    xs.slice(0, n).forEach((x, i) => { const h = (i % 2 ? 7 : 6) + wob; ro(x, hy - h + 3, 4, h, 1, HAIR); px(x + 1, hy - h + 4, 1, h - 4, HAIR3); });
  }
  function headBack(hx, hy) {   // 18x14 둥근 뒤통수
    ro(hx, hy, 18, 14, 6, HAIR); px(hx + 3, hy + 2, 9, 2, HAIR3); px(hx + 3, hy + 6, 2, 3, HAIR3);
    px(hx - 1, hy + 8, 2, 4, SKIN2); px(hx + 17, hy + 8, 2, 4, SKIN2);   // 귀
    px(hx, hy + 8, 1, 3, SKIN); px(hx + 17, hy + 8, 1, 3, SKIN);
  }
  function writerSleep(t) {
    const br = Math.floor(t * 1.25) % 2;
    chair();
    // 책상 위에 포갠 팔(소매) + 손
    ro(42, 57, 56, 8, 3, MINT); px(44, 62, 52, 1, MINT2); ro(38, 58, 5, 5, 1, SKIN); ro(97, 58, 5, 5, 1, SKIN);
    ro(54, 55 + br, 32, 22, 8, MINT); ro(62, 53 + br, 16, 7, 3, MINT2);
    spikes(61, 49 + br, 4, 0); headBack(61, 49 + br);
  }
  function writerAwake(t, k) {
    const pop = k < 0.12 ? -3 : k < 0.24 ? -1 : 0, w = Math.floor(t * 10) % 2;
    chair();
    // 번쩍 든 두 팔
    pline(55, 58 + pop, 46, 40 + pop, 7, K); pline(85, 58 + pop, 94, 40 + pop, 7, K);
    pline(55, 58 + pop, 46, 40 + pop, 5, MINT); pline(85, 58 + pop, 94, 40 + pop, 5, MINT);
    ro(42, 33 + pop - w, 7, 7, 2, SKIN); ro(91, 33 + pop - w, 7, 7, 2, SKIN);
    ro(54, 51 + pop, 32, 26, 8, MINT); ro(62, 49 + pop, 16, 8, 3, MINT2);
    px(66, 44 + pop, 8, 7, SKIN2); px(66, 44 + pop, 8, 1, SKIN);
    spikes(61, 31 + pop, 4, 1); headBack(61, 31 + pop);
    // 느낌표 + 식은땀 + 충격선
    const ec = Math.floor(t * 8) % 2 ? '#ffd23f' : '#ff3b6b', ex = 69, ey = 17 + pop;
    px(ex - 1, ey - 1, 5, 8, K); px(ex, ey, 3, 6, ec); px(ex - 1, ey + 7, 5, 4, K); px(ex, ey + 8, 3, 2, ec);
    const d = Math.floor(t * 6) % 3;
    for (const sx of [56, 84]) { px(sx, 34 + d + pop, 2, 3, '#5ab0ff'); px(sx, 34 + d + pop, 1, 1, '#d8f0ff'); }
    const r0 = 22 + w * 2;
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.42; pline(70 + Math.cos(a) * r0, 38 + Math.sin(a) * r0, 70 + Math.cos(a) * (r0 + 5), 38 + Math.sin(a) * (r0 + 5), 1, '#ffd23f'); }
  }
  function zGlyph(x, y, s, col) {
    const g = ['11111', '00010', '00100', '01000', '11111'];
    for (const [dx, dy, cc] of [[-1, 0, K], [1, 0, K], [0, -1, K], [0, 1, K], [0, 0, col]]) for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) if (g[j][i] === '1') px(x + dx + i * s, y + dy + j * s, s, s, cc);
  }
  function zzz(t, alpha) {
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.45 + i / 3) % 1;
      if (1 - k > alpha * 1.4 || k > 0.85) continue;
      zGlyph(Math.round(84 + k * 14 + Math.sin(k * 6) * 2), Math.round(46 - k * 28), i === 1 ? 2 : 1, k < 0.5 ? '#d8d0f4' : '#8f84c8');
    }
  }

  // ── 말풍선(편집자 표시 없음). 칸은 장면과 같은 굵기, 글자는 320x180 도트 글자
  function bubble(ot, t, line, big) {
    const [lt, le, str] = line;
    const n = Math.min(str.length, Math.floor((ot - lt) / Math.max(0.05, (le - lt) / str.length)) + 1);
    const size = big ? 24 : 12;
    const bw = Math.ceil((tw(str, size) + 16) / 2), bh = Math.ceil((size + 12) / 2);
    let bx = Math.round(Math.max(3, Math.min(GW - bw - 3, 120 - bw / 2))), by = 3;
    if (big && Math.floor(t * 16) % 2) bx += 1;
    if (ot - lt < 0.06) by -= 2;
    const paper = big ? '#fff1f4' : '#f7f3ff', shade = big ? '#ffc4d4' : '#d6cdf0';
    const g = (x, y, w, h, col) => px(x * 2, y * 2, w * 2, h * 2, col);
    g(bx + 1, by + 1, bw, bh, '#05030b');
    g(bx - 1, by + 1, bw + 2, bh - 2, K); g(bx + 1, by - 1, bw - 2, bh + 2, K); g(bx, by, bw, bh, K);
    g(bx + 1, by + 1, bw - 2, bh - 2, paper); g(bx + 1, by + bh - 2, bw - 2, 1, shade); g(bx + 2, by + 2, 1, 1, '#ffffff');
    const tx = Math.max(bx + 4, Math.min(bx + bw - 9, 121));
    for (let i = 0; i < 4; i++) { g(tx + i - 1, by + bh - 1 + i, 8 - i * 2, 1, K); if (6 - i * 2 > 0) g(tx + i, by + bh - 1 + i, 6 - i * 2, 1, i ? paper : shade); }
    ptext(str.slice(0, n), bx * 2 + 8, by * 2 + 6, size, big ? '#c4102e' : '#1a1423', 'left', big ? '#ffb0c4' : '#cfc6ea');
    if (n === str.length && Math.floor(t * 3) % 2) px((bx + bw - 3) * 2, (by + bh - 3) * 2, 3, 3, big ? '#c4102e' : '#1a1423');
  }

  // ── 그리기: 160x90 칸에 장면 → 음영 → 320x180 으로 키우고 글자·말풍선을 얹음
  let staticCv = null, gcv = null;
  function draw(ctx, ot, t, cue) {
    cue = cue || DEF;
    const make = (w, h) => { const e = document.createElement('canvas'); e.width = w; e.height = h; return e; };
    if (!staticCv) { staticCv = buildStatic(make); gcv = make(GW, GH); }
    const L = cue.lines, awake = ot >= L[4][0];
    const state = ot < cue.ringEnd ? 'ring' : ot >= L[2][0] ? 'shout' : 'call';
    c = gcv.getContext('2d', { willReadFrequently: true }); c.imageSmoothingEnabled = false;
    c.clearRect(0, 0, GW, GH); c.drawImage(staticCv, 0, 0);
    clock(t); lamp(); laptop(t); mug();
    const ph = phone(t, ot, cue, state);
    if (awake) writerAwake(t, ot - L[4][0]); else writerSleep(t);
    shadePass(gcv);
    if (!awake) zzz(t, ot < L[3][0] ? 1 : Math.max(0, 1 - (ot - L[3][0]) / 1.2));
    // 가장자리 어둡게(디더링 비네트)
    const edge = (x, y) => Math.max(Math.abs(x - GW / 2) / (GW / 2), Math.abs(y - GH / 2) / (GH / 2));
    dfill(0, 0, GW - 1, GH - 1, (x, y) => edge(x, y) > 0.94, '#05030b', 0.4);
    // 화면 흔들림(칸 단위): 13.6초부터
    let sx = 0, sy = 0;
    if (ot >= L[3][0]) { const a = 1 + Math.min(1, Math.floor((ot - L[3][0]) / 1.2)); sx = Math.round((Math.random() * 2 - 1) * a); sy = Math.round((Math.random() * 2 - 1) * a); }
    ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = K; ctx.fillRect(0, 0, SW, SH);
    ctx.drawImage(gcv, sx * 2, sy * 2, SW, SH);
    c = ctx;
    ptext('편집자', (ph.cx + sx) * 2, (ph.nameY + sy) * 2 + 2, 12, '#ffffff', 'center');
    let cur = null; for (const l of L) if (ot >= l[0]) cur = l;
    const nextStart = cur ? (L[L.indexOf(cur) + 1] || [cue.drop])[0] : 0;
    if (cur && ot < nextStart) bubble(ot, t, cur, cur[2] === '작가님' || cur[2] === '계세요?');
    ctx.restore();
  }

  root.MP = root.MP || {};
  root.MP.Opening = { draw, cue: DEF, size: [SW, SH] };
})(typeof window !== 'undefined' ? window : globalThis);
