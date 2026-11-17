/* 마감펑크 러너 · 달릴수록 바뀌는 배경 3단계
 *   city(기존) → suburb(한적한 교외) → weird(웃긴 세계) → weirder(점점 더 이상한 세계)
 * MP.buildStageLayers(make, G) → { suburb:{sky,far,near,ground}, weird:{...}, weirder:{...} }
 * 규격은 기존 buildLayers 와 같음: sky 320x180(고정), far/near 640x180(이음새 없이 반복), ground 32x30 타일. G=지면 y(150).
 */
(function (root) {
  const K = '#140c1e';
  const px = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.max(0, Math.round(w == null ? 1 : w)), Math.max(0, Math.round(h == null ? 1 : h))); };
  const rng = (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  const ell = (c, col, cx, cy, rx, ry) => { for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry + 0.0001))); px(c, col, cx - w, cy + y, w * 2 + 1, 1); } };
  const oell = (c, col, cx, cy, rx, ry) => { ell(c, K, cx, cy, rx + 1, ry + 1); ell(c, col, cx, cy, rx, ry); };
  const orect = (c, col, x, y, w, h) => { px(c, K, x - 1, y - 1, w + 2, h + 2); px(c, col, x, y, w, h); };
  const tri = (c, col, x, y, w, h) => { for (let i = 0; i < h; i++) { const ww = Math.round(w * (i + 1) / h); px(c, col, x + (w - ww) / 2, y + i, ww, 1); } };
  const otri = (c, col, x, y, w, h) => { for (let i = 0; i <= h; i++) { const ww = Math.round(w * (i + 1) / (h + 1)); px(c, K, x + (w - ww) / 2 - 1, y + i, ww + 2, 1); } tri(c, col, x, y + 1, w, h - 1); };
  const line = (c, col, x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) px(c, col, x0 + (x1 - x0) * i / (n || 1), y0 + (y1 - y0) * i / (n || 1), 1, 1); };
  const bands = (c, cols, edges) => { for (let i = 0; i < cols.length; i++) px(c, cols[i], 0, edges[i], 320, edges[i + 1] - edges[i]); };
  const dither = (c, col, y, h) => { for (let j = 0; j < h; j++) for (let i = (j % 2); i < 320; i += 2) px(c, col, i, y + j, 1, 1); };
  const cloud = (c, x, y, col, sh) => { px(c, col, x + 4, y, 10, 3); px(c, col, x, y + 3, 24, 4); px(c, col, x + 8, y - 2, 8, 3); px(c, sh, x, y + 6, 24, 1); };
  const TAU = Math.PI * 2;

  // ─────────────────── 교외 ───────────────────
  function suburb(make, G) {
    const o = {};
    const sky = make(320, 180), s = sky.getContext('2d');
    bands(s, ['#2d2a66', '#6e4d8f', '#e58a8e', '#ffc680'], [0, 46, 84, 116, 180]);
    dither(s, '#6e4d8f', 44, 4); dither(s, '#e58a8e', 82, 4); dither(s, '#ffc680', 114, 4);
    ell(s, '#ffe9a8', 232, 116, 26, 26); ell(s, '#fff6d0', 232, 116, 20, 20);
    cloud(s, 30, 40, '#f6c1cf', '#d596b0'); cloud(s, 120, 24, '#f6c1cf', '#d596b0'); cloud(s, 180, 58, '#ffd8c8', '#e5aaa8'); cloud(s, 270, 34, '#f6c1cf', '#d596b0');
    { const R = rng(5); for (let i = 0; i < 14; i++) px(s, '#fff', Math.floor(R() * 320), Math.floor(R() * 36), 1, 1); }
    o.sky = sky;

    const far = make(640, 180), f = far.getContext('2d');
    for (let x = 0; x < 640; x++) {
      const h1 = 52 + Math.round(Math.sin(x / 640 * TAU * 2) * 16 + Math.sin(x / 640 * TAU * 5) * 5);
      px(f, '#4a3f86', x, G - h1, 1, h1);
      const h2 = 30 + Math.round(Math.sin(x / 640 * TAU * 3 + 1) * 12 + Math.sin(x / 640 * TAU * 7) * 3);
      px(f, '#2f5d78', x, G - h2, 1, h2);
    }
    // 풍력 발전기 + 급수탑
    const wind = (wx, wy) => { px(f, '#d8d0f0', wx, wy, 2, 40); px(f, K, wx - 1, wy, 1, 40); line(f, '#d8d0f0', wx + 1, wy, wx + 12, wy - 8); line(f, '#d8d0f0', wx + 1, wy, wx - 10, wy - 6); line(f, '#d8d0f0', wx + 1, wy, wx + 2, wy + 14); px(f, '#fff', wx, wy - 1, 3, 3); };
    wind(110, G - 84); wind(420, G - 80);
    px(f, '#6a5aa8', 280, G - 70, 14, 10); px(f, '#6a5aa8', 283, G - 60, 2, 28); px(f, '#6a5aa8', 289, G - 60, 2, 28); px(f, '#3d326e', 280, G - 70, 14, 2);
    o.far = far;

    const near = make(640, 180), n = near.getContext('2d');
    const house = (x, wall, roof, door) => {
      orect(n, wall, x, G - 34, 52, 34);
      otri(n, roof, x - 5, G - 52, 62, 18);
      orect(n, '#ffe27a', x + 8, G - 26, 10, 10); px(n, K, x + 12, G - 26, 1, 10); px(n, K, x + 8, G - 22, 10, 1);
      orect(n, '#ffe27a', x + 34, G - 26, 10, 10); px(n, K, x + 38, G - 26, 1, 10); px(n, K, x + 34, G - 22, 10, 1);
      orect(n, door, x + 22, G - 20, 9, 20); px(n, '#ffd23f', x + 29, G - 10, 1, 1);
      orect(n, '#c85a4a', x + 38, G - 56, 6, 10);
    };
    const tree = (x, h, leaf) => { orect(n, '#7a4a2a', x + 7, G - h * 0.45, 5, h * 0.45); oell(n, leaf, x + 9, G - h * 0.62, 14, Math.round(h * 0.34)); ell(n, '#7fd07a', x + 5, G - h * 0.72, 5, 4); };
    const fence = (x, count) => { for (let i = 0; i < count; i++) { orect(n, '#f2ead3', x + i * 7, G - 14, 4, 14); px(n, '#f2ead3', x + i * 7, G - 15, 4, 1); } orect(n, '#f2ead3', x - 1, G - 10, count * 7 + 1, 2); };
    const pole = (x) => { orect(n, '#6a4a3a', x, G - 70, 3, 70); orect(n, '#6a4a3a', x - 7, G - 68, 17, 2); };
    house(14, '#f2a3a0', '#5a4bb0', '#7a4a2a');
    tree(86, 52, '#3a9a5a'); fence(112, 7);
    pole(176); tree(196, 44, '#4aa868');
    house(236, '#a3d6f2', '#c0503a', '#2a6a8a');
    pole(310); fence(330, 5); tree(372, 56, '#3a9a5a');
    house(414, '#f2e0a0', '#2f7a8a', '#a8402a');
    // 우체통 + 버스 정류장
    orect(n, '#2a6ad0', 484, G - 18, 12, 10); px(n, K, 482, G - 8, 16, 1); orect(n, '#7a4a2a', 489, G - 8, 2, 8); px(n, '#fff', 486, G - 15, 6, 2);
    orect(n, '#ffd23f', 518, G - 44, 14, 12); px(n, K, 522, G - 40, 6, 1); orect(n, '#5c5680', 524, G - 32, 2, 32);
    tree(556, 48, '#4aa868'); house(586, '#c8b8f2', '#a8402a', '#3a3a7a'); // 마지막 집이 640 끝 이전에서 끝남
    // 전선
    const wire = (xa, xb, ya) => { for (let x = xa; x <= xb; x++) { const t = (x - xa) / (xb - xa); px(n, K, x, G - ya + Math.round(Math.sin(t * Math.PI) * 6), 1, 1); } };
    wire(177, 311, 68); wire(311, 640 - 4, 68);
    o.near = near;

    const gt = make(32, 30), g = gt.getContext('2d');
    px(g, '#3a3550', 0, 0, 32, 30); px(g, '#5ac47a', 0, 0, 32, 3); px(g, '#3a9a5a', 0, 3, 32, 1);
    px(g, '#ffd23f', 4, 14, 10, 2); px(g, '#ffd23f', 20, 14, 10, 2); px(g, '#4a4466', 6, 22, 8, 1); px(g, '#4a4466', 22, 8, 5, 1);
    o.ground = gt;
    return o;
  }

  // ─────────────────── 웃긴 세계 ───────────────────
  function weird(make, G) {
    const o = {};
    const sky = make(320, 180), s = sky.getContext('2d');
    bands(s, ['#3a1a7a', '#8a2ca8', '#ff4f9a', '#ffc24a'], [0, 46, 84, 116, 180]);
    for (let y = 8; y < 110; y += 12) for (let x = ((y / 12) % 2) * 10; x < 320; x += 20) px(s, y < 60 ? '#a054c8' : '#ff86b8', x, y, 4, 1);
    // 선글라스 쓴 해
    ell(s, K, 214, 56, 31, 31); ell(s, '#ffe14a', 214, 56, 29, 29); ell(s, '#fff08a', 210, 48, 20, 18);
    px(s, K, 192, 48, 20, 10); px(s, K, 216, 48, 20, 10); px(s, K, 211, 50, 6, 3); px(s, '#2b3b8a', 194, 50, 16, 6); px(s, '#2b3b8a', 218, 50, 16, 6); px(s, '#7aa2ff', 196, 51, 5, 1); px(s, '#7aa2ff', 220, 51, 5, 1);
    px(s, K, 200, 70, 28, 2); px(s, K, 198, 68, 3, 2); px(s, K, 227, 68, 3, 2); px(s, '#ff7a8a', 206, 72, 16, 3);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(s, '#ffe14a', 214 + Math.cos(a) * 36, 56 + Math.sin(a) * 36, 214 + Math.cos(a) * 46, 56 + Math.sin(a) * 46); }
    // 하트 별
    const heart = (x, y, col) => { px(s, col, x, y, 2, 2); px(s, col, x + 3, y, 2, 2); px(s, col, x, y + 1, 5, 2); px(s, col, x + 1, y + 3, 3, 1); px(s, col, x + 2, y + 4, 1, 1); };
    [[20, 20], [60, 50], [110, 12], [150, 70], [280, 24], [300, 84], [40, 86]].forEach(([x, y], i) => heart(x, y, i % 2 ? '#ffd2e8' : '#ffffff'));
    o.sky = sky;

    const far = make(640, 180), f = far.getContext('2d');
    for (let x = 0; x < 640; x++) { const h = 34 + Math.round(Math.sin(x / 640 * TAU * 3) * 10 + Math.sin(x / 640 * TAU * 8) * 3); px(f, '#d0489a', x, G - h, 1, h); }
    const mush = (x, h, w, cap, dot) => { orect(f, '#f6e8d0', x + w / 2 - 5, G - h, 10, h); ell(f, K, x + w / 2, G - h, w / 2 + 1, 15); ell(f, cap, x + w / 2, G - h, w / 2, 14); px(f, '#d0489a', x - 2, G - h + 1, w + 4, 16); px(f, '#d0489a', x - 2, G - h, w + 4, 1);
      px(f, K, x - 2, G - h + 1, 1, 1); for (let i = 0; i < 4; i++) { const dx = x + 8 + i * (w - 18) / 3, dy = G - h - 7 + (i % 2) * 5; ell(f, dot, dx, dy, 3, 2); } };
    // 마스크: 버섯 머리 아래를 지우고 스템만 남기기 위해 단순히 위에 덮음
    mush(18, 72, 54, '#ff3b6b', '#fff'); mush(120, 56, 40, '#27c4b0', '#fff'); mush(214, 84, 60, '#ffd23f', '#ff3b6b'); mush(330, 60, 44, '#8b6ce0', '#fff'); mush(424, 78, 56, '#ff8a3d', '#fff'); mush(540, 58, 42, '#ff3b6b', '#ffd23f');
    o.far = far;

    const near = make(640, 180), n = near.getContext('2d');
    // 1) 닭다리 집
    const legHouse = (x) => { orect(n, '#ffe27a', x, G - 56, 42, 28); otri(n, '#ff4f9a', x - 4, G - 72, 50, 16); orect(n, '#7aa2ff', x + 6, G - 48, 10, 10); orect(n, '#7aa2ff', x + 26, G - 48, 10, 10);
      for (const lx of [x + 8, x + 28]) { orect(n, '#ffb36b', lx, G - 28, 5, 22); orect(n, '#ffb36b', lx - 3, G - 8, 12, 4); px(n, K, lx - 4, G - 4, 4, 2); px(n, K, lx + 4, G - 4, 4, 2); } };
    // 2) 고무 오리
    const duck = (x) => { oell(n, '#ffe14a', x + 18, G - 16, 20, 14); oell(n, '#ffe14a', x + 30, G - 38, 11, 11); orect(n, '#ff8a3d', x + 38, G - 36, 9, 4); px(n, K, x + 33, G - 42, 2, 3); px(n, '#fff08a', x + 8, G - 24, 10, 3); px(n, '#ffc24a', x + 6, G - 10, 24, 2); };
    // 3) 얼굴 있는 나무
    const faceTree = (x) => { orect(n, '#7a4a2a', x + 10, G - 36, 8, 36); oell(n, '#3ad07a', x + 14, G - 52, 20, 18); px(n, K, x + 7, G - 56, 4, 6); px(n, K, x + 19, G - 56, 4, 6); px(n, '#fff', x + 8, G - 56, 2, 2); px(n, '#fff', x + 20, G - 56, 2, 2); px(n, K, x + 8, G - 46, 14, 2); px(n, K, x + 7, G - 48, 2, 2); px(n, K, x + 21, G - 48, 2, 2); };
    // 4) UFO + 소
    const ufo = (x) => { const y = G - 110;
      tri(n, 'rgba(180,255,220,0.55)', x - 10, y + 8, 38, 70);
      oell(n, '#c8c8e8', x + 9, y + 4, 22, 6); oell(n, '#7affd8', x + 9, y - 3, 10, 7); px(n, '#ff3b6b', x - 8, y + 4, 3, 2); px(n, '#ffd23f', x + 8, y + 7, 3, 2); px(n, '#ff3b6b', x + 22, y + 4, 3, 2);
      orect(n, '#ffffff', x + 2, G - 58, 14, 8); px(n, K, x + 4, G - 55, 3, 3); px(n, K, x + 11, G - 55, 3, 3); orect(n, '#ffc2d0', x + 14, G - 56, 6, 4); px(n, K, x + 3, G - 50, 1, 4); px(n, K, x + 14, G - 50, 1, 4); };
    // 5) 거대 커피잔
    const cup = (x) => { orect(n, '#f6f2ff', x, G - 34, 28, 34); orect(n, '#f6f2ff', x + 28, G - 26, 8, 14); px(n, '#6a4a2a', x + 2, G - 32, 24, 3); px(n, '#c85a8a', x + 6, G - 20, 14, 6);
      for (let i = 0; i < 3; i++) { px(n, '#ffffff', x + 6 + i * 7 + (i % 2) * 2, G - 44 - i * 6, 2, 10); } };
    legHouse(10); duck(86); faceTree(150); ufo(206); cup(300); duck(360); legHouse(420); faceTree(500); cup(560);
    o.near = near;

    const gt = make(32, 30), g = gt.getContext('2d');
    px(g, '#3a1f6a', 0, 0, 32, 30); for (let i = 0; i < 4; i++) { px(g, i % 2 ? '#ff4f9a' : '#7affd8', i * 8, 0, 8, 3); } px(g, '#ffd23f', 0, 3, 32, 1);
    px(g, '#5a3a9a', 4, 10, 10, 1); px(g, '#5a3a9a', 18, 18, 8, 1); px(g, '#ff86b8', 2, 25, 4, 1);
    o.ground = gt;
    return o;
  }

  // ─────────────────── 점점 더 이상한 세계 ───────────────────
  function weirder(make, G) {
    const o = {};
    const sky = make(320, 180), s = sky.getContext('2d');
    bands(s, ['#00a8a0', '#1e6ad8', '#7a2ae0', '#ff2a80'], [0, 40, 80, 118, 180]);
    for (let y = 0; y < 180; y += 6) for (let x = (y / 6 % 2) * 6; x < 320; x += 12) px(s, y < 80 ? '#ffffff' : '#ffd23f', x, y, 2, 2);
    // 하늘의 커다란 눈
    ell(s, K, 190, 46, 44, 24); ell(s, '#ffffff', 190, 46, 42, 22); ell(s, '#ff3b6b', 190, 46, 15, 15); ell(s, '#1a1030', 190, 46, 8, 8); px(s, '#fff', 186, 41, 4, 3);
    for (let i = 0; i < 9; i++) { const a = Math.PI + (i - 4) * 0.28; line(s, K, 190 + Math.cos(a) * 44, 46 + Math.sin(a) * 25, 190 + Math.cos(a) * 54, 46 + Math.sin(a) * 33); line(s, K, 191 + Math.cos(a) * 44, 46 + Math.sin(a) * 25, 191 + Math.cos(a) * 54, 46 + Math.sin(a) * 33); }
    ell(s, '#ffe14a', 40, 36, 14, 14); ell(s, '#ffe14a', 74, 62, 8, 8); ell(s, '#ffffff', 276, 90, 10, 10); px(s, K, 273, 88, 2, 2); px(s, K, 278, 88, 2, 2); px(s, K, 273, 93, 7, 1);
    o.sky = sky;

    const far = make(640, 180), f = far.getContext('2d');
    for (let x = 0; x < 640; x++) { const h = 28 + Math.round(Math.abs(Math.sin(x / 640 * TAU * 6)) * 24); px(f, x % 16 < 8 ? '#a82ad8' : '#8a1fc0', x, G - h, 1, h); }
    // 떠 있는 섬 + 거꾸로 선 탑
    const island = (x, y, w) => { ell(f, K, x + w / 2, y, w / 2 + 1, 6); ell(f, '#4ad07a', x + w / 2, y, w / 2, 5); tri(f, K, x - 1, y + 3, w + 2, 22); tri(f, '#7a4a2a', x, y + 4, w, 20);
      px(f, K, x + w / 2 - 1, y - 14, 5, 12); px(f, '#ff3b6b', x + w / 2, y - 13, 3, 10); tri(f, '#ffd23f', x + w / 2 - 3, y - 20, 9, 6); };
    island(30, 60, 50); island(150, 40, 40); island(250, 70, 56); island(380, 46, 44); island(470, 78, 50); island(570, 52, 46);
    const down = (x, h) => { for (let i = 0; i < h; i++) { const w = Math.round(22 * (h - i) / h) + 2; px(f, K, x + 11 - w / 2 - 1, G - 70 + i - 40, w + 2, 1); px(f, i % 6 < 2 ? '#ffd23f' : '#ff3b6b', x + 11 - w / 2, G - 70 + i - 40, w, 1); } };
    down(104, 38); down(330, 44); down(525, 36);
    o.far = far;

    const near = make(640, 180), n = near.getContext('2d');
    const eyeFlower = (x, h) => { px(n, K, x + 5, G - h, 5, h); px(n, '#3ad07a', x + 6, G - h, 3, h); tri(n, '#3ad07a', x - 6, G - 14, 8, 6); oell(n, '#ffffff', x + 7, G - h - 8, 11, 9); ell(n, '#ff3b6b', x + 7, G - h - 8, 5, 5); ell(n, K, x + 7, G - h - 8, 2, 2); };
    const upsideHouse = (x) => { orect(n, '#ffe27a', x, G - 42, 40, 28); for (let i = 0; i < 14; i++) { const w = 46 - i * 3; px(n, K, x + 20 - w / 2 - 1, G - 14 + i, w + 2, 1); px(n, '#c0503a', x + 20 - w / 2, G - 14 + i, w, 1); } orect(n, '#2a6a8a', x + 16, G - 42, 9, 16); orect(n, '#7aa2ff', x + 4, G - 36, 8, 8); orect(n, '#7aa2ff', x + 28, G - 36, 8, 8); px(n, K, x + 8, G - 44, 4, 2); };
    const whale = (x, y) => { oell(n, '#7ab8ff', x + 24, y, 26, 12); tri(n, K, x + 46, y - 14, 18, 14); tri(n, '#7ab8ff', x + 48, y - 12, 14, 11); px(n, '#fff', x + 8, y + 2, 28, 3); ell(n, '#fff', x + 10, y - 3, 2, 2); px(n, K, x + 10, y - 3, 1, 1);
      line(n, '#bfe8ff', x + 14, y - 12, x + 12, y - 22); line(n, '#bfe8ff', x + 14, y - 12, x + 18, y - 22); px(n, '#bfe8ff', x + 10, y - 24, 3, 2); px(n, '#bfe8ff', x + 17, y - 24, 3, 2); };
    const cake = (x) => { orect(n, '#ffb36b', x, G - 22, 36, 22); px(n, K, x + 4, G - 22, 1, 22); px(n, K, x + 10, G - 22, 1, 22); px(n, K, x + 16, G - 22, 1, 22); px(n, K, x + 22, G - 22, 1, 22); px(n, K, x + 28, G - 22, 1, 22);
      oell(n, '#ff86b8', x + 18, G - 30, 22, 10); oell(n, '#ffffff', x + 18, G - 38, 8, 6); orect(n, '#ff3b6b', x + 17, G - 52, 3, 14); px(n, '#ffd23f', x + 17, G - 56, 3, 4); };
    const noodle = (x) => { for (let i = 0; i < 26; i++) { const wx = x + Math.round(Math.sin(i * 0.8) * 6) + 8; px(n, K, wx - 2, G - i * 4, 7, 4); px(n, '#ffe27a', wx - 1, G - i * 4, 5, 4); } oell(n, '#ff3b6b', x + 9, G - 108, 12, 6); };
    const legs = (x) => { for (const lx of [x, x + 16]) { px(n, K, lx, G - 70, 8, 70); px(n, '#ffcba0', lx + 1, G - 70, 6, 70); px(n, '#c88a60', lx + 5, G - 70, 2, 70); orect(n, '#ff3b6b', lx - 3, G - 8, 14, 8); } };
    eyeFlower(10, 38); upsideHouse(48); whale(120, G - 110); cake(190); eyeFlower(250, 52); noodle(290); legs(334); eyeFlower(380, 30); upsideHouse(410); whale(480, G - 96); cake(560); eyeFlower(610, 44);
    o.near = near;

    const gt = make(32, 30), g = gt.getContext('2d');
    px(g, '#2a0f55', 0, 0, 32, 30); const rc = ['#ff2a80', '#ffd23f', '#3ad07a', '#27c4e8']; for (let i = 0; i < 4; i++) px(g, rc[i], i * 8, 0, 8, 3); px(g, '#ffffff', 0, 3, 32, 1);
    for (let i = 0; i < 4; i++) px(g, rc[(i + 2) % 4], 3 + i * 8, 14, 4, 2); px(g, '#4a2a8a', 4, 24, 8, 1);
    o.ground = gt;
    return o;
  }

  function buildStageLayers(make, G) { G = G || 150; return { suburb: suburb(make, G), weird: weird(make, G), weirder: weirder(make, G) }; }
  root.MP = root.MP || {};
  root.MP.buildStageLayers = buildStageLayers;
  root.MP.STAGES = [
    { id: 'city', name: '야근 도시', from: 0 },
    { id: 'suburb', name: '한적한 교외', from: 600 },
    { id: 'weird', name: '웃긴 세계', from: 1500 },
    { id: 'weirder', name: '점점 더 이상한 세계', from: 3000 },
  ];
})(typeof window !== 'undefined' ? window : globalThis);
