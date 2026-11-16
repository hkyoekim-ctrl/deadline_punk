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

  function drawInstrument(c, id, hx, hy, pose) {
    const col = INST_COL[id];
    if (id === 'guitar' || id === 'bass') {
      // pose 0: 넥을 위로 세워 치켜듦, 1: 앞으로 눕혀 내려침(바디는 손 쪽)
      const L = id === 'bass' ? 13 : 11, rows = GUITAR_BODY[id];
      if (pose === 0) {
        drawNeck(c, id, hx + 1, hy - 1, hx + 2, Math.max(1, hy - L));
        MP.paint(c, rows, hx - 2, hy - 1, bodyPal(id));
      } else {
        drawNeck(c, id, hx + 3, hy, Math.min(30, hx + 3 + L + 2), hy - 1);
        const r = rotCW(rows); MP.paint(c, r, hx - 4, hy - 3, bodyPal(id));
      }
    } else if (id === 'keys') {
      if (pose === 0) { px(c, K, hx - 2, hy - 13, 6, 14); px(c, col.body, hx - 1, hy - 12, 4, 12); for (let y = hy - 11; y < hy; y += 2) px(c, K, hx + 1, y, 2, 1); }
      else { px(c, K, hx, hy - 3, 15, 6); px(c, col.body, hx + 1, hy - 2, 13, 4); for (let x = hx + 2; x < hx + 14; x += 2) px(c, K, x, hy - 2, 1, 2); }
    } else if (id === 'drums') {
      const tips = pose === 0 ? [[-3, -11], [1, -12]] : [[11, -3], [12, 1]];
      for (const [tx, ty] of tips) { stroke(c, K, hx, hy, hx + tx, hy + ty, 2); stroke(c, col.body, hx, hy, hx + tx, hy + ty, 1); }
      if (pose === 1) { px(c, MP.PAL.Y, hx + 15, hy - 5, 1, 2); px(c, MP.PAL.Y, hx + 16, hy - 1, 2, 1); px(c, MP.PAL.Y, hx + 15, hy + 3, 1, 2); }
    } else if (id === 'vocal') {
      if (pose === 0) { px(c, K, hx - 2, hy - 8, 5, 9); px(c, col.body, hx - 1, hy - 7, 3, 7); px(c, K, hx - 3, hy - 10, 7, 3); px(c, col.body, hx - 2, hy - 9, 5, 1); }
      else {
        px(c, K, hx, hy - 2, 4, 4); px(c, col.body, hx + 1, hy - 1, 2, 2);
        px(c, K, hx + 3, hy - 4, 4, 8); px(c, col.body, hx + 4, hy - 3, 2, 6); px(c, col.dark, hx + 4, hy + 1, 2, 1);
        for (const r of [4, 7, 10]) { px(c, col.accent, hx + 6 + r, hy - r / 2 - 1, 1, 2); px(c, col.accent, hx + 7 + r, hy - 1, 1, 2); px(c, col.accent, hx + 6 + r, hy + r / 2, 1, 2); }
      }
    }
  }

  // 들고 달리기: back = 몸 뒤(기타·베이스는 등에 멤), 아니면 몸 앞(손에 듦)
  function drawCarry(c, id, back, dy) {
    dy = dy || 0;
    const col = INST_COL[id];
    if ((id === 'guitar' || id === 'bass') && back) {
      const top = id === 'bass' ? 1 : 3;
      drawNeck(c, id, 3, 12 + dy, 1, top + dy);
      MP.paint(c, GUITAR_BODY[id], 0, 11 + dy, bodyPal(id));
    } else if (!back && id === 'keys') {
      px(c, K, 7, 12 + dy, 9, 5); px(c, col.body, 8, 13 + dy, 7, 3); for (let x = 9; x < 15; x += 2) px(c, K, x, 13 + dy, 1, 2);
    } else if (!back && id === 'drums') {
      stroke(c, K, 12, 14 + dy, 15, 8 + dy, 1); stroke(c, col.body, 11, 14 + dy, 14, 8 + dy, 1); px(c, K, 13, 7 + dy, 2, 1);
    } else if (!back && id === 'vocal') {
      px(c, K, 11, 12 + dy, 3, 4); px(c, K, 13, 10 + dy, 3, 8); px(c, col.body, 14, 11 + dy, 1, 6); px(c, col.body, 12, 13 + dy, 2, 2); px(c, col.dark, 14, 15 + dy, 1, 1);
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
  const x2 = c => ({ set fillStyle(v) { c.fillStyle = v; }, fillRect(x, y, w, h) { c.fillRect(x * 2, y * 2, w * 2, h * 2); } });
  function hdCarry(c, id, layer, dy) {
    const d = (dy || 0) * 2;
    if ((id === 'guitar' || id === 'bass') && layer === 'front') {
      // 연주하듯 앞으로 맴: 바디는 허리 앞, 넥은 오른쪽 위로 비스듬히
      hdNeck(c, id, 18, 31 + d, id === 'bass' ? 29 : 28, (id === 'bass' ? 9 : 12) + d);
      MP.paint(c, MP_rotCW(HD_BODY[id]), 3, 25 + d, HD_PAL[id]);
    } else if (layer === 'front' && id === 'keys') {
      drawCarry(x2(c), 'keys', false, dy || 0); // 키보드는 기존 1배 그림을 2배로
    } else if (layer === 'front' && id === 'drums') {
      MP.paint(c, DRUM, 15, 27 + d, DRUM_PAL);
      const up = (dy || 0) ? 2 : 0;   // 바운스 따라 스틱이 살짝 들썩
      hdSticks(c, [[12, 18 + d - up, 19, 27 + d], [31, 17 + d + up, 25, 27 + d]]);
      px(c, '#f7f3e8', 18, 26 + d, 2, 2); px(c, '#f7f3e8', 25, 26 + d, 2, 2);
    } else if (layer === 'front' && id === 'vocal') {
      MP.paint(c, MEGA, 16, 21 + d, MEGA_PAL);
    }
  }
  // 휘두르기(2배 좌표). pose 0: 치켜듦, 1: 앞으로 내려침
  function hdSwing(c, id, pose) {
    if (id === 'guitar' || id === 'bass') {
      const L = id === 'bass' ? 26 : 22;
      if (pose === 0) { hdNeck(c, id, 27, 22, 29, Math.max(4, 26 - L)); MP.paint(c, HD_BODY[id], 20, 21, HD_PAL[id]); }
      else { hdNeck(c, id, 29, 27, Math.min(60, 36 + L), 25); MP.paint(c, MP_rotCW(HD_BODY[id]), 18, 20, HD_PAL[id]); }
    } else if (id === 'keys') {
      if (pose === 0) drawInstrument(x2(c), 'keys', 12, 13, 0); else drawInstrument(x2(c), 'keys', 13, 13, 1);
    } else if (id === 'drums') {
      MP.paint(c, DRUM, 15, 27, DRUM_PAL);
      if (pose === 0) hdSticks(c, [[24, 27, 18, 5], [26, 27, 28, 4]]);
      else { hdSticks(c, [[26, 27, 50, 20], [26, 29, 52, 28]]); for (const [x, y] of [[56, 16], [58, 24], [56, 32]]) { px(c, MP.PAL.Y, x, y, 3, 1); px(c, MP.PAL.Y, x + 1, y - 1, 1, 3); } }
    } else if (id === 'vocal') {
      if (pose === 0) MP.paint(c, rotCCW(MEGA), 20, 6, MEGA_PAL);
      else {
        MP.paint(c, MEGA, 26, 20, MEGA_PAL);
        for (const r of [6, 12, 18]) for (let a = -3; a <= 3; a++) { const y = 26 + Math.round(a * (r / 6 + 1.5)); px(c, MP.PAL.Y, 40 + r + Math.round(Math.abs(a) * -0.6), y, 2, 2); }
      }
    }
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
