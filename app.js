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

  // ── 발매일 ────────────────────────────────────
  const release = new Date(C.single.releaseAt);
  text($("#footer-date"), new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "long" }).format(release));

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
  let anyPending = false;
  C.single.streaming.forEach((s) => {
    const ready = s.url && !isPlaceholder(s.url);
    if (!ready) anyPending = true;
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
  $("#stream-note").hidden = !anyPending;

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
  const when = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

  // 로고 아래에 현재 1위를 보여줍니다
  function showLeader(top) {
    const box = $("#leader");
    if (!box) return;
    box.hidden = false;
    const head = el("div", { class: "led-head" }, el("span", { class: "led-blink" }, "●"), " NOW 1ST ", el("span", { class: "led-blink" }, "●"));
    if (!top) {
      box.replaceChildren(head, el("div", { class: "led-row" }, el("span", { class: "led-inner" }, el("span", { class: "led-name" }, "1위 자리가 비어 있어요"))),
        el("div", { class: "led-ticker" }, el("span", {}, "첫 주인공이 되어 보세요! ★ 첫 주인공이 되어 보세요! ★ ")));
      return;
    }
    const part = MPLeaderboard.CHARACTERS[top.character];
    const tick = top.message ? `“${top.message}” — ${top.name}` : `${top.name} 님이 마감에서 가장 멀리 도망쳤어요`;
    box.replaceChildren(
      head,
      el("div", { class: "led-row" }, el("span", { class: "led-inner" },
        el("span", { class: "led-name" }, top.name),
        part ? el("span", { class: "led-part" }, `[${part}]`) : null,
        el("span", { class: "led-score" }, fmt.format(top.score)))),
      el("div", { class: "led-ticker" }, el("span", {}, `${tick} ★ ${tick} ★ `))
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
    showLeader(rows[0]);
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
        el("td", { class: "name" }, r.name, r.message ? el("span", { class: "cheer" }, r.message) : null),
        el("td", { class: "char" }, MPLeaderboard.CHARACTERS[r.character] || "-"),
        el("td", { class: "num" }, fmt.format(r.score)),
        el("td", { class: "num dist" }, r.distance ? `${fmt.format(r.distance)}m` : "-"),
        el("td", { class: "when" }, r.created_at ? when.format(new Date(r.created_at)) : "")
      ));
    });
    board.replaceChildren(el("table", {},
      el("thead", {}, el("tr", {},
        el("th", {}, "#"), el("th", {}, "NAME"), el("th", { class: "char" }, "PART"), el("th", { class: "num" }, "SCORE"),
        el("th", { class: "num dist" }, "DIST"), el("th", { class: "when" }, "DATE"))),
      tbody));
  }
  $("#board-refresh").addEventListener("click", renderBoard);
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

  // ── 게임 임베드 ───────────────────────────────
  let frame = null;
  async function mountGame() {
    const src = C.game && C.game.src;
    if (!src) return;
    try {
      const res = await fetch(src, { method: "HEAD", cache: "no-store" });
      if (!res.ok) return;
    } catch { return; }
    frame = el("iframe", { src, title: "마감펑크 러너 게임", allow: "autoplay; fullscreen", loading: "eager" });
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
