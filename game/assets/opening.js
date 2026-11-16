/* 마감펑크 오프닝: 새벽 3시 작업실 (곡 인트로 0~17초)
 * 고밀도 픽셀: 내부 640x360 격자에 그림. 게임의 320x180 논리 좌표 ctx 에 그대로 호출하면 됨.
 *   MP.Opening.draw(ctx, ot, t[, cue])   ot = 곡 재생 시각(초), t = 화면용 시계(초)
 * 가사 타이밍(cue.lines)은 게임 쪽 CUE 와 같은 형식: [시작, 끝, '가사'].
 * 컷 구성: 와이드 → 폰 클로즈업 → 작가 클로즈업 → 와이드(흔들림) → 작가 기상 클로즈업 → 비상 배너 → 17초 밴드 사운드
 */
(function (root) {
  const W = 640, H = 360, DESK = 262;
  const DEF = {
    ringEnd: 1.75, drop: 17.0,
    lines: [[2.0, 3.1, '여보세요'], [5.8, 7.3, '작가님 마감이'], [9.3, 11.0, '펑크가 났어요 작가님'], [13.6, 14.2, '작가님'], [15.7, 16.3, '계세요?']]
  };
  const FONT = '"Mulmaru", sans-serif';
  const K = '#120c22';
  let c = null, b = null;            // 현재 그리는 컨텍스트
  const px = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w || 1, h || 1); };
  // ── 도트 전용 도구: 반투명·곡선 대신 4x4 디더링과 계단식 도형만 씀
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const on = (x, y, lv) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16 < lv;
  function dfill(x0, y0, x1, y1, test, col, lv) {   // test(x,y) 안쪽인 칸 중 lv 비율만큼 찍음
    c.fillStyle = col;
    for (let y = Math.floor(y0); y <= y1; y++) for (let x = Math.floor(x0); x <= x1; x++) if (test(x + 0.5, y + 0.5) && on(x, y, lv)) c.fillRect(x, y, 1, 1);
  }
  function dEllipse(cx, cy, rx, ry, col, lv) { dfill(cx - rx, cy - ry, cx + rx, cy + ry, (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1, col, lv); }
  function inPolyXY(P, x, y) { let r = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) r = !r; } return r; }
  function dPoly(P, col, lv) { const xs = P.map(p => p[0]), ys = P.map(p => p[1]); dfill(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), (x, y) => inPolyXY(P, x, y), col, lv); }
  function pline(x0, y0, x1, y1, w, col) {   // 계단식 선
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (let i = 0; i <= n; i++) px(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), w, w, col);
  }
  function pring(cx, cy, rx, ry, w, col, a0, a1) {   // 계단식 원(호)
    a0 = a0 || 0; a1 = a1 == null ? Math.PI * 2 : a1;
    const n = Math.ceil((rx + ry) * (a1 - a0));
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; px(Math.round(cx + Math.cos(a) * rx - w / 2), Math.round(cy + Math.sin(a) * ry - w / 2), w, w, col); }
  }
  // 글자: 안티에일리어싱을 걷어내 또렷한 도트로. outline 은 1칸 테두리 색
  const tcv = (typeof document !== 'undefined') ? document.createElement('canvas') : null;
  function ptext(str, x, y, size, col, align, outline, shadow) {
    if (!str) return 0;
    const t = tcv.getContext('2d', { willReadFrequently: true });
    t.font = size + 'px ' + FONT;
    const w = Math.ceil(t.measureText(str).width) + 4, h = Math.ceil(size * 1.3) + 4;
    if (tcv.width < w || tcv.height < h) { tcv.width = Math.max(tcv.width, w); tcv.height = Math.max(tcv.height, h); }
    t.clearRect(0, 0, tcv.width, tcv.height); t.font = size + 'px ' + FONT; t.textBaseline = 'top'; t.fillStyle = '#000'; t.fillText(str, 2, 2);
    const d = t.getImageData(0, 0, w, h).data;
    const ox = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x) - 2, oy = Math.round(y) - 2;
    const pts = []; for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) if (d[(yy * w + xx) * 4 + 3] > 110) pts.push(xx, yy);
    if (shadow) { c.fillStyle = shadow; for (let i = 0; i < pts.length; i += 2) c.fillRect(ox + pts[i] + 2, oy + pts[i + 1] + 2, 1, 1); }
    if (outline) { c.fillStyle = outline; for (let i = 0; i < pts.length; i += 2) c.fillRect(ox + pts[i] - 1, oy + pts[i + 1] - 1, 3, 3); }
    c.fillStyle = col; for (let i = 0; i < pts.length; i += 2) c.fillRect(ox + pts[i], oy + pts[i + 1], 1, 1);
    return w - 4;
  }
  function tw(str, size) { const t = tcv.getContext('2d'); t.font = size + 'px ' + FONT; return Math.ceil(t.measureText(str).width); }
  // 모서리를 계단식으로 깎은 사각형(+검은 외곽선)
  function rr(x, y, w, h, r, col, ol) {
    const row = (yy, inset, cc) => px(x + inset, yy, w - inset * 2, 1, cc);
    for (let i = 0; i < h; i++) { const d = Math.min(i, h - 1 - i); const inset = d < r ? Math.round(r - Math.sqrt(r * r - (r - d) * (r - d))) : 0; row(y + i, inset, col); }
  }
  function rro(x, y, w, h, r, col) { rr(x - 2, y - 2, w + 4, h + 4, r + 1, K); rr(x, y, w, h, r, col); }
  function rng(seed) { return () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }; }

  // ── 7세그먼트 숫자 (s = 칸 크기)
  const SEG = { 0: 0x3f, 1: 0x06, 2: 0x5b, 3: 0x4f, 4: 0x66, 5: 0x6d, 6: 0x7d, 7: 0x07, 8: 0x7f, 9: 0x6f };
  function seg(x, y, d, s, col, off) {
    const m = SEG[d], L = 4 * s, T = s;
    const parts = [[x + T, y, L, T], [x + T + L, y + T, T, L], [x + T + L, y + 2 * T + L, T, L], [x + T, y + 2 * T + 2 * L, L, T], [x, y + 2 * T + L, T, L], [x, y + T, T, L], [x + T, y + T + L, L, T]];
    parts.forEach((p, i) => { if (m >> i & 1) px(p[0], p[1], p[2], p[3], col); else if (off) px(p[0], p[1], p[2], p[3], off); });
  }
  function segStr(x, y, str, s, col, off, colonOn) {
    for (const ch of str) {
      if (ch === ':') { if (colonOn) { px(x + s, y + 2 * s, s * 2, s * 2, col); px(x + s, y + 6 * s, s * 2, s * 2, col); } x += s * 4; continue; }
      seg(x, y, +ch, s, col, off); x += s * 8;
    }
  }

  // ── 정적 배경(벽, 창문, 달력, 책상 몸체) 한 번만 그려 둠
  function buildStatic(make) {
    const cv = make(W, H); c = cv.getContext('2d');
    // 벽지: 세로 줄무늬 + 은은한 점 무늬
    px(0, 0, W, DESK, '#1d1534');
    for (let x = 0; x < W; x += 32) { px(x, 0, 16, DESK, '#221a3d'); px(x + 16, 0, 1, DESK, '#2a2148'); }
    const r = rng(7); for (let i = 0; i < 120; i++) px(Math.floor(r() * W), Math.floor(r() * 220) + 14, 1, 1, '#2d2350');
    px(0, 0, W, 10, '#140e27'); px(0, 10, W, 2, '#3a2d63');           // 천장 몰딩
    // 창문 (x 36~244, y 34~178)
    const wx = 36, wy = 34, ww = 208, wh = 144;
    px(wx - 6, wy - 6, ww + 12, wh + 12, '#0d0919'); px(wx - 4, wy - 4, ww + 8, wh + 8, '#3b2f66'); px(wx - 2, wy - 2, ww + 4, wh + 4, '#2a2150');
    const bands = ['#0b0820', '#100c2c', '#161238', '#1d1744', '#251d52', '#33245e', '#4a2c66'];
    bands.forEach((col, i) => px(wx, wy + i * 18, ww, 18 + (i === bands.length - 1 ? 30 : 0), col));
    for (let i = 0; i < 40; i++) { const sx = wx + Math.floor(r() * ww), sy = wy + Math.floor(r() * 80); px(sx, sy, 1, 1, i % 7 ? '#9d8fd0' : '#f7e8b0'); if (i % 9 === 0) { px(sx - 1, sy, 3, 1, '#f7e8b0'); px(sx, sy - 1, 1, 3, '#f7e8b0'); } }
    // 시계 달 (게임 속 달과 같은 모양을 2배로)
    if (root.MP && MP.buildSprites) { try { const S = MP.buildSprites(make); c.imageSmoothingEnabled = false; c.drawImage(S.moon, wx + 140, wy + 12, 48, 48); } catch (e) { } }
    // 구름 한 줄
    for (const [cx, cy, cw] of [[wx + 8, wy + 70, 46], [wx + 120, wy + 58, 38]]) { px(cx, cy, cw, 4, '#2c2459'); px(cx + 6, cy - 3, cw - 16, 3, '#2c2459'); px(cx + 4, cy + 4, cw - 6, 1, '#221c48'); }
    // 먼 빌딩
    let bx = wx; while (bx < wx + ww) { const bw = 12 + Math.floor(r() * 14), bh = 40 + Math.floor(r() * 40); px(bx, wy + wh - bh, bw, bh, '#1a1640'); bx += bw + 1; }
    // 가까운 빌딩 + 불 켜진 창
    bx = wx - 4; while (bx < wx + ww) {
      const bw = 20 + Math.floor(r() * 18), bh = 34 + Math.floor(r() * 56), top = wy + wh - bh;
      px(bx, top, bw, bh, '#262055'); px(bx, top, bw, 2, '#352d70'); px(bx + bw - 3, top, 3, bh, '#1e1946');
      if (r() < 0.5) { px(bx + 4, top - 8, 1, 8, '#4a4290'); px(bx + 3, top - 9, 3, 1, '#ff3b6b'); }
      for (let yy = top + 6; yy < wy + wh - 4; yy += 7) for (let xx = bx + 3; xx < bx + bw - 5; xx += 6) {
        const v = r(); if (v < 0.38) { px(xx, yy, 3, 4, v < 0.1 ? '#ffe9a8' : '#ffc94a'); px(xx, yy + 3, 3, 1, '#c9902a'); } else if (v < 0.5) px(xx, yy, 3, 4, '#3c63a8');
      }
      bx += bw + 2;
    }
    // 유리 반사광 + 창틀
    for (let i = 0; i < 3; i++) { const P = [[wx + 20 + i * 70, wy], [wx + 34 + i * 70, wy], [wx + 4 + i * 70 + 10, wy + wh], [wx - 10 + i * 70, wy + wh]].map(([x, y]) => [Math.max(wx, Math.min(wx + ww, x)), y]); dPoly(P, '#8f84c8', 0.19); }
    px(wx + ww / 2 - 3, wy, 6, wh, '#3b2f66'); px(wx + ww / 2 - 1, wy, 2, wh, '#4c3f80');
    px(wx, wy + 62, ww, 6, '#3b2f66'); px(wx, wy + 64, ww, 2, '#4c3f80');
    px(wx - 12, wy + wh + 4, ww + 24, 6, '#4c3f80'); px(wx - 12, wy + wh + 10, ww + 24, 3, '#1a1333');   // 창턱
    // 창턱 위 작은 화분
    px(wx + 6, wy + wh - 8, 14, 12, '#c4683a'); px(wx + 6, wy + wh - 8, 14, 2, '#e08850'); px(wx + 9, wy + wh - 20, 2, 12, '#2f8a5a'); px(wx + 12, wy + wh - 24, 2, 16, '#3fae6c'); px(wx + 15, wy + wh - 18, 2, 10, '#2f8a5a'); px(wx + 4, wy + wh - 22, 6, 3, '#3fae6c'); px(wx + 15, wy + wh - 26, 6, 3, '#3fae6c');
    // 달력 (11월, 20일에 빨간 동그라미 = 발매일)
    const kx = 432, ky = 40;
    px(kx - 2, ky - 2, 84, 100, K); px(kx, ky, 80, 96, '#f4efe2'); px(kx, ky, 80, 22, '#e2483b'); px(kx, ky + 22, 80, 2, '#a8302a');
    px(kx + 18, ky - 6, 4, 10, '#8c8aa0'); px(kx + 58, ky - 6, 4, 10, '#8c8aa0');
    segStr(kx + 26, ky + 4, '11', 2, '#f4efe2');
    for (let i = 0; i < 30; i++) { const col = i % 7, row = Math.floor(i / 7), x = kx + 6 + col * 10, y = ky + 30 + row * 12; px(x, y, 6, 6, col === 0 ? '#e9b3ad' : '#d8d1c0'); if (i < 15) { px(x, y, 6, 1, '#7f7a8c'); px(x, y + 3, 6, 1, '#7f7a8c'); px(x, y, 1, 6, '#7f7a8c'); px(x + 5, y, 1, 6, '#7f7a8c'); } }
    { const x = kx + 6 + 5 * 10, y = ky + 30 + 2 * 12; pring(x + 3, y + 3, 7, 6, 2, '#e2483b'); }
    px(kx + 50, ky + 88, 26, 2, '#e2483b');
    // 벽에 붙은 포스트잇
    for (const [x, y, col, a] of [[262, 112, '#ffd23f', 0], [292, 120, '#ff8ab8', 1], [276, 140, '#7fe0c4', 0]]) { px(x, y, 22, 22, col); px(x, y, 22, 3, 'rgba(0,0,0,0.12)'); px(x + 4, y + 8, 12, 1, '#5a4a6a'); px(x + 4, y + 12, 9 + a * 4, 1, '#5a4a6a'); px(x + 4, y + 16, 11, 1, '#5a4a6a'); }
    px(264, 114, 14, 2, '#e2483b'); px(280, 114, 2, 2, '#e2483b');
    // 책상 상판 + 서랍
    px(0, DESK - 4, W, 4, '#a8724a'); px(0, DESK, W, 8, '#7a4a2a'); px(0, DESK + 8, W, 2, '#4a2a16');
    px(0, DESK + 10, W, H - DESK - 10, '#5b3520');
    for (let i = 0; i < 4; i++) {
      const dx = 20 + i * 156, dy = DESK + 22;
      px(dx, dy, 136, 66, '#4a2a16'); px(dx + 2, dy + 2, 132, 62, '#6b3f22'); px(dx + 2, dy + 2, 132, 2, '#875230');
      px(dx + 54, dy + 26, 28, 6, '#2e1a0d'); px(dx + 56, dy + 26, 24, 4, '#e0b04a'); px(dx + 56, dy + 26, 24, 1, '#ffd98a');
    }
    for (let x = 0; x < W; x += 52) px(x + 10, DESK + 3, 20, 1, '#8c5834');
    // 원고 더미 (왼쪽)
    const books = [['#e2483b', 70], ['#3a6fd8', 64], ['#f4efe2', 74], ['#1fae8c', 66], ['#f2b134', 72], ['#f4efe2', 70], ['#6a4cc9', 62]];
    let yy = DESK - 4;
    books.forEach(([col, w], i) => { const h = col === '#f4efe2' ? 6 : 8, x = 28 + (i % 3) * 3; yy -= h; px(x - 1, yy - 1, w + 2, h + 2, K); px(x, yy, w, h, col); px(x, yy, w, 1, 'rgba(255,255,255,0.35)'); if (col === '#f4efe2') for (let k = 2; k < h; k += 2) px(x + w - 2, yy + k, 2, 1, '#bdb4a0'); else px(x + 6, yy + 3, 18, 2, 'rgba(255,255,255,0.5)'); });
    px(60, yy - 12, 4, 14, '#e2483b'); px(60, yy - 12, 4, 2, '#ff6b5b');                       // 책갈피
    px(36, DESK - 6, 14, 2, '#3a6fd8'); px(108, DESK - 6, 22, 2, '#9aa0b5'); px(128, DESK - 6, 3, 2, '#e2483b');  // 지우개, 샤프
    for (const [x, y] of [[120, DESK - 10], [150, DESK - 8]]) { px(x, y, 10, 8, '#ddd3c0'); px(x + 2, y + 2, 4, 2, '#bdb4a0'); px(x + 6, y + 5, 3, 1, '#bdb4a0'); } // 구겨진 종이
    return cv;
  }

  // ── 노트북
  function laptop(t) {
    const x = 138, y = 186;
    dEllipse(x + 46, DESK - 6, 70, 10, '#4a6fb8', 0.25);
    px(x - 2, y - 2, 96, 70, K); px(x, y, 92, 66, '#9aa0b5'); px(x + 4, y + 4, 84, 58, '#1b1d33');
    px(x + 6, y + 6, 80, 54, '#24345e');
    px(x + 6, y + 6, 80, 7, '#3a4f86'); px(x + 9, y + 8, 3, 3, '#e2483b'); px(x + 14, y + 8, 3, 3, '#f2b134'); px(x + 19, y + 8, 3, 3, '#1fae8c');
    px(x + 26, y + 8, 40, 2, '#cfe0ff');
    for (let i = 0; i < 6; i++) px(x + 12, y + 18 + i * 6, [52, 60, 38, 56, 44, 20][i], 2, i === 5 ? '#ffd23f' : '#9db7e8');
    if (Math.floor(t * 2) % 2) px(x + 34, y + 47, 2, 6, '#ffffff');
    px(x + 60, y + 18, 20, 14, '#00c2d1'); px(x + 62, y + 20, 16, 10, '#0a4f6e');
    px(x - 10, y + 66, 112, 6, '#7d8296'); px(x - 10, y + 66, 112, 1, '#c3c8d8'); px(x - 12, y + 72, 116, 2, '#3c3f52');
  }
  // ── 스탠드 조명
  function lamp(t, glow) {
    const x = 560, y = 120;
    // 불빛: 두 겹 디더링 원뿔(안쪽이 더 촘촘)
    dPoly([[x - 8, y + 18], [x - 100, DESK - 4], [x + 40, DESK - 4], [x + 18, y + 18]], '#6a5a6a', 0.25);
    dPoly([[x - 2, y + 18], [x - 60, DESK - 4], [x + 22, DESK - 4], [x + 12, y + 18]], '#8c7a6a', 0.25);
    dEllipse(x - 30, DESK - 6, 66, 6, '#c9a46a', 0.5);
    px(x + 36, DESK - 8, 40, 8, '#3a3550'); px(x + 36, DESK - 8, 40, 2, '#5c5680');
    px(x + 52, y + 50, 6, DESK - y - 58, '#4a4566'); px(x + 50, y + 46, 10, 8, '#8c87b0');
    pline(x + 52, y + 48, x + 18, y + 6, 5, '#4a4566');
    px(x - 16, y, 44, 16, K); px(x - 14, y + 2, 40, 12, '#f2b134'); px(x - 14, y + 2, 40, 3, '#ffd23f'); px(x - 12, y + 14, 36, 4, '#fff3b8');
  }
  // ── 머그컵
  function mug(t) {
    const x = 352, y = DESK - 24;
    px(x - 1, y - 1, 22, 26, K); px(x, y, 20, 24, '#e8e4f4'); px(x + 14, y, 6, 24, '#c3bed6'); px(x + 2, y + 2, 16, 4, '#4a2a16');
    px(x + 20, y + 6, 6, 12, K); px(x + 21, y + 8, 3, 8, '#e8e4f4');
    px(x + 4, y + 10, 10, 8, '#e2483b'); px(x + 6, y + 12, 6, 1, '#ffffff'); px(x + 8, y + 12, 1, 4, '#ffffff'); px(x + 10, y + 12, 1, 4, '#ffffff'); px(x + 6, y + 16, 6, 1, '#ffffff');
  }

  // ── 작가 (분홍 머리, 민트 후드)
  const HAIR = '#ff3b7a', HAIR2 = '#c42a5e', HAIR3 = '#ff86b0', SKIN = '#f7cbb2', SKIN2 = '#e0a88e', HOOD = '#27c4b0', HOOD2 = '#17897c', HOOD3 = '#6fe8d4';
  function chair() { px(270, 196, 34, 70, K); px(272, 198, 30, 66, '#2e2552'); px(274, 200, 6, 60, '#3d3270'); px(272, 198, 30, 4, '#3d3270'); }
  // ── 작가 도트 스프라이트(게임 1배 픽셀 단위). 책상 윗면(y=131) 위에 세움
  const WPAL = { K, H: '#ff3b7a', h: '#c42a5e', i: '#ff86b0', S: '#f7cbb2', s: '#e0a88e', E: '#5c3a24', B: '#ff9aa8', D: '#bfe8ff', M: '#27c4b0', m: '#17897c', L: '#6fe8d4', w: '#ffffff', r: '#9f1239' };
  // 엎드려 자는 모습: 왼쪽으로 얼굴을 돌려 팔베개, 오른쪽은 둥근 등과 후드
  const W_SLEEP = [
    '.....K..K',
    '....KiKKiK.K',
    '...KHiKHiHKiK',
    '..KHHHHHHHHHHK.KKKKKKKKKK',
    '.KHHiiHHHHHHHhKKLLLLLLLLLKKK',
    '.KHiHHHHHHHHHhKLLMMMMMMMMLLLKK',
    '.KHHHHHHHHHHHhhKMMMMMMMMMMMMMMKK',
    'KHHHHHHHHHHHHhhKmMMMMMMMMMMMMMMMK',
    'KHHHHHHHHHHHhhKmmMMMMMMMMMMMMMmMMK',
    'KHHHhhHHHHHhhSKmmmMMMMMMMMMMMmmMMK',
    'KHHhSSSHHHhhSSKKmmmMMMMMMMMMmmmMMK',
    'KHhSSSSShhhSSSsKKmmmMMMMMMMmmmmMMK',
    'KhSSEEESSSSSSSsKLKmmmMMMMMmmmmmMMK',
    '.KSSSSSSSSBBSsKLLLKmmmMMMmmmmmmMMK',
    'KKKSSSSSSSSSsKLLLLLKmmmmmmmmmmmMMK',
    'KLLKKSSSSSSKKLLLLLLLKmmmmmmmmmMMMK',
    'KLLLLKKKDKKLLLLLLLLLLKmmmmmmmMMMMK',
    'KwSSKLLLLLLLLLLLLLLLLLKmmmmmMMMMMK',
    'KSSSKMMMMMMMMMMMMMMMMMMKmmmMMMMMMK',
    'KSSsKMMMMMMMMMMMMMMMMMMMKmMMMMMMMK',
    'KKKKKmmmmmmmmmmmmmmmmmmmmKMMMMMMMK',
  ];
  // 깜짝 놀라 벌떡: 정면, 두 손 번쩍
  const W_AWAKE = [
    '..........K.....K.....K',
    '.........KiK...KiK...KiK',
    '........KHiHK.KHiHK.KHiHK',
    '.......KHHHHHKHHHHHKHHHHHK',
    '......KHHiiHHHHHHHHHHHHHHHK',
    '.....KHHiHHHHHHHHHHHHHHHHHhK',
    '.....KHHHHHHHHHHHHHHHHHHHHhK',
    '....KHHHHHHHHHHHHHHHHHHHHHhhK',
    '....KHHHSSSSSSSSSSSSSSSSHHHhK',
    '....KHHSSSSSSSSSSSSSSSSSSHHhK',
    '....KHSSKKKKSSSSSSKKKKSSSSHhK',
    '....KHSKwwwwKSSSSKwwwwKSSSHK',
    '..K.KHSKwwKwKSSSSKwwKwKSSSHK.K',
    '.KSKKHSKwwKwKSSSSKwwKwKSSSHKKSK',
    '.KSSKKSSKKKKSSSSSSKKKKSSSSKKSSK',
    '.KSSSKSBBSSSSSKKSSSSSSBBSSKSSSK',
    '.KSSSKSSSSSSSKrrKSSSSSSSSSKSSSK',
    '..KSSKKSSSSSSKrrKSSSSSSSSKKSSK',
    '..KLLK.KKSSSSSKKSSSSSSSKKK.KLLK',
    '..KLLLK..KKKKSSSSSSKKKKK..KLLLK',
    '..KLLMMK.KMMKKKKKKKKMMMK.KMMLLK',
    '..KMMMMMKKMMMMMwMMwMMMMMKKMMMMK',
    '...KMMMMMMMMMMMwMMwMMMMMMMMMMK',
    '...KmMMMMMMMMMMwMMwMMMMMMMMMmK',
    '....KmMMMMMMMMMwMMwMMMMMMMMmK',
    '....KmmMMMMMMMMMMMMMMMMMMMmmK',
    '....KmmMMMMMMMMMMMMMMMMMMMmmK',
    '....KmmMMMMmmmmmmmmmmmMMMMmmK',
    '....KmmMMMMmMMMMMMMMMmMMMMmmK',
    '....KmmmMMMmmmmmmmmmmmMMMmmmK',
    '....KmmmMMMMMMMMMMMMMMMMMmmmK',
  ];
  function paintRows(rows, ox, oy, pal) { for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) { const col = pal[rows[y][x]]; if (col) px(ox + x, oy + y, 1, 1, col); } }
  const DESK1 = DESK / 2;
  function writerSleep1(t) {
    const br = Math.floor(t * 1.3) % 2;                       // 숨쉬기: 등이 1칸 오르내림
    const rows = br ? W_SLEEP.map((r, i) => i < 4 ? r.replace(/./g, (ch, x) => x >= 14 ? '.' : ch) : r) : W_SLEEP;
    paintRows(br ? W_SLEEP.slice(0) : W_SLEEP, 108, DESK1 - W_SLEEP.length - br, WPAL);
    if (br) paintRows(W_SLEEP.slice(-1), 108, DESK1 - 1, WPAL);
    if (Math.floor(t * 1.2) % 3 !== 0) px(116, DESK1 - 4, 1, 2, '#bfe8ff');
  }
  function writerAwake1(t, k) {
    const pop = k < 0.12 ? -4 : k < 0.24 ? -2 : 0, wav = Math.floor(t * 10) % 2;
    const ox = 129, oy = DESK1 - W_AWAKE.length + pop;
    paintRows(W_AWAKE, ox, oy, WPAL);
    if (wav) { px(ox + 1, oy + 12, 3, 1, K); px(ox + 27, oy + 12, 3, 1, K); }   // 손 떨림
    // 느낌표 + 식은땀 + 충격선
    const ec = Math.floor(t * 8) % 2 ? '#ffd23f' : '#ff3b6b', ex = ox + 14, ey = oy - 15;
    px(ex - 1, ey - 1, 5, 9, K); px(ex, ey, 3, 7, ec); px(ex - 1, ey + 9, 5, 5, K); px(ex, ey + 10, 3, 3, ec);
    const d = Math.floor(t * 6) % 3;
    for (const [sx, sy] of [[ox + 3, oy + 6], [ox + 29, oy + 8]]) { px(sx, sy + d, 2, 3, '#5ab0ff'); px(sx, sy + d - 1, 1, 1, '#5ab0ff'); px(sx, sy + d, 1, 1, '#d8f0ff'); }
    const r0 = 22 + wav * 2;
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.45; pline(ox + 15 + Math.cos(a) * r0, oy + 12 + Math.sin(a) * r0, ox + 15 + Math.cos(a) * (r0 + 6), oy + 12 + Math.sin(a) * (r0 + 6), 1, '#ffd23f'); }
  }
  function zzz1(t, alpha) {
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.45 + i / 3) % 1;
      if (1 - k > alpha * 1.4 || k > 0.85) continue;
      const s = i === 1 ? 2 : 1, x = Math.round(124 + k * 18), y = Math.round(100 - k * 30);
      const col = k < 0.5 ? '#d8d0f4' : '#8f84c8';
      px(x - 1, y - 1, 4 * s + 2, 5 * s + 2, K);
      px(x, y, 4 * s, s, col); for (let j = 1; j < 4; j++) px(x + Math.round((3 - j) * s * 1), y + j * s, s, s, col); px(x, y + 4 * s, 4 * s, s, col);
    }
  }

  // ── 스마트폰 (거치대에 세워 둠). state: ring | call | shout
  function phone(t, ot, cue, state) {
    const shake = state === 'ring' ? (Math.floor(t * 30) % 2 ? 2 : -2) : state === 'shout' ? (Math.floor(t * 20) % 2 ? 1 : -1) : 0;
    const x = 388 + shake, y = 100, w = 96, h = 160;
    // 화면 빛 번짐
    const gcol = state === 'shout' ? '#7a2a4a' : '#3a5a8a', glv = state === 'ring' ? (Math.floor(t * 8) % 2 ? 0.38 : 0.25) : 0.19;
    dEllipse(x + w / 2, y + h / 2, 82, 92, gcol, glv); dEllipse(x + w / 2, y + h / 2, 62, 76, gcol, glv * 0.6);
    dEllipse(x + w / 2, DESK - 6, 70, 6, state === 'shout' ? '#c4506a' : '#6a9ad8', 0.5);
    // 거치대
    px(x + 18 - shake, DESK - 12, 48, 12, '#3a3550'); px(x + 18 - shake, DESK - 12, 48, 2, '#5c5680'); px(x + 30 - shake, y + h - 6, 24, 10, '#2a2640');
    // 본체
    px(x - 2, y - 2, w + 4, h + 4, K); px(x, y, w, h, '#2b2840'); px(x + 2, y + 2, w - 4, 2, '#4a4566');
    px(x + 32, y + 6, 20, 3, '#0d0a18'); px(x + 56, y + 6, 3, 3, '#3a6fd8');
    const sx = x + 5, sy = y + 13, sw = w - 10, sh = h - 26;
    const bg = state === 'shout' ? (Math.floor(t * 6) % 2 ? '#5a1830' : '#431226') : state === 'ring' ? (Math.floor(t * 4) % 2 ? '#1f3a66' : '#1a3058') : '#16284a';
    px(sx, sy, sw, sh, bg);
    for (let i = 0; i < sh; i += 4) px(sx, sy + i, sw, 1, 'rgba(255,255,255,0.03)');
    // 상태바
    px(sx + 4, sy + 4, 4, 4, '#cfe0ff'); px(sx + 10, sy + 4, 4, 4, '#cfe0ff'); px(sx + 16, sy + 4, 4, 4, '#cfe0ff');
    px(sx + sw - 16, sy + 3, 11, 6, '#cfe0ff'); px(sx + sw - 15, sy + 4, 3, 4, '#e2483b'); px(sx + sw - 5, sy + 5, 1, 2, '#cfe0ff');
    // 편집자 아바타 카드
    const ax = sx + sw / 2 - 18, ay = sy + 14;
    const ring = state === 'ring' ? (Math.floor(t * 8) % 2 ? '#7fe0c4' : '#2ecc71') : state === 'shout' ? '#ff3b6b' : '#5ab0ff';
    px(ax - 2, ay - 2, 40, 40, ring); px(ax, ay, 36, 36, '#2a3f6e');
    px(ax + 8, ay + 8, 20, 18, SKIN); px(ax + 6, ay + 4, 24, 7, '#1e1b2e'); px(ax + 6, ay + 4, 4, 12, '#1e1b2e'); px(ax + 18, ay + 6, 10, 2, '#3a3550');
    px(ax + 9, ay + 13, 8, 5, '#0f0c1c'); px(ax + 19, ay + 13, 8, 5, '#0f0c1c'); px(ax + 17, ay + 14, 2, 1, '#0f0c1c');
    px(ax + 10, ay + 14, 3, 2, '#7fd4ff'); px(ax + 20, ay + 14, 3, 2, '#7fd4ff');
    px(ax + 15, ay + 21, 6, 1, state === 'shout' ? '#9f1239' : '#a0705a'); if (state === 'shout') px(ax + 15, ay + 20, 6, 3, '#9f1239');
    px(ax + 4, ay + 26, 28, 10, '#1e293b'); px(ax + 15, ay + 26, 6, 10, '#ffffff'); px(ax + 17, ay + 27, 2, 9, '#ff2a85');
    if (state === 'shout') { px(ax + 8, ay + 9, 6, 2, '#0f0c1c'); px(ax + 22, ay + 9, 6, 2, '#0f0c1c'); for (const [vx, vy] of [[ax + 28, ay + 2], [ax + 31, ay + 5]]) px(vx, vy, 3, 3, '#ff3b6b'); }
    // 이름 + 상태
    TXT.push(['편집자', Math.round((sx + sw / 2) / 2), Math.round((ay + 42) / 2), 12, '#ffffff', 'center']);
    if (state === 'ring') { for (let i = 0; i < 3; i++) if (i <= Math.floor(t * 3) % 3) px(sx + sw / 2 - 12 + i * 10, ay + 72, 4, 4, '#9db7e8'); }
    else { const s = Math.max(0, Math.floor(ot - cue.ringEnd)); TXT.push(['00:' + String(s % 60).padStart(2, '0'), Math.round((sx + sw / 2) / 2), Math.round((ay + 70) / 2), 12, state === 'shout' ? '#ff8aa0' : '#2ecc71', 'center']); }
    // 버튼
    const by = sy + sh - 22;
    if (state === 'ring') {
      px(sx + 9, by, 18, 14, '#e2483b'); px(sx + 13, by + 6, 10, 2, '#ffffff');
      const g = Math.floor(t * 6) % 2; px(sx + sw - 27 - g, by - g, 18 + g * 2, 14 + g * 2, '#2ecc71'); px(sx + sw - 22, by + 5, 8, 4, '#ffffff'); px(sx + sw - 22, by + 3, 2, 8, '#ffffff');
    } else {
      px(sx + sw / 2 - 10, by, 20, 14, '#e2483b'); px(sx + sw / 2 - 5, by + 6, 10, 2, '#ffffff');
      // 통화 음량 막대
      for (let i = 0; i < 7; i++) { const hh = state === 'shout' ? 1 + ((i * 5 + Math.floor(t * 18)) % 4) : 1 + ((i * 3 + Math.floor(t * 8)) % 2); px(sx + 13 + i * 7, by - 1 - hh, 4, hh, state === 'shout' ? '#ff8aa0' : '#5ab0ff'); }
    }
    // 진동 괄호 / 고함 파동
    if (state === 'ring') {
      const o = Math.floor(t * 10) % 2 * 3;
      for (let i = 0; i < 2; i++) { px(x - 10 - i * 7 - o, y + 40 - i * 8, 3, 30 + i * 16, '#ffd23f'); px(x + w + 7 + i * 7 + o, y + 40 - i * 8, 3, 30 + i * 16, '#ffd23f'); }
    } else if (state === 'shout') {
      for (let i = 0; i < 3; i++) { const r = 20 + Math.floor(((t * 60 + i * 22) % 66) / 4) * 4; if (r > 76) continue; pring(x + w / 2, y + 40, r + 40, r + 40, r < 50 ? 4 : 2, r < 50 ? '#ff5a7a' : '#a8344e', Math.PI * 1.2, Math.PI * 1.8); }
    }
  }

  // ── 벽시계 (7세그먼트)
  function clock(t, alarm) {
    const x = 284, y = 46;
    px(x - 4, y - 4, 128, 52, K); px(x - 2, y - 2, 124, 48, '#3b2f66'); px(x, y, 120, 44, '#0a0612');
    dfill(x - 8, y - 8, x + 127, y + 51, () => true, '#5a1830', 0.25); px(x - 4, y - 4, 128, 52, K); px(x - 2, y - 2, 124, 48, '#3b2f66'); px(x, y, 120, 44, '#0a0612');
    const on = alarm ? Math.floor(t * 6) % 2 : 1;
    segStr(x + 10, y + 7, '03:00', 3, on ? '#ff2a3a' : '#5a0f18', '#2a0a12', Math.floor(t * 2) % 2 === 0 || alarm);
    px(x + 106, y + 6, 6, 2, '#ff2a3a');
  }

  // ── 말풍선 (편집자). 글자는 목소리 구간 동안 한 글자씩
  // ── 말풍선 (게임 1배 좌표). 글자는 목소리 구간 동안 한 글자씩
  const SW = W / 2, SH = H / 2;
  function bubble(ot, t, line, tailX, big) {
    const [lt, le, str] = line;
    const n = Math.min(str.length, Math.floor((ot - lt) / Math.max(0.05, (le - lt) / str.length)) + 1);
    const size = big ? 24 : 12;
    const bw = tw(str, size) + 16, bh = size + 12;
    let bx = Math.round(Math.max(6, Math.min(SW - bw - 6, tailX - bw / 2))), by = 10;
    bx += big && Math.floor(t * 16) % 2 ? 1 : 0;
    if (ot - lt < 0.06) by -= 3;
    const paper = big ? '#fff1f4' : '#f7f3ff', shade = big ? '#ffc4d4' : '#d6cdf0';
    px(bx + 2, by + 2, bw + 1, bh + 1, '#05030b');
    px(bx - 1, by + 1, bw + 2, bh - 2, K); px(bx + 1, by - 1, bw - 2, bh + 2, K); px(bx, by, bw, bh, K);
    px(bx + 1, by + 1, bw - 2, bh - 2, paper); px(bx + 1, by + bh - 3, bw - 2, 2, shade); px(bx + 2, by + 2, 2, 1, '#ffffff');
    const tx = Math.max(bx + 8, Math.min(bx + bw - 14, tailX - 3));
    for (let i = 0; i < 4; i++) { px(tx + i - 1, by + bh - 1 + i, 9 - i * 2 + 1, 1, K); if (7 - i * 2 > 0) px(tx + i, by + bh - 1 + i, 7 - i * 2, 1, shade); }
    px(tx + 3, by + bh + 3, 2, 1, K);
    ptext(str.slice(0, n), bx + 8, by + 6, size, big ? '#c4102e' : '#1a1423', 'left', null, null);
    if (n === str.length && Math.floor(t * 3) % 2) px(bx + bw - 6, by + bh - 6, 2, 2, big ? '#c4102e' : '#1a1423');
  }

  // ── 마감 비상 배너 (마지막 0.7초, 1배 좌표)
  function emergency(k, t) {
    const blink = Math.floor(t * 10) % 2;
    dfill(0, 0, SW - 1, SH - 1, () => true, '#ff2046', blink ? 0.25 : 0.13);
    const edge = (x, y) => Math.max(Math.abs(x - SW / 2) / (SW / 2), Math.abs(y - SH / 2) / (SH / 2));
    dfill(0, 0, SW - 1, SH - 1, (x, y) => edge(x, y) > 0.78, '#5a0618', 0.5);
    dfill(0, 0, SW - 1, SH - 1, (x, y) => edge(x, y) > 0.9, '#2a0210', 0.75);
    const bh = Math.min(52, Math.round(k * 300)), by = Math.round(SH / 2 - bh / 2);
    px(0, by - 1, SW, bh + 2, K); px(0, by, SW, bh, '#090812');
    const sh = Math.floor(t * 30) * 2 % 20;
    for (let x = -20 + sh; x < SW + 20; x += 20) for (let r = 0; r < 4; r++) { px(x - r, by + r, 10, 1, '#ffd23f'); px(x - r, by + bh - 4 + r, 10, 1, '#ffd23f'); }
    if (bh >= 46) {
      ptext('DEADLINE EMERGENCY  D-03:00:00', SW / 2, by + 7, 12, blink ? '#ffd23f' : '#ff3b6b', 'center');
      ptext('마감까지 달려라!', SW / 2, by + 21, 24, '#ffffff', 'center', null, '#ff2a85');
    }
  }

  // ── 면 음영: 같은 색으로 칠한 면마다 맨 윗줄은 밝게, 아래로 갈수록 디더링 그림자, 오른쪽 끝은 한 톤 어둡게
  const KRGB = 0xff220c12;   // K (ABGR)
  function shadePass(cv) {
    const x2 = cv.getContext('2d', { willReadFrequently: true }), img = x2.getImageData(0, 0, SW, SH), a = new Uint32Array(img.data.buffer), src = a.slice();
    const tone = (v, f) => { const r = v & 255, g = (v >> 8) & 255, b = (v >> 16) & 255, k = f > 0 ? (q => q + (255 - q) * f) : (q => q * (1 + f)); return (v & 0xff000000) | (Math.round(k(b)) << 16) | (Math.round(k(g)) << 8) | Math.round(k(r)); };
    const up = new Uint8Array(SW * SH), dn = new Uint8Array(SW * SH);
    for (let x = 0; x < SW; x++) {
      for (let y = 1; y < SH; y++) { const i = y * SW + x; up[i] = src[i] === src[i - SW] ? Math.min(30, up[i - SW] + 1) : 0; }
      for (let y = SH - 2; y >= 0; y--) { const i = y * SW + x; dn[i] = src[i] === src[i + SW] ? Math.min(30, dn[i + SW] + 1) : 0; }
    }
    for (let y = 1; y < SH - 1; y++) for (let x = 1; x < SW - 1; x++) {
      const i = y * SW + x, v = src[i];
      if (v === KRGB || (v >>> 24) === 0) continue;
      const h = up[i] + dn[i] + 1;
      if (h < 3) continue;
      if (up[i] === 0 && src[i + 1] === v && src[i - 1] === v) { a[i] = tone(v, 0.16); continue; }   // 윗면 하이라이트
      if (src[i + 1] !== v && src[i + 1] !== KRGB && src[i - 1] === v) { a[i] = tone(v, -0.12); continue; }
      const k = up[i] / (h - 1);
      if (k > 0.5 && on(x, y, (k - 0.5) * 1.1)) a[i] = tone(v, -0.16);
      else if (h >= 8 && k < 0.22 && on(x + 2, y, 0.5 - k * 2)) a[i] = tone(v, 0.08);
    }
    x2.putImageData(img, 0, 0);
  }

  // ── 640x360 장면을 게임 픽셀(320x180)로: 2x2 칸마다 가장 많은 색(같으면 어두운 색)
  function pixelate(src, dst) {
    const sx = src.getContext('2d', { willReadFrequently: true }), dx = dst.getContext('2d');
    const a = new Uint32Array(sx.getImageData(0, 0, W, H).data.buffer), out = dx.createImageData(SW, SH), o = new Uint32Array(out.data.buffer);
    const lum = v => (v & 255) * 3 + ((v >> 8) & 255) * 6 + ((v >> 16) & 255);
    for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) {
      const i = y * 2 * W + x * 2, q = [a[i], a[i + 1], a[i + W], a[i + W + 1]];
      let best = q[0], bc = 0;
      for (let m = 0; m < 4; m++) { let cnt = 0; for (let n = 0; n < 4; n++) if (q[n] === q[m]) cnt++; if (cnt > bc || (cnt === bc && lum(q[m]) < lum(best))) { bc = cnt; best = q[m]; } }
      o[y * SW + x] = best;
    }
    dx.putImageData(out, 0, 0);
  }

  // ── 한 화면(컷 전환 없음). 13.6초 "작가님"부터 화면이 흔들리고, 15.7초에 작가가 깸
  let staticCv = null, frame = null, small = null;
  let TXT = [];
  function draw(ctx, ot, t, cue) {
    cue = cue || DEF;
    const make = (w, h) => { const e = document.createElement('canvas'); e.width = w; e.height = h; return e; };
    if (!staticCv) { staticCv = buildStatic(make); frame = make(W, H); small = make(SW, SH); }
    const L = cue.lines;
    const awake = ot >= L[4][0];
    const state = ot < cue.ringEnd ? 'ring' : ot >= L[2][0] ? 'shout' : 'call';
    TXT = [];
    // 1) 배경·소품을 640x360 에 그린 뒤 게임 픽셀로 줄임
    c = frame.getContext('2d', { willReadFrequently: true }); c.imageSmoothingEnabled = false;
    c.clearRect(0, 0, W, H); c.drawImage(staticCv, 0, 0);
    clock(t, awake);
    lamp(t, 1);
    chair();
    laptop(t);
    mug(t);
    phone(t, ot, cue, state);
    pixelate(frame, small);
    // 2) 게임 픽셀 위에 작가·글자·말풍선을 바로 찍음
    c = small.getContext('2d'); c.imageSmoothingEnabled = false;
    if (awake) writerAwake1(t, ot - L[4][0]); else writerSleep1(t);
    shadePass(small);   // 배경·소품·작가의 칠한 면에 도트 음영
    if (!awake) zzz1(t, ot < L[3][0] ? 1 : Math.max(0, 1 - (ot - L[3][0]) / 1.2));
    for (const [str, x, y, size, col, align, ol] of TXT) ptext(str, x, y, size, col, align, ol);
    let cur = null; for (const l of L) if (ot >= l[0]) cur = l;
    const nextStart = cur ? (L[L.indexOf(cur) + 1] || [cue.drop])[0] : 0;
    const alarm = ot >= L[4][1];
    if (cur && ot < nextStart && !alarm) bubble(ot, t, cur, 222, cur[2] === '작가님' || cur[2] === '계세요?');
    if (alarm) emergency((ot - L[4][1]) / 0.25, t);
    // 3) 화면으로: 흔들림은 정수 칸 단위
    let sx = 0, sy = 0;
    if (ot >= L[3][0]) { const a = alarm ? 3 : 1 + Math.min(2, Math.floor((ot - L[3][0]) * 1.5)); sx = Math.round((Math.random() * 2 - 1) * a); sy = Math.round((Math.random() * 2 - 1) * a); }
    ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = K; ctx.fillRect(0, 0, SW, SH);
    ctx.drawImage(small, sx, sy);
    ctx.fillStyle = '#05030b'; ctx.fillRect(0, 0, SW, 4); ctx.fillRect(0, SH - 4, SW, 4);
    ctx.restore();
  }

  root.MP = root.MP || {};
  root.MP.Opening = { draw, cue: DEF, size: [W, H] };
})(typeof window !== 'undefined' ? window : globalThis);
