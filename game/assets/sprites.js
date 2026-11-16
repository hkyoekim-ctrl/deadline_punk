/* 마감펑크 러너 — 픽셀 아트 소스 (v0.1)
 * 게임 내부 해상도 320x180, 정수배 확대(image-rendering: pixelated).
 * 모든 스프라이트는 아래 문자 격자 + PAL 팔레트로 그립니다. 이 파일 하나로 시안 페이지와 PNG 스프라이트시트가 함께 만들어집니다.
 * 사용: MP.buildSprites(make) → { name: canvas }, make = (w,h) => canvas
 */
(function (root) {
  const PAL = {
    K: '#1b1533', // 외곽선
    H: '#ff3b6b', // 머리(펑크 핑크)
    h: '#c41f4f', // 머리 그림자
    S: '#f6c7a0', // 피부
    s: '#d99a76', // 피부 그림자
    J: '#27c4b0', // 재킷
    j: '#17897c', // 재킷 그림자
    W: '#ffffff', // 흰색
    Y: '#ffd23f', // 노랑(신발, 음표, 번개)
    P: '#5a4bb0', // 바지
    p: '#3d3280', // 바지 그림자
    L: '#b9b3d6', // 서류 줄
    R: '#ff3b4e', // 마감 빨강
    r: '#b3183a', // 마감 빨강 그림자
    C: '#6b4029', // 커피
    M: '#8a85b0', // 회색(김, 휴대폰)
    E: '#fff1dc', // 시계 얼굴
    m: '#ffe9a8', // 달
    n: '#c9a24a', // 달 테두리
    u: '#f08a24', // 해 테두리·햇살
    v: '#c4521a', // 해 시곗바늘
    G: '#f5a623', // 맥주
    g: '#c97a10', // 맥주 그림자
  };

  // ── 주인공: 밴드맨 "펑크" 16x24, 오른쪽을 봄. 발바닥 = 24번째 줄.
  const HEAD = [
    '.......H........',
    '......HHH.......',
    '.....HHhHH......',
    '....KHHhHHHK....',
    '...KSSSSSSSSK...',
    '...KSSSSSSKSK...',
    '...KSSSSSSKSK...',
    '...KsSSSSSSSK...',
    '....KsSSSKKK....',
    '.....KKSSK......',
  ];
  const TORSO = [
    '....KJJWWJJK....',
    '...KJJWWYWJJK...',
    '...KJjWYWWjJK...',
    '...KSjWWYWjSK...',
    '....KKWWWWKK....',
    '....KPPPPPPK....',
    '....KPPppPPK....',
  ];
  const LEGS = {
    run1: [
      '...KPPK..KPPK...',
      '..KPPK....KPPK..',
      '..KPK......KPK..',
      '.KPK.......KPK..',
      '.KPK........KPK.',
      'KYYK........KYYK',
      'KKKK........KKKK',
    ],
    run2: [
      '....KPPPPK......',
      '....KPPKPK......',
      '....KPK.KPK.....',
      '....KPK..KYYK...',
      '....KPK..KKKK...',
      '...KYYK.........',
      '...KKKK.........',
    ],
    run3: [
      '....KPPKPPK.....',
      '...KPPK.KPPK....',
      '...KPK...KPK....',
      '..KPK.....KPK...',
      '..KPK......KPK..',
      '.KYYK......KYYK.',
      '.KKKK......KKKK.',
    ],
    run4: [
      '....KPPPPK......',
      '....KPKPPK......',
      '...KPK.KPK......',
      '..KYYK..KPK.....',
      '..KKKK..KPK.....',
      '........KYYK....',
      '........KKKK....',
    ],
    jump: [
      '...KPPK.KPPK....',
      '...KPPKKPPK.....',
      '....KPPKPPK.....',
      '...KYYKKYYK.....',
      '...KKKK.KKKK....',
      '................',
      '................',
    ],
  };
  const SLIDE = [
    '................', '................', '................', '................',
    '................', '................', '................', '................',
    '................', '................', '................',
    '........H.......',
    '.......HHH......',
    '......KHHhHK....',
    '.....KSSSSSSK...',
    '.....KSSSSKSK...',
    '...KKKsSSSSSK...',
    '..KJJJKKSSKK....',
    '.KJJWWYWJJK.....',
    'KJjWWYWWJjSK....',
    'KPPPPPPPPPPPK...',
    'KPPppPPPPPPPPYK.',
    '.KKKKKKKKKPPPYYK',
    '..........KKKKKK',
  ];

  // ── 장애물·아이템
  const OBJ = {
    // 서류더미(수정요청 도장) 16x20 — 바닥, 점프로 넘기
    paper: [
      '...KKKKKKKKKK...',
      '...KWWWWWWWWK...',
      '..KKKKKKKKKKKK..',
      '..KWWWWWWWWWWK..',
      '..KWLLLLLLLWWK..',
      '.KKKKKKKKKKKKKK.',
      '.KWWWWWWWWWWWWK.',
      '.KWLLLLLLLLLWWK.',
      '.KWWWWWWWWWWWWK.',
      'KKKKKKKKKKKKKKKK',
      'KWWWWWWWWWWWWWWK',
      'KWLLLLLLLLLLWWWK',
      'KWWWWWRRRRRWWWWK',
      'KWLLLRWWWWWRLWWK',
      'KWWWWRWRRRWRWWWK',
      'KWLLLRWWWWWRLLWK',
      'KWWWWWRRRRRWWWWK',
      'KWLLLLLLLLLLLLWK',
      'KWWWWWWWWWWWWWWK',
      'KKKKKKKKKKKKKKKK',
    ],
    // 울리는 휴대폰 12x16 — 바닥, 점프로 넘기
    phone: [
      '............',
      '.K........K.',
      'K..KKKKKK..K',
      '...KMMMMK...',
      '.K.KYYYYK.K.',
      'K..KYRRYK..K',
      '...KYRRYK...',
      '...KYYYYK...',
      '.K.KYWWYK.K.',
      'K..KYYYYK..K',
      '...KYWWYK...',
      '...KYYYYK...',
      '...KMMMMK...',
      '...KMKKMK...',
      '...KMMMMK...',
      '...KKKKKK...',
    ],
    // 날아오는 메일(빨간 알림 배지) 18x11 — 공중, 숙여서 피하기
    mail: [
      '............KKKKK.',
      'KKKKKKKKKKKKKRWRK.',
      'KWWWWWWWWWWWKRWRK.',
      'KKWWWWWWWWWWKRRRK.',
      'KWKWWWWWWWWKKRWRK.',
      'KWWKWWWWWWKWKKKKK.',
      'KWWWKKWWKKWWWK....',
      'KWWWWWKKWWWWWK....',
      'KWWWWWWWWWWWWK....',
      'KLLLLLLLLLLLLK....',
      'KKKKKKKKKKKKKK....',
    ],
    // 커피 12x13 — 마감 게이지 회복
    coffee: [
      '....M..M....',
      '...M..M.....',
      '....M..M....',
      '............',
      '.KKKKKKKK...',
      '.KCCCCCCK...',
      '.KWWWWWWKKK.',
      '.KWHHHHWK.K.',
      '.KWHHHHWK.K.',
      '.KWWWWWWKKK.',
      '.KWWWWWWK...',
      '..KWWWWK....',
      '..KKKKKK....',
    ],
    // 날아오는 빨간 교정 펜 20x5 — 공중, 아주 빠름, 숙여서 피하기
    pen: [
      '....KKKKKKKKKKKKKKK.',
      '..KKWWRRRRRRRRRRRRKK',
      'KKMWWWRRRRRRRYYRRRrK',
      '..KKWWRRRRRRRRRRrrKK',
      '....KKKKKKKKKKKKKKK.',
    ],
    // 굴러오는 사무용 의자 16x18 — 바닥, 다른 장애물보다 빨리 굴러옴, 점프로 넘기
    chair: [
      '....KKKKKK......',
      '...KRRRRRRK.....',
      '...KRrRRRRK.....',
      '...KRRRRRRK.....',
      '...KRRRRrRK.....',
      '....KRRRRK......',
      '.....KMMK.......',
      '..KKKKKKKKKK....',
      '..KRRRRRRRRK....',
      '...KKKKKKKK.....',
      '......KMK.......',
      '......KMK.......',
      '......KMK.......',
      '..KKKKKMKKKKK...',
      '..KMMMMMMMMMK...',
      '..KKKKKKKKKKK...',
      '.KK...KK...KK...',
      '.KK...KK...KK...',
    ],
    // 아이스 아메리카노 12x12 — 4초 가속, 마감과 거리 벌리기
    americano: [
      '......KK....',
      '.....KRRK...',
      '.....KRK....',
      '.KKKKKRKKKK.',
      '.KLLLLRLLLK.',
      '..KWCCWCCK..',
      '..KCWWCCCK..',
      '..KCCCCWCK..',
      '..KCCWCCCK..',
      '...KCCCCK...',
      '...KCCCCK...',
      '...KKKKKK...',
    ],
    // 생맥주 14x13(🍺 느낌: 넘치는 거품, 호박색, 두꺼운 손잡이) — ROCK! 모드(6초 동안 악기 휘두르기)
    beer: [
      '..KKK.KKKK....',
      '.KWWWKWWWWK...',
      'KWWWWWWWWWWK..',
      'KWWLWWWWWLWK..',
      '.KWWWWWWWWK...',
      '.KGWGGGWGGKKKK',
      '.KYGGGGGGgKELK',
      '.KYGGWGGGgKELK',
      '.KYGGGGGGgKELK',
      '.KYGGGGWGgKELK',
      '.KYGGGGGGgKKKK',
      '.KYGGGGGGgK...',
      '.KKKKKKKKKK...',
    ],
    // 음표 10x12 — 점수 + 피버 게이지
    note: [
      '....KK....',
      '....KYKK..',
      '....KYYYK.',
      '....KYKYYK',
      '....KYK.KK',
      '....KYK...',
      '....KYK...',
      '.KKKKYK...',
      'KYYYYYK...',
      'KYYYYYK...',
      'KYYYYK....',
      '.KKKK.....',
    ],
  };

  function paint(ctx, rows, ox, oy, pal) {
    pal = pal || PAL;
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length; x++) {
        const c = pal[row[x]];
        if (c) { ctx.fillStyle = c; ctx.fillRect(ox + x, oy + y, 1, 1); }
      }
    }
  }

  function px(ctx, c, x, y, w, h) { ctx.fillStyle = c; ctx.fillRect(x, y, w || 1, h || 1); }
  function line(ctx, c, x0, y0, x1, y1) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= n; i++) px(ctx, c, Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n));
  }
  function disc(ctx, cx, cy, r, fill, edge) {
    for (let y = Math.floor(cy - r - 1); y <= cy + r + 1; y++)
      for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        if (d <= r) px(ctx, d > r - 1.2 && edge ? edge : fill, x, y);
      }
  }

  // ── 마감 괴물(자명종 시계) 40x40, 2프레임. 바늘은 11:59.
  function drawMonster(ctx, ox, oy, frame) {
    ctx.save(); ctx.translate(ox, oy);
    const K = PAL.K;
    disc(ctx, 8, 6, 4.5, PAL.Y, K);
    disc(ctx, 32, 6, 4.5, PAL.Y, K);
    px(ctx, K, 19, 1, 2, 3);
    const cx = 20, cy = 19, R = 15.5;
    for (let y = 0; y < 40; y++) for (let x = 0; x < 40; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d > R) continue;
      let c = PAL.E;
      if (d > R - 1.3) c = K; else if (d > R - 4) c = y < cy ? PAL.R : PAL.r;
      px(ctx, c, x, y);
    }
    // 눈금
    px(ctx, PAL.r, 19, 7, 2, 2); px(ctx, PAL.r, 30, 18, 2, 2); px(ctx, PAL.r, 8, 18, 2, 2);
    // 바늘(12시 직전)
    px(ctx, K, 19, 10, 2, 9); line(ctx, K, 19, 18, 16, 12);
    // 화난 눈썹·눈
    line(ctx, K, 11, 15, 16, 17); line(ctx, K, 29, 15, 24, 17);
    px(ctx, K, 13, 18, 3, 3); px(ctx, K, 24, 18, 3, 3);
    px(ctx, PAL.W, 14, 18); px(ctx, PAL.W, 25, 18);
    // 이빨 입
    px(ctx, K, 14, 24, 12, 4);
    for (let x = 15; x < 25; x += 2) { px(ctx, PAL.W, x, 24); px(ctx, PAL.W, x + 1, 27 - 0); }
    px(ctx, K, 14, 27, 12, 1);
    for (let x = 16; x < 25; x += 3) px(ctx, PAL.W, x, 26);
    // 팔(주인공 쪽으로 뻗음)
    if (frame === 0) { line(ctx, K, 35, 21, 38, 18); px(ctx, K, 37, 16, 3, 3); }
    else { line(ctx, K, 35, 22, 38, 22); px(ctx, K, 37, 20, 3, 3); }
    line(ctx, K, 5, 21, 2, 24); px(ctx, K, 0, 23, 3, 3);
    // 다리
    if (frame === 0) { px(ctx, K, 14, 34, 2, 3); px(ctx, K, 12, 37, 6, 2); px(ctx, K, 25, 34, 2, 2); px(ctx, K, 24, 36, 6, 2); }
    else { px(ctx, K, 14, 34, 2, 2); px(ctx, K, 11, 36, 6, 2); px(ctx, K, 25, 34, 2, 3); px(ctx, K, 25, 37, 6, 2); }
    ctx.restore();
  }

  // ── 시계 달 24x24
  function drawMoon(ctx, ox, oy) {
    ctx.save(); ctx.translate(ox, oy);
    disc(ctx, 12, 12, 11, PAL.m, PAL.n);
    px(ctx, PAL.n, 11, 4, 2, 2); px(ctx, PAL.n, 18, 11, 2, 2); px(ctx, PAL.n, 11, 18, 2, 2); px(ctx, PAL.n, 4, 11, 2, 2);
    px(ctx, PAL.n, 11, 7, 2, 6); line(ctx, PAL.n, 12, 12, 16, 9);
    ctx.restore();
  }

  // 해: 달과 같은 시계 모양. 28x28, 원 반지름 9 + 햇살 8줄. f=0/1 햇살 길이 번갈아 반짝
  function drawSun(ctx, ox, oy, f) {
    ctx.save(); ctx.translate(ox, oy);
    // 햇살: 상하좌우는 2px 굵기, 대각선은 1px. f에 따라 길이가 번갈아 바뀜
    const L = f ? [2, 4] : [4, 2];
    px(ctx, PAL.u, 13, 4 - L[0], 2, L[0]); px(ctx, PAL.u, 13, 24, 2, L[0]);
    px(ctx, PAL.u, 4 - L[0], 13, L[0], 2); px(ctx, PAL.u, 24, 13, L[0], 2);
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      for (let k = 0; k < L[1]; k++) { const x = 14 + sx * (8 + k) - (sx < 0 ? 1 : 0), y = 14 + sy * (8 + k) - (sy < 0 ? 1 : 0); px(ctx, k === L[1] - 1 ? PAL.Y : PAL.u, x, y); }
    disc(ctx, 14, 14, 10, PAL.Y, PAL.u);
    px(ctx, '#fff3b8', 8, 8, 3, 1); px(ctx, '#fff3b8', 7, 9, 1, 3);
    px(ctx, PAL.u, 13, 6, 2, 2); px(ctx, PAL.u, 20, 13, 2, 2); px(ctx, PAL.u, 13, 20, 2, 2); px(ctx, PAL.u, 6, 13, 2, 2);
    px(ctx, PAL.v, 13, 9, 2, 6); line(ctx, PAL.v, 13, 14, 10, 17); line(ctx, PAL.v, 14, 14, 11, 17);
    ctx.restore();
  }

  // ── 3x5 숫자 폰트(전광판용)
  const DIG = {
    '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111',
    '4': '101101111001001', '5': '111100111001111', '6': '111100111101111', '7': '111001001001001',
    '8': '111101111101111', '9': '111101111001111', '.': '000000000000100',
  };
  function tinyText(ctx, str, x, y, c, scale) {
    scale = scale || 1;
    for (const ch of str) {
      const g = DIG[ch];
      if (g) for (let i = 0; i < 15; i++) if (g[i] === '1') px(ctx, c, x + (i % 3) * scale, y + Math.floor(i / 3) * scale, scale, scale);
      x += (ch === '.' ? 2 : 4) * scale;
    }
  }

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  const BG = {
    sky: ['#100d26', '#151133', '#1b1640', '#221a4c'],
    skyFever: ['#2a0c35', '#380f45', '#481456', '#5a1a62'],
    star: '#8a85b0',
    far: '#1f1946', farWin: '#3a3170', farLit: '#c9a24a',
    near: '#2b2263', nearEdge: '#3a2f80', nearWin: '#191438', nearLit: '#ffd23f', screen: '#27c4b0',
    ground: '#2a2350', groundTop: '#6a5cc8', groundMark: '#3d3478',
  };

  // 배경 레이어: sky 320x180(고정), far/near 640x180(가로 반복), ground 32x30(타일)
  function buildLayers(make, G) {
    G = G || 150;
    const out = {};
    // sky
    const sky = make(320, 180), s = sky.getContext('2d');
    const bands = [0, 52, 92, 124, 180];
    for (let i = 0; i < 4; i++) { s.fillStyle = BG.sky[i]; s.fillRect(0, bands[i], 320, bands[i + 1] - bands[i]); }
    const R0 = rng(7);
    for (let i = 0; i < 40; i++) px(s, BG.star, Math.floor(R0() * 320), Math.floor(R0() * 100));
    drawMoon(s, 206, 12);
    out.sky = sky;

    // far skyline
    const far = make(640, 180), f = far.getContext('2d');
    const R1 = rng(21);
    for (let x = 0; x < 640;) {
      const w = 20 + Math.floor(R1() * 26), h = 46 + Math.floor(R1() * 64);
      px(f, BG.far, x, G - h, w, h);
      if (R1() < 0.3) px(f, BG.far, x + Math.floor(w / 2) - 1, G - h - 8, 2, 8);
      for (let wy = G - h + 4; wy < G - 4; wy += 5)
        for (let wx = x + 3; wx < x + w - 3; wx += 4) {
          const q = R1();
          if (q < 0.08) px(f, BG.farLit, wx, wy, 2, 2); else if (q < 0.4) px(f, BG.farWin, wx, wy, 2, 2);
        }
      x += w + Math.floor(R1() * 4);
    }
    out.far = far;

    // near: 야근 중인 사무실 빌딩 + 발매일 전광판
    const near = make(640, 180), n = near.getContext('2d');
    const R2 = rng(99);
    let bx = 0;
    while (bx < 640) {
      const w = 44 + Math.floor(R2() * 40), h = 34 + Math.floor(R2() * 40);
      if (bx > 230 && bx < 330) { bx = 340; continue; } // 전광판 자리
      px(n, BG.near, bx, G - h, w, h);
      px(n, BG.nearEdge, bx, G - h, w, 1);
      for (let wy = G - h + 5; wy < G - 8; wy += 9)
        for (let wx = bx + 4; wx < bx + w - 8; wx += 9) {
          const lit = R2() < 0.35;
          px(n, lit ? BG.nearLit : BG.nearWin, wx, wy, 6, 5);
          if (lit && R2() < 0.6) { px(n, BG.screen, wx + 1, wy + 2, 3, 2); px(n, PAL.K, wx + 2, wy + 4, 1, 1); }
        }
      bx += w + 10 + Math.floor(R2() * 22);
    }
    // 전광판
    const bbx = 250, bby = G - 72;
    px(n, PAL.K, bbx + 10, bby + 26, 3, 72 - 26); px(n, PAL.K, bbx + 54, bby + 26, 3, 72 - 26);
    px(n, PAL.K, bbx - 1, bby - 1, 70, 28);
    px(n, PAL.H, bbx, bby, 68, 26);
    px(n, PAL.h, bbx, bby + 22, 68, 4);
    tinyText(n, '11.20', bbx + 13, bby + 5, PAL.W, 3);
    out.near = near;

    // ground tile
    const gt = make(32, 30), g = gt.getContext('2d');
    px(g, BG.ground, 0, 0, 32, 30);
    px(g, BG.groundTop, 0, 0, 32, 1);
    px(g, BG.groundMark, 0, 7, 12, 1); px(g, BG.groundMark, 18, 15, 8, 1); px(g, BG.groundMark, 4, 23, 6, 1);
    out.ground = gt;
    return out;
  }

  // 책더미 22x60 — 2단 점프로만 넘을 수 있는 높이
  function drawBooks(ctx) {
    const cols = [['#ff3b6b', '#c41f4f'], ['#27c4b0', '#17897c'], ['#ffd23f', '#d9a92a'], ['#8b6ce0', '#6447b8'], ['#ff8a3d', '#d4682a'], ['#5a4bb0', '#3d3280']];
    const R = rng(311);
    let y = 60;
    while (y > 2) {
      const h = 4 + Math.floor(R() * 3), w = 16 + Math.floor(R() * 5), x = 1 + Math.floor(R() * (21 - w));
      const top = Math.max(0, y - h), c = cols[Math.floor(R() * cols.length)];
      px(ctx, PAL.K, x, top, w, y - top);
      px(ctx, c[0], x + 1, top + 1, w - 2, y - top - 2);
      px(ctx, c[1], x + 1, y - 2, w - 2, 1);
      px(ctx, '#f2ead3', x + w - 3, top + 1, 2, y - top - 2);
      if (R() < 0.5) px(ctx, PAL.W, x + 3, top + 2, Math.min(6, w - 8), 1);
      y = top;
    }
  }

  // 모든 스프라이트를 개별 캔버스로
  function buildSprites(make) {
    const out = {};
    const hitPal = {};
    for (const k in PAL) hitPal[k] = k === 'K' ? PAL.K : '#ffc2d0';
    const body = (legs) => HEAD.concat(TORSO, legs);
    for (const name of ['run1', 'run2', 'run3', 'run4', 'jump']) {
      const c = make(16, 24); paint(c.getContext('2d'), body(LEGS[name]), 0, 0); out[name] = c;
    }
    { const c = make(16, 24); paint(c.getContext('2d'), SLIDE, 0, 0); out.slide = c; }
    { const c = make(16, 24); paint(c.getContext('2d'), body(LEGS.run2), 0, 0, hitPal); out.hit = c; }
    for (const k in OBJ) { const rows = OBJ[k]; const c = make(rows[0].length, rows.length); paint(c.getContext('2d'), rows, 0, 0); out[k] = c; }
    { const c = make(22, 60); drawBooks(c.getContext('2d')); out.books = c; }
    for (const f of [0, 1]) { const c = make(40, 40); drawMonster(c.getContext('2d'), 0, 0, f); out['deadline' + (f + 1)] = c; }
    { const c = make(24, 24); drawMoon(c.getContext('2d'), 0, 0); out.moon = c; }
    for (const f of [0, 1]) { const c = make(28, 28); drawSun(c.getContext('2d'), 0, 0, f); out['sun' + (f + 1)] = c; }
    return out;
  }

  // 판정 박스(스프라이트 좌상단 기준) — 게임 개발 참고용
  const HITBOX = {
    stand: [4, 2, 8, 22], slide: [3, 12, 10, 12],
    paper: [1, 1, 14, 19], phone: [3, 2, 6, 14], mail: [1, 1, 13, 9],
    coffee: [1, 4, 10, 9], note: [0, 0, 10, 12], chair: [2, 1, 11, 17], pen: [0, 1, 20, 3], books: [1, 2, 20, 58], americano: [1, 0, 10, 12], beer: [0, 0, 13, 13], deadline: [2, 2, 36, 36],
  };

  root.MP = { PAL, BG, HITBOX, buildSprites, buildLayers, drawMonster, paint, tinyText };
})(typeof window !== 'undefined' ? window : globalThis);
