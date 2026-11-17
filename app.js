(function () {
  const C = window.MP_CONFIG;
  const $ = (sel) => document.querySelector(sel);
  const isPlaceholder = (v) => typeof v === "string" && /^\[.*\]$/.test(v.trim());
  const get = (path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), C);

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") node.className = v;
      else node.setAttribute(k, v === true ? "" : v);
    }
    for (const c of children) if (c != null) node.append(c);
    return node;
  }
  function text(node, value) {
    node.textContent = value ?? "";
    node.classList.toggle("placeholder", isPlaceholder(value));
  }

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
  }

  // ── 단순 텍스트 바인딩 ─────────────────────────
  document.querySelectorAll("[data-bind]").forEach((n) => text(n, get(n.dataset.bind)));

  // ── 스트리밍 링크 · 뮤직비디오 ──────────────────
  function linkButton(item, cls = "btn") {
    const ready = item.url && !isPlaceholder(item.url);
    const a = el("a", {
      class: cls,
      href: ready ? item.url : null,
      target: ready ? "_blank" : null,
      rel: ready ? "noopener" : null,
      "aria-disabled": ready ? null : "true"
    }, el("span", {}, item.label), el("span", {}, ready ? "↗" : "준비 중"));
    if (isPlaceholder(item.label)) a.firstChild.classList.add("placeholder");
    return a;
  }
  // 음악 사이트: 로고 타일만 한 줄로
  C.single.streaming.forEach((s) => {
    const ready = s.url && !isPlaceholder(s.url);
    const logo = s.icon
      ? el("img", { src: s.icon, alt: "", class: s.wide ? "wide" : null })
      : el("span", { class: "mark" }, s.mark || s.label);
    const tile = el("a", {
      class: "stream-tile", style: `--tile:${s.color || "#333"}`,
      href: ready ? s.url : null, target: ready ? "_blank" : null, rel: ready ? "noopener" : null,
      "aria-label": ready ? `${s.label}에서 듣기` : `${s.label} (발매 후 열림)`,
      title: s.label, "aria-disabled": ready ? null : "true"
    }, logo);
    $("#stream-list").append(tile);
  });

  const mv = $("#mv");
  const vid = C.single.youtubeId;
  if (vid && !window.MP_PREVIEW) {
    mv.append(el("iframe", {
      src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(vid)}`,
      title: "마감펑크 뮤직비디오",
      allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
      allowfullscreen: true, loading: "lazy"
    }));
  } else {
    const href = vid ? `https://youtu.be/${encodeURIComponent(vid)}` : null;
    mv.append(el(href ? "a" : "div", { class: "mv-link", href, target: href ? "_blank" : null, rel: href ? "noopener" : null },
      el("div", { class: "play", "aria-hidden": "true" }),
      el("strong", {}, "마감펑크 뮤직비디오"),
      el("span", { class: "placeholder" }, href ? "유튜브에서 보기" : "유튜브 공개 후 이 자리에 영상이 들어갑니다")
    ));
  }

  // 뮤직비디오 크레딧
  const mvCred = $("#mv-credits");
  (C.single.mvCredits || []).forEach((r, i) => {
    if (i) mvCred.append(document.createTextNode("  ·  "));
    mvCred.append(el("span", { class: "mvc" }, el("b", {}, r.role), " " + r.names));
  });
  mvCred.hidden = !mvCred.childNodes.length;

  // 앨범 커버 옆 크레딧
  const cred = $("#credits");
  (C.single.credits || []).forEach((g) => {
    const box = el("div", { class: "cred-group" });
    if (g.title) box.append(el("p", { class: "cred-title" }, g.title));
    const dl = el("dl");
    g.rows.forEach(([role, names]) => dl.append(el("div", {}, el("dt", {}, role), el("dd", {}, names))));
    box.append(dl);
    cred.append(box);
  });

  // ── 밴드 소개 (신문 기사 배열) ──────────────────
  const news = $("#news");
  (C.band.article || []).forEach((blk) => {
    if (blk.type === "quotes") {
      const ul = el("ul", { class: "quotes" });
      blk.items.forEach((it) => ul.append(el("li", {}, el("q", {}, it.q), el("span", { class: "by" }, "– " + it.by))));
      news.append(ul);
    } else {
      const n = el("p", { class: blk.type === "ps" ? "ps" : null }); text(n, blk.text); news.append(n);
    }
  });
  C.band.members.forEach((m) => {
    const name = el("strong"); text(name, m.name);
    $("#members").append(el("li", {}, el("span", { class: "part" }, m.part), name, el("span", { class: "job" }, m.job || "")));
  });
  C.band.socials.forEach((s) => $("#socials").append(linkButton(s, "btn alt")));

  // ── 밴드 사진 갤러리 ───────────────────────────
  const photos = (C.band.photos || []).filter((p) => p && p.src);
  const gallery = $("#gallery");
  if (!photos.length) {
    for (let i = 0; i < 4; i++) gallery.append(el("div", { class: "photo empty" }, el("span", {}, "사진 자리")));
  } else {
    photos.forEach((p, i) => {
      const b = el("button", { class: "photo", type: "button", "aria-label": `${p.alt || "밴드 사진"} 크게 보기` },
        el("img", { src: p.thumb || p.src, alt: p.alt || "", loading: "lazy", decoding: "async" }));
      b.addEventListener("click", () => openLightbox(i));
      gallery.append(b);
    });
  }
  const lb = $("#lightbox");
  let lbIndex = 0, lbReturn = null;
  function showPhoto(i) {
    lbIndex = (i + photos.length) % photos.length;
    const p = photos[lbIndex];
    $("#lb-img").src = p.src; $("#lb-img").alt = p.alt || "";
    $("#lb-cap").textContent = p.caption || "";
    const many = photos.length > 1;
    $("#lb-prev").hidden = !many; $("#lb-next").hidden = !many;
  }
  function openLightbox(i) {
    lbReturn = document.activeElement;
    showPhoto(i); lb.hidden = false; document.body.style.overflow = "hidden"; $("#lb-close").focus();
  }
  function closeLightbox() {
    lb.hidden = true; document.body.style.overflow = ""; if (lbReturn) lbReturn.focus();
  }
  $("#lb-close").addEventListener("click", closeLightbox);
  $("#lb-prev").addEventListener("click", () => showPhoto(lbIndex - 1));
  $("#lb-next").addEventListener("click", () => showPhoto(lbIndex + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showPhoto(lbIndex - 1);
    else if (e.key === "ArrowRight") showPhoto(lbIndex + 1);
  });
  // 휴대폰에서 좌우로 밀어 넘기기
  let touchX = null;
  lb.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX; touchX = null;
    if (Math.abs(dx) > 40 && photos.length > 1) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
  });

  // ── 공연 일정: 픽셀 캘린더 ─────────────────────
  (function schedule() {
    const list = $("#gigs");
    const kst = (t) => new Date(t).toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }); // YYYY-MM-DD
    const todayStr = kst(Date.now());
    const gigs = ((C.schedule && C.schedule.items) || []).filter((g) => g && g.date).map((g) => ({ ...g, kind: "gig" }));
    const events = [...gigs, { kind: "release", date: kst(C.single.releaseAt), title: "마감펑크 발매", note: "모든 음원 사이트에서 만나요" }]
      .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));

    function row(e) {
      const isPast = e.date < todayStr;
      const wd = ["일", "월", "화", "수", "목", "금", "토"][new Date(Date.UTC(+e.date.slice(0, 4), +e.date.slice(5, 7) - 1, +e.date.slice(8, 10))).getUTCDay()];
      const days = Math.round((Date.parse(e.date) - Date.parse(todayStr)) / 86400000);
      const tag = isPast ? "종료" : days === 0 ? "TODAY" : `D-${days}`;
      const meta = [e.time, [e.venue, e.place].filter(Boolean).join(" · ")].filter(Boolean).join(" · ");
      const ready = e.url && !isPlaceholder(e.url) && !isPast;
      return el("li", { class: ["gig", e.kind === "release" ? "rel" : "", isPast ? "past" : ""].join(" ").replace(/\s+/g, " ").trim() },
        el("div", { class: "gig-date" }, el("span", { class: "m" }, `${+e.date.slice(5, 7)}월`), el("span", { class: "d" }, String(+e.date.slice(8, 10))), el("span", { class: "w" }, wd)),
        el("div", { class: "gig-body" },
          el("h3", { class: "gig-title" }, e.title || "공연"),
          meta ? el("p", { class: "gig-meta" }, meta) : null,
          e.note ? el("p", { class: "gig-note" }, e.note) : null),
        el("div", { class: "gig-act" },
          el("span", { class: "gig-tag" }, tag),
          ready ? el("a", { class: "btn", href: e.url, target: "_blank", rel: "noopener" }, el("span", {}, e.linkLabel || "자세히"), el("span", {}, "↗")) : null));
    }
    events.forEach((e) => list.append(row(e)));
  })();

  // ── 후원 ──────────────────────────────────────
  C.support.links.forEach((l) => {
    const title = el("h3"); text(title, l.label);
    const note = el("p"); text(note, l.note);
    $("#support-grid").append(el("div", { class: "support-card" }, title, note, linkButton({ label: "후원하러 가기", url: l.url })));
  });
  const acc = C.support.account;
  if (acc && acc.number) {
    const bank = el("p"); text(bank, `${acc.bank} · 예금주 ${acc.holder}`);
    const num = el("div", { class: "account-number", id: "account-number" }); text(num, acc.number);
    const copy = el("button", { class: "btn", type: "button" }, "계좌번호 복사");
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(acc.number);
        toast("계좌번호를 복사했어요.");
      } catch {
        const range = document.createRange();
        range.selectNodeContents(num);
        const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
        toast("계좌번호를 선택했어요. 복사해서 쓰세요.");
      }
    });
    $("#support-grid").append(el("div", { class: "support-card account" }, el("h3", {}, "계좌 후원"), bank, num, copy));
  }

  // ── 리더보드 ──────────────────────────────────
  const store = MPLeaderboard.create(C.leaderboard);
  const MY_KEY = "magampunk.mine";
  let mine = null;
  try { mine = JSON.parse(sessionStorage.getItem(MY_KEY)); } catch { /* 없음 */ }

  $("#board-mode").innerHTML = "";
  $("#board-mode").append(store.kind === "local"
    ? el("span", { class: "mode" }, "데모 모드 · 기록이 이 브라우저에만 저장돼요")
    : document.createTextNode(`전체 공개 순위 · 상위 ${C.leaderboard.size}명`));

  const fmt = new Intl.NumberFormat("ko-KR");
  // 기록(score)은 마감에게서 도망친 거리(m). 1000m 부터는 km 로 표기
  const fmtDist = (n) => (n < 1000 ? `${n}m` : `${(Math.floor(n / 10) / 100).toFixed(2)}km`);
  const when = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

  // 로고 아래 전광판: 현재 1위 + 여러 사람의 닉네임·응원 메시지를 돌려가며 송출
  function buildFeed(rows, recent) {
    const seen = new Set(), out = [];
    [rows[0], ...recent, ...rows.slice(1)].filter(Boolean).forEach((r) => {
      const key = `${r.name}|${r.score}|${r.created_at}`;
      if (seen.has(key) || out.length >= 24) return;
      seen.add(key);
      out.push(r.message ? `“${r.message}” — ${r.name}` : `${r.name} 님 ${fmtDist(r.score)} 질주 중`);
    });
    return out;
  }
  function showLeader(top, feed) {
    const box = $("#leader");
    if (!box) return;
    box.hidden = false;
    $("#crowd").hidden = false;
    const head = el("div", { class: "led-head" }, el("span", { class: "led-blink" }, "●"), " NOW 1ST ", el("span", { class: "led-blink" }, "●"));
    const ticker = (lines) => {
      const msg = lines.join("          ★          ") + "          ★          ";
      const span = el("span", {}, msg);
      span.style.animationDuration = Math.max(14, (msg.length * 13 + 520) / 85) + "s";
      return el("div", { class: "led-ticker" }, span);
    };
    if (!top) {
      box.replaceChildren(head, el("div", { class: "led-row" }, el("span", { class: "led-inner" }, el("span", { class: "led-name" }, "1위 자리가 비어 있어요"))),
        ticker(["첫 주인공이 되어 보세요!", "마감에서 가장 멀리 도망쳐 보세요!"]));
      return;
    }
    const part = MPLeaderboard.CHARACTERS[top.character];
    box.replaceChildren(
      head,
      el("div", { class: "led-row" }, el("span", { class: "led-inner" },
        el("span", { class: "led-name" }, top.name),
        part ? el("span", { class: "led-part" }, `[${part}]`) : null,
        el("span", { class: "led-score" }, fmtDist(top.score)))),
      ticker(feed.length ? feed : [`${top.name} 님이 마감에서 가장 멀리 도망쳤어요`])
    );
  }

  async function renderBoard() {
    const board = $("#board");
    let rows;
    try {
      rows = await store.top();
    } catch {
      board.replaceChildren(el("div", { class: "board-empty" }, "순위를 불러오지 못했어요. 잠시 뒤 새로고침해 주세요."));
      return;
    }
    let recent = [];
    try { recent = await store.recent(30); } catch { /* 없어도 전광판은 돌아가요 */ }
    showLeader(rows[0], buildFeed(rows, recent));
    if (!rows.length) {
      board.replaceChildren(el("div", { class: "board-empty" }, "아직 기록이 없어요. 첫 번째로 이름을 올려 보세요."));
      return;
    }
    const tbody = el("tbody");
    rows.forEach((r, i) => {
      const isMine = mine && r.name === mine.name && r.score === mine.score && r.created_at === mine.created_at;
      const cls = [i < 3 ? `top${i + 1}` : "", isMine ? "mine" : ""].join(" ").trim() || null;
      tbody.append(el("tr", { class: cls },
        el("td", { class: "rank" }, String(i + 1).padStart(2, "0")),
        el("td", { class: "name" }, r.name),
        el("td", { class: "char" }, MPLeaderboard.CHARACTERS[r.character] || "-"),
        el("td", { class: "msg" }, r.message || ""),
        el("td", { class: "num" }, fmtDist(r.score))
      ));
    });
    board.replaceChildren(el("table", {},
      el("thead", {}, el("tr", {},
        el("th", {}, "#"), el("th", {}, "NAME"), el("th", { class: "char" }, "PART"), el("th", {}, "MESSAGE"), el("th", { class: "num" }, "DISTANCE"))),
      tbody));
  }
  $("#board-refresh").addEventListener("click", (e) => {
    const b = e.currentTarget;
    b.classList.remove("spin"); void b.offsetWidth; b.classList.add("spin");
    renderBoard();
  });
  renderBoard();

  // 게임(또는 데모 폼)에서 들어온 기록 하나를 저장하고 결과를 돌려줍니다.
  async function handleSubmit(payload) {
    const row = MPLeaderboard.validate(payload);
    if (row.error) return { ok: false, error: row.error };
    try {
      const { rank } = await store.submit(row);
      mine = { name: row.name, score: row.score };
      // 방금 저장한 줄을 찾기 위해 목록을 다시 읽어 created_at 을 맞춥니다.
      const rows = await store.top();
      const hit = rows.find((r) => r.name === row.name && r.score === row.score);
      if (hit) mine.created_at = hit.created_at;
      try { sessionStorage.setItem(MY_KEY, JSON.stringify(mine)); } catch { /* 무시 */ }
      await renderBoard();
      toast(rank ? `${rank}위로 기록했어요!` : "기록했어요!");
      return { ok: true, rank };
    } catch (err) {
      return { ok: false, error: (err && err.userMessage) || "기록을 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요." };
    }
  }

  // ── 응원하는 관객: 밴드 멤버처럼 외곽선이 있는 도트 캐릭터 (뒷모습) ──
  (function crowd() {
    const cv = $("#crowd");
    if (!cv) return;
    const ctx = cv.getContext("2d"), W = cv.width, H = cv.height;
    const PW = 12, PH = 18, OY = 3, OUT = "#0a0505";
    let seed = 23;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const pick = (a) => a[Math.floor(rnd() * a.length)];
    const HAIR = ["#1c1a1f", "#3b2a22", "#6b4a2f", "#d9b25a", "#e8e0d0", "#c93f3f", "#2e3d63", "#7a4aa8", "#ff8fc7"];
    const SHIRT = ["#ff5a47", "#ffd23f", "#5cf2a0", "#6fb7ff", "#ff8fc7", "#b79bff", "#f4eedc", "#ff9a3d", "#3fb8af"];
    const PANTS = ["#3b4a7a", "#2b2b33", "#b09a6a", "#5a3a4a", "#4a6a4a"];
    const SKIN = ["#f6c7a0", "#e8b08a", "#c98a62"];
    const STICK = ["#ffd23f", "#ff5a47", "#5cf2a0", "#6fb7ff", "#ff8fc7"];
    const rgb = (c) => { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    const tone = (c, k) => `rgb(${rgb(c).map((v, i) => Math.round(v * k + [21, 19, 46][i] * (1 - k)))})`;   // 어둡게
    const lite = (c, k) => `rgb(${rgb(c).map((v) => Math.round(v + (255 - v) * k))})`;                       // 밝게

    // 미니미 스타일: 머리가 크고 몸이 작은 정면 캐릭터가 두 팔을 들고 응원봉을 흔들어요
    function sprite(p, frame, dim) {
      const g = new Array(PW * PH).fill(null);
      const put = (x, y, c) => { y += OY; if (x >= 0 && x < PW && y >= 0 && y < PH) g[y * PW + x] = c; };
      const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, c); };
      const T = (c) => (dim < 1 ? tone(c, dim) : c);
      const shirt = T(p.shirt), shirtD = tone(p.shirt, dim * 0.72), skin = T(p.skin), pants = T(p.pants);
      const hair = T(p.hair), hairD = tone(p.hair, dim * 0.7), hairL = lite(T(p.hair), 0.35);
      // 다리·신발
      rect(4, 12, 2, 2, pants); rect(6, 12, 2, 2, tone(p.pants, dim * 0.8));
      rect(3, 14, 3, 1, T("#f4eedc")); rect(6, 14, 3, 1, T("#f4eedc"));
      // 몸
      rect(4, 7, 4, 1, shirt); rect(3, 8, 6, 4, shirt); rect(8, 8, 1, 4, shirtD);
      if (p.top === "stripe") { rect(3, 9, 6, 1, T(p.shirt2)); rect(3, 11, 6, 1, T(p.shirt2)); }
      // 얼굴
      rect(2, 1, 8, 6, skin); rect(3, 0, 6, 1, skin);
      // 머리카락 / 모자
      const style = p.style;
      if (style === "cap" || style === "beanie") {
        const cap = T(p.cap);
        rect(3, 0, 6, 1, cap); rect(2, 1, 8, 2, cap); rect(9, 1, 1, 2, tone(p.cap, dim * 0.7));
        if (style === "cap") rect(1, 3, 10, 1, lite(cap, 0.18)); else { rect(2, 2, 8, 1, lite(cap, 0.3)); put(5, -1, lite(cap, 0.4)); put(6, -1, lite(cap, 0.4)); }
        rect(2, 3, 1, 1, hair); rect(9, 3, 1, 1, hair);
      } else {
        rect(3, 0, 6, 1, hair); rect(2, 1, 8, 1, hair); rect(2, 2, 2, 1, hair); rect(8, 2, 2, 1, hair);
        put(4, 0, hairL); put(5, 0, hairL); rect(9, 1, 1, 2, hairD);
        if (style === "bangs") { rect(4, 2, 4, 1, hair); put(4, 2, hairL); }
        if (style === "long") { rect(2, 3, 1, 5, hair); rect(9, 3, 1, 5, hairD); }
        if (style === "twin") { rect(1, 2, 1, 4, hair); rect(10, 2, 1, 4, hairD); }
        if (style === "bun") { rect(5, -2, 2, 2, hair); put(5, -2, hairL); }
        if (style === "spike") { put(4, -1, hair); put(6, -1, hair); put(8, -1, hairD); }
      }
      // 얼굴 표정
      if (p.face === "shades") { rect(3, 3, 6, 1, "#0b0707"); put(5, 3, "#6a4a48"); put(8, 3, "#6a4a48"); }
      else { put(4, 3, "#0b0707"); put(7, 3, "#0b0707"); if (p.face === "happy") { put(3, 3, "#0b0707"); put(8, 3, "#0b0707"); put(3, 3, skin); put(8, 3, skin); } }
      put(3, 4, "rgba(255,120,140,0.9)" ); put(8, 4, "rgba(255,120,140,0.9)");
      rect(5, 5, 2, 1, "#8a2433"); if (p.face !== "happy") put(5, 6, skin);
      // 팔
      const sway = frame ? 1 : 0, sticks = [];
      const arm = (side) => {
        const x = side < 0 ? 1 - sway : 10 + sway;
        const hand = 1 + ((side < 0) === !!frame ? 1 : 0);
        rect(x, hand + 1, 1, 7 - hand, shirt);
        for (let bx = Math.min(x, 3); bx <= Math.max(x, 8); bx++) if (bx < 3 || bx > 8) put(bx, 8, shirt);
        put(x, hand, skin);
        sticks.push([x, hand]);
      };
      if (p.arm === "both" || p.arm === "L") arm(-1);
      if (p.arm === "both" || p.arm === "R") arm(1);
      // 외곽선
      const out = g.slice();
      for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
        if (g[y * PW + x]) continue;
        if ((x > 0 && g[y * PW + x - 1]) || (x < PW - 1 && g[y * PW + x + 1]) || (y > 0 && g[(y - 1) * PW + x]) || (y < PH - 1 && g[(y + 1) * PW + x])) out[y * PW + x] = OUT;
      }
      const c = document.createElement("canvas"); c.width = PW; c.height = PH;
      const x2 = c.getContext("2d");
      const sc = frame ? lite(p.stick, 0.45) : p.stick;
      sticks.forEach(([x, hand]) => {
        x2.fillStyle = "rgba(255,240,200,0.22)";
        for (let j = -2; j <= 0; j++) { x2.fillRect(x - 1, hand + j + OY - 1, 1, 1); x2.fillRect(x + 1, hand + j + OY - 1, 1, 1); }
        x2.fillRect(x, hand + OY - 4, 1, 1);
      });
      out.forEach((col, i) => { if (col) { x2.fillStyle = col; x2.fillRect(i % PW, Math.floor(i / PW), 1, 1); } });
      sticks.forEach(([x, hand]) => {
        x2.fillStyle = sc; x2.fillRect(x, hand + OY - 2, 1, 2);
        x2.fillStyle = lite(p.stick, 0.7); x2.fillRect(x, hand + OY - 3, 1, 1);
      });
      return c;
    }

    const people = [];
    const makeRow = (yy, start, step, dim) => {
      for (let x = start; x < W - 6; x += step) {
        const arm = rnd() < 0.7 ? "both" : rnd() < 0.8 ? (rnd() < 0.5 ? "L" : "R") : "none";
        const p = {
          arm, hair: pick(HAIR), shirt: pick(SHIRT), shirt2: pick(SHIRT), skin: pick(SKIN), stick: pick(STICK), cap: pick(SHIRT), pants: pick(PANTS),
          style: pick(["short", "short", "bangs", "long", "twin", "bun", "spike", "cap", "beanie"]), top: pick(["plain", "plain", "stripe"]),
          face: pick(["dot", "dot", "happy", "shades"])
        };
        people.push({ x: Math.round(x + rnd()), y: yy, phase: rnd() < 0.5 ? 0 : 1, frames: [sprite(p, 0, dim), sprite(p, 1, dim)] });
      }
    };
    makeRow(H - PH - 6, 6, 12, 0.5);   // 뒷줄
    makeRow(H - PH, -1, 11, 1);        // 앞줄
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      people.forEach((q) => { const f = (frame + q.phase) % 2; ctx.drawImage(q.frames[f], q.x, q.y + f); });
    };
    draw();
    setInterval(() => { if (!document.hidden) { frame++; draw(); } }, 420);
  })();

  // ── 게임 임베드 ───────────────────────────────
  let frame = null;
  async function mountGame() {
    const src = C.game && C.game.src;
    if (!src) return;
    try {
      const res = await fetch(src, { method: "HEAD", cache: "no-store" });
      if (!res.ok) return;
    } catch { return; }
    frame = el("iframe", { src, title: "마감펑크 러너 게임", allow: "autoplay; fullscreen; web-share", loading: "eager" });
    // 공유 링크·점수 이미지에 들어갈 주소 (config.site.url, 없으면 지금 페이지 주소)
    frame.addEventListener("load", () => {
      const shareUrl = (C.site && C.site.url) || (window.MP_PREVIEW ? "" : location.href.split("#")[0]);
      if (shareUrl) frame.contentWindow.postMessage({ type: "magam:config", shareUrl }, "*");
    });
    $("#stage-empty").hidden = true;
    $("#stage").append(frame);
    // 게임이 화면 밖으로 거의 사라지면 일시정지
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        if (entry.intersectionRatio < 0.3) frame.contentWindow.postMessage({ type: "magam:pause" }, "*");
      }, { threshold: [0, 0.3] }).observe(frame);
    }
  }
  mountGame();

  window.addEventListener("message", async (e) => {
    if (!frame || e.source !== frame.contentWindow) return;
    const msg = e.data;
    if (!msg || typeof msg !== "object") return;
    if (msg.type === "magam:submit") {
      const result = await handleSubmit(msg);
      frame.contentWindow.postMessage({ type: "magam:submit-result", ...result }, "*");
    } else if (msg.type === "magam:share") {
      // 통계용 훅. 분석 도구를 붙이면 여기서 기록하세요. 응답은 필요 없어요.
      document.dispatchEvent(new CustomEvent("magam:share", { detail: { kind: msg.kind, score: msg.score, character: msg.character } }));
    }
  });

  // 게임이 없을 때 순위표 저장을 시험하는 데모 폼
  $("#demo-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("#demo-name").value;
    const score = 400 + Math.floor(Math.random() * 3600);
    const durationMs = Math.round((score / 40) * 1000);
    const result = await handleSubmit({ name, score, distance: Math.round(score * 0.8), durationMs });
    if (!result.ok) toast(result.error);
  });
})();

// 문의 이메일을 메일 링크로
(function () {
  const span = document.querySelector('[data-bind="band.contact"]');
  const mail = (window.MP_CONFIG.band.contact || "").trim();
  if (span && /^[^\s@\[]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    const a = document.createElement("a");
    a.href = "mailto:" + mail; a.textContent = mail;
    span.replaceChildren(a);
  }
})();
