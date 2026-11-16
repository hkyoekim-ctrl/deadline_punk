/* 마감펑크 러너 — 불과사이 멤버 5인 (v0.2, 앨범 커버 기준)
 * 프레임: {id}_run1~8(12fps), {id}_jump, {id}_slide, {id}_hit (16x24), {id}_swing1~2 (32x24, 몸은 왼쪽 16칸),
 *         {id}_portrait (32x32, 멤버별 배경색), item_{id} (14x14 악기 아이템)
 * id: vocal, guitar, bass, keys, drums
 * 사용: MP.buildMembers(make) → { frameName: canvas }  (sprites.js 다음에 불러오기)
 */
(function (root) {
  const MP = root.MP;
  const K = MP.PAL.K;
  const SKIN = { S: '#f6c7a0', s: '#d99a76' };

  // 문자 키: K 외곽 · A/a 머리 · C/c 모자 · S/s 피부 · T/t 상의 · X 프린트 · U/u 하의 · V 다리(반바지면 피부) · F 신발 · f 밑창
  const MEMBERS = {
    vocal: {
      name: '보컬', inst: '메가폰',
      pal: { A: '#2b2a33', a: '#4a4858', T: '#27c4b0', t: '#17897c', X: '#f4f4f4', U: '#c9b48a', u: '#a08c66', V: '#c9b48a', v: '#a08c66', F: '#f4f4f4', f: '#bdbdc6' },
      head: [
        '................',
        '....KKKKKK......',
        '...KAAAAAAKK....',
        '..KAAAAAAAAAK...',
        '..KAAaAAAAAAAK..',
        '..KAaSSSAAAAAK..',
        '...KSSSSSSKSK...',
        '...KsSSSSSKSK...',
        '....KsSSSSSSK...',
        '.....KKSSKKK....',
      ],
      print: 'dot',
    },
    guitar: {
      name: '기타', inst: '기타',
      pal: { A: '#3b2d29', a: '#5c4740', C: '#d4161c', c: '#8a0e12', T: '#ffd23f', t: '#d9a92a', X: '#d4161c', U: '#9fb4d8', u: '#7189b3', V: '#9fb4d8', v: '#7189b3', F: '#f4f4f4', f: '#bdbdc6' },
      head: [
        '....KKKKKK......',
        '...KCCCCCCK.....',
        '..KCCcCCCCCKKK..',
        '..KCCCCCCCCCCCK.',
        '.KAKKKKKKKKKKK..',
        'KAaAKSSSSSKSK...',
        'KAAaKSSSSSKSK...',
        'KaAAKsSSSSSSK...',
        '.KAaAKsSSKKK....',
        '.KAAaAKSSK......',
      ],
      hairBack: true, ripped: true,
    },
    bass: {
      name: '베이스', inst: '베이스',
      pal: { A: '#1f1e26', a: '#3a3846', T: '#8b6ce0', t: '#6447b8', X: '#ffd23f', U: '#4a4956', u: '#34333f', V: '#4a4956', v: '#34333f', F: '#2a2934', f: '#e8e8ee' },
      head: [
        '................',
        '.....KKKKK......',
        '....KAAAAAKK....',
        '...KAAaAAAAAK...',
        '...KAAAAAaAAK...',
        '...KAASSSSKSK...',
        '...KASSSSSKSK...',
        '...KsSSSSSSSK...',
        '....KsSSSKKK....',
        '.....KKSSK......',
      ],
      print: 'chest',
    },
    keys: {
      name: '키보드', inst: '키보드',
      pal: { A: '#1f1e26', a: '#3a3846', T: '#ff7aa8', t: '#d94f80', X: '#f4f4f4', U: '#3c3b48', u: '#2a2934', V: '#f6c7a0', v: '#d99a76', F: '#d4161c', f: '#f4f4f4' },
      head: [
        '................',
        '....KKKKKKK.....',
        '...KAAAAAAAK....',
        '..KAAAaAAAAAK...',
        '..KAAAAAAAAAK...',
        '..KAAAAAAAAAAK..',
        '..KAASSSSSKSK...',
        '..KAAsSSSSSSK...',
        '..KAaAKsSKKK....',
        '...KKK.KSSK.....',
      ],
      print: 'graphic', shorts: true,
    },
    drums: {
      name: '드럼', inst: '드럼스틱',
      pal: { A: '#2b2a33', a: '#4a4858', T: '#ff8a3d', t: '#d4682a', X: '#1b1533', U: '#7d8a6a', u: '#5f6b4f', V: '#7d8a6a', v: '#5f6b4f', F: '#f4f4f4', f: '#bdbdc6' },
      head: [
        '................',
        '....KKKKKK......',
        '...KAAAAAAKK....',
        '..KAAAAAAAAAK...',
        '.KAAaAAaAAAAAK..',
        '..KAaSSSSAKSK...',
        '..KASSSSSSKSK...',
        '..KAsSSSSSSSK...',
        '...KAKsSSKKK....',
        '....K.KSSK......',
      ],
      ripped: true,
    },
  };

  function torso(m) {
    const p = m.print;
    const mid = p === 'graphic' ? '..KTtXTXTXTTtK..' : p === 'chest' ? '..KTtTTXXTTTtK..' : p === 'dot' ? '..KTtTTTTXTTtK..' : '..KTtTTTTTTTtK..';
    const rows = [
      '....KTTTTTTK....',
      '..KTTTTTTTTTTK..',
      mid,
      '...KStTTTTtSK...',
      m.shorts ? '....KTTTTTTK....' : '....KTTTTTTK....',
      '....KUUUUUUK....',
      m.shorts ? '....KUUuuUUK....' : '....KUUuuUUK....',
    ];
    if (m.hairBack) { rows[0] = '.KAaKTTTTTTK....'; rows[1] = '.KaAKTTTTTTTTK..'; rows[2] = rows[2].replace(/^\.\.K/, '.KA'); }
    return rows;
  }

  // 다리: V 다리, F 신발, f 밑창
  // 오른쪽으로 달림: V = 앞쪽 다리, v = 뒤쪽 다리(어둡게). 1·3 = 뻗기, 2·4 = 차올리기
  const LEGS = {
    run1: ['....KvvVVVK.....', '...KvvK.KVVK....', '..KvvK...KVVK...', '.KvvK.....KVVK..', 'KFFK.......KVK..', 'KffK.......KFFK.', '...........KffK.'],
    run2: ['....KvvVVVK.....', '..KvvKKVVK......', 'KFFvK.KVVK......', 'KffK..KVVK......', '......KVVK......', '......KFFFK.....', '......KfffK.....'],
    run3: ['....KVVvvvK.....', '...KVVK.KvvK....', '..KVVK...KvvK...', '.KVVK.....KvvK..', 'KFFK.......KvK..', 'KffK.......KFFK.', '...........KffK.'],
    run4: ['....KVVvvvK.....', '..KVVKKvvK......', 'KFFVK.KvvK......', 'KffK..KvvK......', '......KvvK......', '......KFFFK.....', '......KfffK.....'],
    jump: ['....KvvVVK......', '...KvvKKVVK.....', '..KFFK..KVVK....', '..KffK...KFFK...', '.........KffK...', '................', '................'],
  };

  function legs(m, name) {
    let rows = LEGS[name].slice();
    if (m.ripped) rows = rows.map((r, i) => (i === 3 ? r.replace('VV', 'VW') : r));
    return rows;
  }

  function palOf(m, extra) {
    return Object.assign({ K, W: '#e8e8ee' }, SKIN, m.pal, extra || {});
  }

  function bodyRows(m, legName) {
    // 달리기 프레임은 상체를 1칸 앞으로 기울임
    const lean = legName.startsWith('run') ? r => ('.' + r).slice(0, 16) : r => r;
    return m.head.concat(torso(m)).map(lean).concat(legs(m, legName));
  }

  function slideRows(m) {
    const shift = r => ('..' + r).slice(0, 16);
    const head = m.head.slice(2, 10).map(shift);
    const body = [
      '..KTTTTTTTK.....',
      '.KTTTTTXTTTK....',
      'KTtTTTTTTtSK....',
      'KUUUUUUUUUUK....',
      'KUUuuUUVVVVVFK..',
      '.KKKKKKKKKVVVFFK',
      '..........KKKKfK',
    ];
    return Array(9).fill('................').concat(head, body);
  }

  // ── 악기(무기) 그리기: 손 위치(hx,hy)에서 각도 ang(라디안, 0=앞)으로
  const px = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w || 1, h || 1); };
  function stroke(c, col, x0, y0, x1, y1, w) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (let i = 0; i <= n; i++) px(c, col, Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), w || 1, w || 1);
  }
  const INST_COL = {
    vocal: { body: '#f4f4f4', dark: '#bdbdc6', accent: '#ffd23f' },
    guitar: { body: '#c9ced6', dark: '#9aa1ad', accent: '#eef1f5', guard: '#26232f', neck: '#5a3a2a', head: '#26232f' },
    bass: { body: '#f1ead8', dark: '#cfc6ae', accent: '#26232f', guard: '#cfe3cf', neck: '#5a3a2a', head: '#e0b46a' },
    keys: { body: '#f4f4f4', dark: '#bdbdc6', accent: '#1b1533' },
    drums: { body: '#e8c48a', dark: '#b08a50', accent: '#e8c48a' },
  };
  // 기타·베이스 바디 도트(넥이 위로 나가는 방향). S 바디 · s 그림자 · P 픽가드 · W 크롬 · B 픽업
  const GUITAR_BODY = {
    guitar: [ // 은색 더블컷(뿔 두 개), 검은 픽가드
      'KK...KK',
      'KSK.KSK',
      'KSSKSSK',
      'KSPPPSK',
      'KSPWPSK',
      'KSsPsSK',
      'KsSWSsK',
      '.KsSsK.',
      '..KKK..',
    ],
    bass: [ // 흰색 바디, 민트 픽가드, 위쪽 뿔이 더 긺
      'KK.....',
      'KSK..K.',
      'KSSKKSK',
      'KSPPPSK',
      'KSPBPSK',
      'KSSPPSK',
      'KSSSSsK',
      'KsSWSsK',
      '.KsSsK.',
      '..KKK..',
    ],
  };
  function bodyPal(id) { const c = INST_COL[id]; return { K, S: c.body, s: c.dark, P: c.guard, W: c.accent, B: K }; }
  const rotCW = rows => { const h = rows.length, w = rows[0].length, out = []; for (let x = 0; x < w; x++) { let r = ''; for (let y = h - 1; y >= 0; y--) r += rows[y][x]; out.push(r); } return out; };
  function drawNeck(c, id, x0, y0, x1, y1) {
    const col = INST_COL[id];
    stroke(c, K, x0, y0, x1, y1, 2); stroke(c, col.neck, x0, y0, x1, y1, 1);
    px(c, K, x1 - 1, y1 - 1, 3, 3); px(c, col.head, x1, y1);
  }

  // 기타·베이스를 몸통+넥+헤드 한 덩어리로, 원하는 각도로 1배 픽셀에 찍음(꺾임 없음)
  //   (ox,oy) = 바디 끝점, ang = 넥 방향(도, 0=오른쪽, 90=위)
  const GTR = {
    guitar: { L: 18.5, neck: 6.0, body: '#c9ced6', dark: '#9aa1ad', hl: '#eef1f5', guard: '#26232f', pick: '#eef1f5', fb: ['#7a4a2e', '#9a6440'], dot: '#f4f4f4', head: '#26232f', tuner: '#e8e8ee' },
    bass:   { L: 20, neck: 6.4, body: '#f2efe6', dark: '#c9c3b2', hl: '#ffffff', guard: '#7fd4c0', pick: '#26232f', fb: ['#c98f4e', '#e0b46a'], dot: '#26232f', head: '#e0b46a', tuner: '#e8e8ee' },
  };
  function gtrPart(id, u, v) {
    const g = GTR[id], a = Math.abs(v);
    if (u < 0 || u > g.L) return null;
    if (u > g.L - 2.6) return a < 1.05 ? 'head' : null;
    if (u > g.neck) {
      if (a < 1.0) return 'neck';
      if (id === 'guitar' && u < 7.8 && a >= 1.0 && a < 3.6 && u > 6.2 - (a - 1) * 0.3) return a < 1.6 ? null : 'body';   // SG 양쪽 뿔
      if (id === 'bass' && u < 8.6 && v < -1.2 && v > -4.0 - (u - 6.6) * 0.2) return 'body';                          // 베이스 위쪽 긴 뿔
      if (id === 'bass' && u < 7.2 && v > 1.2 && v < 3.4) return 'body';
      return null;
    }
    let w;
    if (id === 'guitar') w = u < 0.9 ? 3.0 : u < 5.6 ? 4.0 : 3.6;
    else w = u < 0.9 ? 3.4 : u < 3.6 ? 4.6 : u < 5.0 ? 3.7 : 4.0;
    return a < w ? 'body' : null;
  }
  function gtrColor(id, part, u, v) {
    const g = GTR[id], a = Math.abs(v);
    if (part === 'head') return g.head;
    if (part === 'neck') {
      const k = Math.floor((u - g.neck) / 1.5);
      if ((k === 2 || k === 4 || k === 6) && v < 0 && v > -1) return g.dot;
      return g.fb[k % 2];
    }
    // 바디
    if (id === 'guitar') {
      if (u > 2.2 && u < 6.0 && a < 1.8) return g.guard;
      if (u > 1.0 && u < 2.0 && a < 1.4) return g.pick;
    } else {
      if (u > 3.4 && u < 4.4 && a < 1.3) return g.pick;
      if (u > 2.6 && u < 7 && v > -2.6 && v < 0.8) return g.guard;
      if (u > 0.8 && u < 1.6 && a < 1.4) return '#e8e8ee';
    }
    return v > 2.4 ? g.dark : v < -2.6 ? g.hl : g.body;
  }
  function drawGuitar(c, id, ox, oy, ang) {
    const r = ang * Math.PI / 180, dx = Math.cos(r), dy = -Math.sin(r), nx = -dy, ny = dx;
    const L = GTR[id].L, cells = new Map();
    const x0 = Math.floor(Math.min(ox, ox + dx * L) - 6), x1 = Math.ceil(Math.max(ox, ox + dx * L) + 6);
    const y0 = Math.floor(Math.min(oy, oy + dy * L) - 6), y1 = Math.ceil(Math.max(oy, oy + dy * L) + 6);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const qx = x + 0.5 - ox, qy = y + 0.5 - oy, u = qx * dx + qy * dy, v = qx * nx + qy * ny;
      const part = gtrPart(id, u, v);
      if (part) cells.set(x + ',' + y, [part, gtrColor(id, part, u, v)]);
    }
    // 외곽선 + 헤드 옆 줄감개
    const out = new Map();
    for (const key of cells.keys()) {
      const [x, y] = key.split(',').map(Number);
      for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k2 = (x + ax) + ',' + (y + ay);
        if (cells.has(k2) || out.has(k2)) continue;
        out.set(k2, cells.get(key)[0] === 'head' && ((x + ax + y + ay) % 2 === 0) ? GTR[id].tuner : K);
      }
    }
    for (const [key, col] of out) { const [x, y] = key.split(',').map(Number); px(c, col, x, y); }
    for (const [key, [, col]] of cells) { const [x, y] = key.split(',').map(Number); px(c, col, x, y); }
  }

  // ── 고밀도 기타·베이스: 2배 캔버스에 직접. 몸통은 뿔·허리가 있는 다각형, 외곽선은 몸과 같은 2칸 두께
  const GT2 = {
    guitar: {
      L: 31, neckU: 11.5, headU: 25.5, nw: 1.6,
      poly: [[0, -3.4], [1, -5.6], [3, -6.6], [7.5, -6.6], [9.5, -5.6], [12.5, -5.8], [15.4, -5.4], [15.2, -4.2], [12.6, -2.4], [11.5, -1.6], [11.5, 1.6], [12.4, 2.4], [14.6, 4.0], [14.6, 5.2], [11.6, 5.6], [9.5, 5.6], [7.5, 6.6], [3, 6.6], [1, 5.6], [0, 3.4]],
      body: '#c9ced6', dark: '#9aa1ad', hl: '#f4f6f9', guard: '#26232f', chrome: '#eef1f5', knob: '#8a8f9a',
      fb: '#4a2e22', fret: '#c9ced6', dot: '#f4f4f4', head: '#26232f', logo: '#eef1f5', tuner: '#e8e8ee',
      guardPoly: [[3.4, -2.8], [11.2, -2.8], [11.2, 2.8], [6, 3.6], [3.4, 2.6]],
      pickups: [[5.2, 6.6], [8.6, 10]], bridge: [3.4, 4.2], knobs: [[2.2, 3.8], [3.8, 5.0], [5.6, 5.2]],
    },
    bass: {
      L: 33, neckU: 11.5, headU: 27.5, nw: 1.7,
      poly: [[0, -3.6], [1, -6.0], [3, -7.0], [6.5, -7.0], [8.5, -5.6], [10, -5.6], [13, -6.8], [16, -6.4], [16.2, -5.2], [12.8, -2.6], [11.5, -1.7], [11.5, 1.7], [12.4, 2.4], [14.2, 3.8], [14.0, 5.0], [11.4, 5.0], [9.5, 5.4], [7, 7.0], [3, 7.0], [1, 6.0], [0, 3.6]],
      body: '#f2efe6', dark: '#c9c3b2', hl: '#ffffff', guard: '#7fd4c0', chrome: '#e8e8ee', knob: '#9aa1ad',
      fb: '#e0b46a', fret: '#a8834a', dot: '#26232f', head: '#e0b46a', logo: '#26232f', tuner: '#e8e8ee',
      guardPoly: [[2.6, -4.6], [10.6, -4.4], [12, -2.4], [11.6, 2.6], [7, 3.8], [4, 3.2], [2.6, 1.6]],
      pickups: [[7.4, 8.8]], bridge: [2.8, 3.6], knobs: [[2.0, 4.4], [3.6, 5.4]],
    },
  };
  function inPoly(P, u, v) { let r = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [ui, vi] = P[i], [uj, vj] = P[j]; if ((vi > v) !== (vj > v) && u < (uj - ui) * (v - vi) / (vj - vi) + ui) r = !r; } return r; }
  function gt2Col(g, u, v) {
    const a = Math.abs(v);
    if (u >= g.headU) {   // 헤드: 끝으로 갈수록 살짝 넓어지는 비대칭 모양
      const hw = 1.9 + (u - g.headU) * 0.18;
      if (v < -hw || v > hw - 0.6 || u > g.L) return null;
      if (u > g.headU + 2 && u < g.headU + 3.2 && v > -0.8 && v < 0.4) return g.logo;
      return g.head;
    }
    if (u >= g.neckU) {
      if (a >= g.nw && !inPoly(g.poly, u, v)) return null;
      if (a < g.nw) {
        const f = u - g.neckU;
        if (u > g.headU - 0.9) return g.chrome;                         // 너트
        if (f % 2.4 < 0.75 && f > 3) return g.fret;                     // 프렛
        if ([5.1, 9.9, 14.7].some(d => Math.abs(f - d) < 0.7) && a < 0.9) return g.dot;
        return g.fb;
      }
    } else if (!inPoly(g.poly, u, v)) return null;
    // 몸통
    if (g.pickups.some(([a0, a1]) => u > a0 && u < a1) && a < 2.3) return u - Math.floor(u) < 0.5 && a < 1.8 ? g.chrome : '#3b3846';
    if (u > g.bridge[0] && u < g.bridge[1] && a < 2.0) return g.chrome;
    if (g.knobs.some(([ku, kv]) => Math.hypot(u - ku, v - kv) < 0.75)) return g.knob;
    if (inPoly(g.guardPoly, u, v)) return g.guard;
    return v > 4.2 ? g.dark : v < -4.6 ? g.hl : g.body;
  }
  function drawGuitar2(c, id, ox, oy, ang) {
    const g = GT2[id], r = ang * Math.PI / 180, dx = Math.cos(r), dy = -Math.sin(r), nx = -dy, ny = dx;
    const cells = new Map(), R = g.L + 10;
    for (let y = Math.floor(oy - R); y <= oy + R; y++) for (let x = Math.floor(ox - R); x <= ox + R; x++) {
      const qx = x + 0.5 - ox, qy = y + 0.5 - oy, u = qx * dx + qy * dy, v = qx * nx + qy * ny;
      if (u < 0 || u > g.L) continue;
      const col = gt2Col(g, u, v);
      if (col) cells.set(x + ',' + y, [col, u]);
    }
    // 외곽선 2칸(몸 그림 1배 외곽선과 같은 두께). 헤드 옆 첫 줄은 줄감개
    const ring1 = new Map(), ring2 = new Map();
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [key, [, u]] of cells) { const [x, y] = key.split(',').map(Number); for (const [ax, ay] of nb) { const k = (x + ax) + ',' + (y + ay); if (!cells.has(k) && !ring1.has(k)) ring1.set(k, u > g.headU + 0.6 && u < g.L - 0.5 && (x + ax + y + ay) % 3 === 0 ? g.tuner : K); } }
    for (const key of ring1.keys()) { const [x, y] = key.split(',').map(Number); for (const [ax, ay] of nb) { const k = (x + ax) + ',' + (y + ay); if (!cells.has(k) && !ring1.has(k)) ring2.set(k, K); } }
    for (const m of [ring2, ring1]) for (const [key, col] of m) { const [x, y] = key.split(',').map(Number); px(c, col, x, y); }
    for (const [key, [col]] of cells) { const [x, y] = key.split(',').map(Number); px(c, col, x, y); }
  }

  // 1배(몸과 같은 픽셀 크기) 악기 그림
  const MEGA1 = [
    '......KK.',
    '....KKWRK',
    'KKKKWWWRK',
    'KRKWWWWRY',
    'KKKKhhhRK',
    '.KMKKKhRK',
    '.KMK..KK.',
    '.KKK.....',
  ];
  const MEGA1_PAL = { K, W: '#f4f4f4', h: '#c9c9d4', R: '#e0201c', M: '#e2e2ea', Y: '#f5c518' };
  const DRUM1 = [
    '.KKKKK.',
    'KWWWWWK',
    'KYYYYYK',
    'KRyRyRK',
    'KRyRyRK',
    '.KKKKK.',
  ];
  const DRUM1_PAL = { K, W: '#f7f3e8', Y: '#f5c518', y: '#b8860b', R: '#d4241c' };
  const NECK1 = '#b5794a';
  function stick(c, x0, y0, x1, y1) {
    if (c.base) {   // 2배 캔버스: 2칸 굵기 나무 + 1칸 검은 테두리
      const b = c.base, X0 = x0 * 2 + 0.5, Y0 = y0 * 2 + 0.5, X1 = x1 * 2 + 0.5, Y1 = y1 * 2 + 0.5;
      stroke(b, K, X0 - 1, Y0 - 1, X1 - 1, Y1 - 1, 4);
      stroke(b, '#e8c48a', X0, Y0, X1, Y1, 2); stroke(b, '#b08a50', X0 + 1, Y0 + 1, X1 + 1, Y1 + 1, 1);
      px(b, K, Math.round(X1) - 2, Math.round(Y1) - 2, 5, 5); px(b, '#f7f3e8', Math.round(X1) - 1, Math.round(Y1) - 1, 3, 3);
      return;
    }
    stroke(c, '#e8c48a', x0, y0, x1, y1, 1); px(c, '#f7f3e8', x1, y1);
  }
  // 넥: 2칸 올라갈 때 1칸 옆으로(또는 일직선)만 움직여 꺾여 보이지 않게
  function neckLine(c, id, x0, y0, x1, y1) {
    const col = INST_COL[id];
    stroke(c, K, x0 + 1, y0, x1 + 1, y1, 1); stroke(c, K, x0 - 1, y0, x1 - 1, y1, 1); stroke(c, NECK1, x0, y0, x1, y1, 1);
    px(c, K, x1 - 1, y1 - 2, 3, 3); px(c, col.head, x1, y1 - 1);
  }
  function drawInstrument(c, id, hx, hy, pose) {
    const col = INST_COL[id];
    if (id === 'guitar' || id === 'bass') {
      if (pose === 0) drawGuitar(c, id, hx - 0.3, hy + 4.5, 82);
      else drawGuitar(c, id, hx - 4.5, hy - 0.5, 0);
    } else if (id === 'keys') {
      if (pose === 0) { px(c, K, hx - 2, hy - 13, 6, 14); px(c, col.body, hx - 1, hy - 12, 4, 12); for (let y = hy - 11; y < hy; y += 2) px(c, K, hx + 1, y, 2, 1); }
      else { px(c, K, hx, hy - 3, 15, 6); px(c, col.body, hx + 1, hy - 2, 13, 4); for (let x = hx + 2; x < hx + 14; x += 2) px(c, K, x, hy - 2, 1, 2); }
    } else if (id === 'drums') {
      MP.paint(c, DRUM1, hx - 4, hy + 1, DRUM1_PAL);
      if (pose === 0) { stick(c, hx - 1, hy, hx - 4, hy - 10); stick(c, hx + 1, hy, hx + 2, hy - 11); }
      else { stick(c, hx, hy - 1, hx + 12, hy - 4); stick(c, hx, hy, hx + 12, hy + 1); px(c, MP.PAL.Y, hx + 15, hy - 5, 1, 2); px(c, MP.PAL.Y, hx + 16, hy - 1, 2, 1); px(c, MP.PAL.Y, hx + 15, hy + 3, 1, 2); }
    } else if (id === 'vocal') {
      if (pose === 0) MP.paint(c, rotCCW(MEGA1), hx - 3, hy - 11, MEGA1_PAL);
      else {
        MP.paint(c, MEGA1, hx - 1, hy - 4, MEGA1_PAL);
        for (const r of [4, 7, 10]) { px(c, col.accent, hx + 6 + r, hy - r / 2 - 2, 1, 2); px(c, col.accent, hx + 7 + r, hy - 1, 1, 2); px(c, col.accent, hx + 6 + r, hy + r / 2, 1, 2); }
      }
    }
  }

  // 들고 달리기(1배 좌표). 기타·베이스는 연주하듯 앞으로 멤
  function drawCarry(c, id, back, dy) {
    dy = dy || 0;
    const col = INST_COL[id];
    if (back) return;
    if (id === 'guitar' || id === 'bass') {
      const bass = id === 'bass';
      drawGuitar(c, id, bass ? 2.2 : 2.6, 19.2 + dy, 45);   // 바디와 넥을 같은 45도로
    } else if (id === 'keys') {
      px(c, K, 7, 12 + dy, 9, 5); px(c, col.body, 8, 13 + dy, 7, 3); for (let x = 9; x < 15; x += 2) px(c, K, x, 13 + dy, 1, 2);
    } else if (id === 'drums') {
      MP.paint(c, DRUM1, 8, 13 + dy, DRUM1_PAL);
      stick(c, 6, 8 + dy, 9, 13 + dy); stick(c, 15, 8 + dy, 13, 13 + dy);
    } else if (id === 'vocal') {
      MP.paint(c, MEGA1, 7, 10 + dy, MEGA1_PAL);
    }
  }
  const BACK = { guitar: true, bass: true };

  function itemIcon(c, id) {
    // 14x14: 노란 테두리 원판 위 악기
    for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) {
      const d = Math.hypot(x + 0.5 - 7, y + 0.5 - 7);
      if (d <= 7) px(c, d > 6 ? K : d > 5 ? MP.PAL.Y : '#2b2263', x, y);
    }
    // 번개 연필(앨범 커버 로고) — 먹으면 들고 있던 악기를 휘두름
    const R = '#d4161c';
    const bolt = ['....KKKK', '...KRRK.', '..KRRK..', '.KRRRRK.', '..KKRRK.', '...KRK..', '...KK...'];
    for (let y = 0; y < bolt.length; y++) for (let x = 0; x < 8; x++) { const ch = bolt[y][x]; if (ch === 'K') px(c, K, x + 3, y + 3); else if (ch === 'R') px(c, R, x + 3, y + 3); }
  }

  // 초상화 배경: 멤버마다 옷 색과 대비되는 색
  const PORTRAIT_BG = {
    vocal: ['#e2483b', '#b8352b'], guitar: ['#3a6fd8', '#2a52a8'], bass: ['#f2b134', '#c88a1c'],
    keys: ['#1fae8c', '#16836a'], drums: ['#6a4cc9', '#4d3599'],
  };
  // ── 8프레임 달리기(사용자 참고 시안의 관절 방식): 엉덩이·무릎·발 좌표를 잇고, 상체는 프레임마다 위아래로 1px 바운스
  // 참고 시안(32x40) 좌표를 16x24 칸에 맞게 줄여 씀. bob: +1 = 아래로 가라앉음, -1 = 위로 뜸
  const RUN8 = [
    { bob: 0, f: [15, 26, 19, 31, 22, 36, 4], b: [13, 26, 10, 30, 6, 33, 3] },
    { bob: 1, f: [15, 26, 17, 31, 16, 36, 4], b: [13, 26, 11, 30, 9, 31, 3] },
    { bob: 0, f: [14, 26, 13, 31, 11, 36, 4], b: [15, 26, 18, 29, 16, 33, 3] },
    { bob: -1, f: [13, 26, 10, 30, 7, 33, 3], b: [16, 26, 20, 29, 21, 34, 4] },
    { bob: 0, f: [13, 26, 10, 30, 6, 33, 3], b: [15, 26, 19, 31, 22, 36, 4] },
    { bob: 1, f: [13, 26, 11, 30, 9, 31, 3], b: [15, 26, 17, 31, 16, 36, 4] },
    { bob: 0, f: [15, 26, 18, 29, 16, 33, 3], b: [14, 26, 13, 31, 11, 36, 4] },
    { bob: -1, f: [16, 26, 20, 29, 21, 34, 4], b: [13, 26, 10, 30, 7, 33, 3] },
  ];
  const mapX = x => Math.round(7.5 + (x - 14.5) * 0.62);
  const mapY = y => Math.round(17 + (y - 26) * 0.5);
  function drawLeg8(c, L, bob, legCol, shoe, sole) {
    const hx = mapX(L[0]), hy = mapY(L[1]) + bob, kx = mapX(L[2]), ky = mapY(L[3]) + Math.round(bob * 0.5);
    const fx = mapX(L[4]), fy = Math.min(22, mapY(L[5])), boot = L[6] >= 4 ? 3 : 2;
    const limb = (col, grow) => { stroke(c, col, hx - grow, hy - grow, kx - grow, ky - grow, 2 + grow * 2); stroke(c, col, kx - grow, ky - grow, fx - grow, fy - 1 - grow, 2 + grow * 2); };
    limb(K, 1);
    px(c, K, fx - 1, fy - 1, boot + 2, 3 + (fy < 22 ? 0 : 0));
    limb(legCol, 0);
    px(c, shoe, fx, fy, boot, 1); px(c, sole, fx, fy + 1, boot, 1);
  }
  function runFrame8(make, m, id, pal, i, carry) {
    const fr = RUN8[i], c = make(16, 24), x = c.getContext('2d');
    const upper = m.head.concat(torso(m)).map(r => ('.' + r).slice(0, 16));
    const B = !!BACK[id];
    drawLeg8(x, fr.b, fr.bob, pal.v || pal.V, pal.F, pal.f);
    // 상체는 bob만큼 이동해 따로 그림
    const tmp = make(16, 24), tx = tmp.getContext('2d');
    if (carry !== false && B) drawCarry(tx, id, true);
    MP.paint(tx, upper, 0, 0, pal);
    if (carry !== false && !B) drawCarry(tx, id, false);
    x.drawImage(tmp, 0, 0, 16, 17, 0, fr.bob, 16, 17);
    drawLeg8(x, fr.f, fr.bob, pal.V, pal.F, pal.f);
    return c;
  }

  // ── 고밀도 악기(2배 해상도). 멤버 프레임은 2배 크기(32x48 등)로 만들고, 몸은 2배로 키우고 악기만 2배 촘촘한 도트로 그림.
  // 게임에서는 화면을 2배(640x360)로 그리고 멤버 프레임을 절반 크기(16x24 논리 픽셀)로 찍으면 악기만 고밀도로 보임.
  const HD_PAL = {
    guitar: { K, S: '#c9ced6', s: '#8f96a3', h: '#f4f6f9', P: '#26232f', W: '#eef1f5', k: '#4a4858', o: '#e8e8ee', L: '#b9b3d6' },
    bass: { K, S: '#f1ead8', s: '#c9bfa4', h: '#fffaf0', P: '#cfe3cf', p: '#9fbf9f', W: '#d8dbe2', k: '#26232f', o: '#d8dbe2', L: '#b9b3d6' },
  };
  const NECK = { guitar: { wood: '#4a2e22', dot: '#f4f4f4', head: '#26232f', tuner: '#e8e8ee' }, bass: { wood: '#4a2e22', dot: '#f4f4f4', head: '#e0b46a', tuner: '#e8e8ee' } };
  const HD_BODY = {
    guitar: [
      'KK..........KK',
      'KhK........KSK',
      'KShK......KSSK',
      'KSShKK..KKSSsK',
      'KSSSSPKKPSSSsK',
      'KShSPPWWPPSSsK',
      'KShSPPkkPPSSsK',
      'KShSPPWWPPSSsK',
      'KShSSPLLPSSSsK',
      'KShSSPWWPSSSsK',
      'KShSSPkkPSSSsK',
      'KShSSPWWPSSSsK',
      'KShSSSLLSSSSsK',
      'KShSSWWWWSSSsK',
      '.KhSSSLLSSoSK.',
      '.KhSSSSSSoSsK.',
      '..KsSSSoSSsK..',
      '...KKKKKKKK...',
    ],
    bass: [
      'KK............',
      'KhK...........',
      'KShK.......KK.',
      'KSShK.....KSK.',
      'KSSSSKKKKSSSK.',
      'KShSPPPPPPSSSK',
      'KShPPPPLLPPSsK',
      'KShPkkPLLPPSsK',
      'KShPkkPLLPPSsK',
      'KShPPPPkkkPSsK',
      'KShPPPPkkkPSsK',
      'KSSPPPPLLPPSsK',
      'KSSSPPPLLPSSsK',
      'KSSSSWWWWSSosK',
      'KSSSSWWWWSSSsK',
      'KSSSSSLLSSoSsK',
      '.KSSSSSSSSSsK.',
      '..KSSSSSSSsK..',
      '...KKKKKKKK...',
    ],
  };
  // 확성기: 흰 나팔 + 빨간 뒷마개·입구 테 + 노란 속 + 손잡이 (사용자 참고 이미지)
  const MEGA = [
    '..........KK....',
    '........KKWRK...',
    '......KKWWWRK...',
    'KKKKKKWWWWWRKK..',
    'KRRKWWWWWWWRKYK.',
    'KRRKWWWWWWhRKYYK',
    'KRRKhhhhhhhRKYYK',
    'KKKKKKhhhhhRKYK.',
    '..KMK.KKhhhRKK..',
    '..KMK...KKhRK...',
    '..KMMK....KRK...',
    '...KMK.....KK...',
    '...KKK..........',
  ];
  const MEGA_PAL = { K, W: '#f4f4f4', h: '#c9c9d4', R: '#e0201c', M: '#e2e2ea', Y: '#f5c518' };
  // 드럼: 스네어 하나 (흰 가죽, 금색 테, 빨간 몸통)
  const DRUM = [
    '..KKKKKKKKKK..',
    '.KWWWWWWWWWhK.',
    'KWWWWWWWWWWWhK',
    'KYWWWWWWWWWWYK',
    'KYYYYYYYYYYYYK',
    'KRRyRRRyRRRyRK',
    'KRRyRRRyRRRyrK',
    'KRRyRRRyRRRyrK',
    'KyyyyyyyyyyyyK',
    '.KYYYYYYYYYYK.',
    '..KKKKKKKKKK..',
  ];
  const DRUM_PAL = { K, W: '#f7f3e8', h: '#d8d0c0', Y: '#f5c518', y: '#b8860b', R: '#d4241c', r: '#a3171a' };
  function keysGrid(w) {
    const rows = [];
    const edge = 'K'.repeat(w);
    let top = 'K'; for (let x = 1; x < w - 1; x++) top += x < w - 8 ? (x % 3 === 1 ? 'o' : 'W') : (x === w - 2 ? 'W' : 'k'); top += 'K';
    let blk = 'K'; for (let x = 1; x < w - 1; x++) { const n = (x - 1) % 7; blk += (n === 1 || n === 3 || n === 6) ? 'k' : 'W'; } blk += 'K';
    let sep = 'K'; for (let x = 1; x < w - 1; x++) sep += (x % 2 === 0) ? 'L' : 'W'; sep += 'K';
    rows.push(edge, top, 'K' + 'W'.repeat(w - 2) + 'K', blk, blk, 'K' + 'W'.repeat(w - 2) + 'K', sep, edge);
    return rows;
  }
  const KEYS_PAL = { K, W: '#f4f4f4', k: '#26232f', o: '#d4161c', L: '#b9b3d6' };
  const rotCCW = rows => { const h = rows.length, w = rows[0].length, out = []; for (let x = w - 1; x >= 0; x--) { let r = ''; for (let y = 0; y < h; y++) r += rows[y][x]; out.push(r); } return out; };

  function hdNeck(c, id, x0, y0, x1, y1) {
    const n = NECK[id];
    stroke(c, K, x0 - 1, y0 - 1, x1 - 1, y1 - 1, 4);
    stroke(c, n.wood, x0, y0, x1, y1, 2);
    const len = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 4; i < len - 3; i += 5) { const fx = Math.round(x0 + (x1 - x0) * i / len), fy = Math.round(y0 + (y1 - y0) * i / len); px(c, n.dot, fx, fy); }
    // 헤드
    const hx = x1 - 2, hy = y1 - 2;
    px(c, K, hx - 1, hy - 1, 6, 6); px(c, n.head, hx, hy, 4, 4);
    px(c, n.tuner, hx - 1, hy, 1, 1); px(c, n.tuner, hx - 1, hy + 2, 1, 1); px(c, n.tuner, hx + 4, hy + 1, 1, 1); px(c, n.tuner, hx + 4, hy + 3, 1, 1);
  }
  function hdSticks(c, pts) {
    for (const [x0, y0, x1, y1] of pts) {
      stroke(c, K, x0 - 1, y0 - 1, x1 - 1, y1 - 1, 3);
      stroke(c, '#e8c48a', x0, y0, x1, y1, 1);
      stroke(c, '#b08a50', x0 + 1, y0, x1 + 1, y1, 1);
      px(c, K, x1 - 2, y1 - 2, 4, 4); px(c, '#f4e2bd', x1 - 1, y1 - 1, 2, 2);
    }
  }
  // 들고 달리기(2배 좌표). dy는 1배 기준 위아래 이동
  // 1배 좌표 그리기를 2배 캔버스에 그대로 옮기는 래퍼(fillRect만 사용하는 그림용)
  const x2 = c => ({ base: c, set fillStyle(v) { c.fillStyle = v; }, fillRect(x, y, w, h) { c.fillRect(x * 2, y * 2, w * 2, h * 2); } });
  function hdCarry(c, id, layer, dy) {
    if (layer !== 'front') return;
    const d = (dy || 0) * 2;
    if (id === 'guitar') drawGuitar2(c, id, 6.5, 40.5 + d, 46);
    else if (id === 'bass') drawGuitar2(c, id, 7.5, 41.5 + d, 52);
    else drawCarry(x2(c), id, false, dy || 0);
  }
  // 휘두르기: 1배 좌표 그림을 2배 캔버스에. pose 0: 치켜듦, 1: 앞으로 내려침
  function hdSwing(c, id, pose) {
    if (id === 'guitar' || id === 'bass') {
      if (pose === 0) drawGuitar2(c, id, 21, 44, 84);   // 치켜듦
      else drawGuitar2(c, id, 16, 27.5, 4);              // 앞으로 내려침
      return;
    }
    if (pose === 0) drawInstrument(x2(c), id, 12, 13, 0); else drawInstrument(x2(c), id, 13, 13, 1);
  }
  const flipH = rows => rows.map(r => [...r].reverse().join(''));
  const MP_rotCW = rows => { const h = rows.length, w = rows[0].length, out = []; for (let x = 0; x < w; x++) { let r = ''; for (let y = h - 1; y >= 0; y--) r += rows[y][x]; out.push(r); } return out; };

  // 1배 몸 캔버스를 2배로 키우고 그 위·아래에 고밀도 악기 그리기
  function hdCompose(make, body1x, id, dy) {
    const w = body1x.width, h = body1x.height, c = make(w * 2, h * 2), x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    hdCarry(x, id, 'back', dy);
    x.drawImage(body1x, 0, 0, w * 2, h * 2);
    hdCarry(x, id, 'front', dy);
    return c;
  }

  function buildMembers(make) {
    const out = {};
    for (const id in MEMBERS) {
      const m = MEMBERS[id], pal = palOf(m);
      const hitPal = {}; for (const k in pal) hitPal[k] = k === 'K' ? K : '#ffc2d0';
      const body = (rows, p) => { const c = make(16, 24); MP.paint(c.getContext('2d'), rows, 0, 0, p || pal); return c; };
      out[id + '_jump'] = hdCompose(make, body(bodyRows(m, 'jump')), id, 0);
      for (let i = 0; i < 8; i++) out[id + '_run' + (i + 1)] = hdCompose(make, runFrame8(make, m, id, pal, i, false), id, RUN8[i].bob);
      { const s1 = body(slideRows(m)), c = make(32, 48), x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(s1, 0, 0, 32, 48); out[id + '_slide'] = c; }
      out[id + '_hit'] = hdCompose(make, body(bodyRows(m, 'run2'), hitPal), id, 0);
      for (const pose of [0, 1]) {
        const b = make(32, 24); MP.paint(b.getContext('2d'), bodyRows(m, pose === 0 ? 'run3' : 'run1'), 0, 0, pal);
        const c = make(64, 48), x = c.getContext('2d'); x.imageSmoothingEnabled = false;
        x.drawImage(b, 0, 0, 64, 48); hdSwing(x, id, pose);
        out[id + '_swing' + (pose + 1)] = c;
      }
      { // 초상화 64x64: 머리·어깨(+악기)를 4배로, 배경은 멤버별 색
        const c = make(64, 64), x = c.getContext('2d');
        const bg = PORTRAIT_BG[id]; px(x, bg[0], 0, 0, 64, 64); px(x, bg[1], 0, 52, 64, 12);
        const f = hdCompose(make, body(bodyRows(m, 'run1')), id, 0);
        x.imageSmoothingEnabled = false; x.drawImage(f, 0, 0, 32, 32, 0, 0, 64, 64);
        out[id + '_portrait'] = c;
      }
    }
    return out;
  }

  // 휘두르기 판정(swing2 기준, 스프라이트 좌상단 기준): 악기 닿는 범위
  const SWING_HITBOX = { vocal: [14, 2, 18, 20], guitar: [12, 4, 16, 16], bass: [12, 4, 18, 16], keys: [12, 6, 16, 12], drums: [12, 4, 16, 16] };

  MP.MEMBERS = MEMBERS; MP.SWING_HITBOX = SWING_HITBOX; MP.buildMembers = buildMembers; MP.MEMBER_SCALE = 2;
})(typeof window !== 'undefined' ? window : globalThis);
