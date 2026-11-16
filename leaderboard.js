// 리더보드 저장소. provider 에 따라 Supabase(공개) 또는 localStorage(데모)를 씁니다.
// 두 저장소 모두 같은 모양을 돌려줍니다: { name, message, character, score, distance, created_at }
(function () {
  const NAME_MAX = 12;
  const MESSAGE_MAX = 40;
  // 피버(2배)·악기 휘두르기(+50) 보너스를 포함한 상한. supabase/functions/submit-score 와 같은 값
  const MAX_POINTS_PER_SEC = 100;
  const SLACK = 500;
  // Edge Function 과 같은 정리: 제어문자·보이지 않는 문자 제거, 공백 하나로
  const clean = (v) => String(v ?? "").normalize("NFC").replace(/\s+/g, " ")
    .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028-\u202e\u2060-\u2064\ufeff]/g, "").trim();
  const CHARACTERS = { vocal: "보컬", guitar: "기타", bass: "베이스", keys: "건반", drums: "드럼" };

  // 게임이 보낸 점수를 대략 검증합니다. 통과하면 정리된 값을, 아니면 { error } 를 돌려줍니다.
  function validate(entry) {
    const name = clean(entry.name);
    const message = clean(entry.message);
    const score = Number(entry.score);
    const distance = Number(entry.distance ?? 0);
    const durationMs = Number(entry.durationMs ?? 0);
    if (!name) return { error: "닉네임을 입력해 주세요." };
    if ([...name].length > NAME_MAX) return { error: `닉네임은 ${NAME_MAX}자까지 쓸 수 있어요.` };
    if ([...message].length > MESSAGE_MAX) return { error: `응원 메시지는 ${MESSAGE_MAX}자까지 쓸 수 있어요.` };
    if (!Number.isInteger(score) || score < 0) return { error: "점수를 읽지 못했어요. 다시 플레이해 주세요." };
    if (!(durationMs > 0) || score > (durationMs / 1000) * MAX_POINTS_PER_SEC + SLACK) {
      return { error: "기록을 확인하지 못해 저장하지 않았어요." };
    }
    const character = Object.hasOwn(CHARACTERS, entry.character) ? entry.character : null;
    return { name, message, score, distance: Math.max(0, Math.round(distance)), duration_ms: Math.round(durationMs), character };
  }

  function localStore(size) {
    const KEY = "magampunk.leaderboard.v1";
    const read = () => {
      try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
    };
    const write = (rows) => {
      try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch { /* 저장 불가 환경 */ }
    };
    return {
      kind: "local",
      async top() {
        return read().sort((a, b) => b.score - a.score).slice(0, size);
      },
      async submit(row) {
        const rows = read();
        const saved = { ...row, created_at: new Date().toISOString() };
        rows.push(saved);
        rows.sort((a, b) => b.score - a.score);
        write(rows.slice(0, 200));
        return { rank: rows.indexOf(saved) + 1 };
      }
    };
  }

  function supabaseStore(url, key, size) {
    const base = url.replace(/\/$/, "") + "/rest/v1";
    const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
    return {
      kind: "supabase",
      async top() {
        const res = await fetch(`${base}/scores?select=name,message,score,distance,character,created_at&order=score.desc,created_at.asc&limit=${size}`, { headers });
        if (!res.ok) throw new Error("load_failed");
        return res.json();
      },
      // 등록은 Edge Function 만 받습니다 (supabase/README-v2.md). 테이블 직접 INSERT 는 막혀 있어요.
      async submit(row) {
        const res = await fetch(url.replace(/\/$/, "") + "/functions/v1/submit-score", {
          method: "POST",
          headers,
          body: JSON.stringify({ name: row.name, message: row.message || "", character: row.character,
                                 score: row.score, distance: row.distance, durationMs: row.duration_ms })
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || !out.ok) throw Object.assign(new Error("save_failed"), { userMessage: out.error });
        return { rank: out.rank ?? null };
      }
    };
  }

  function create(cfg) {
    const size = cfg.size || 20;
    if (cfg.provider === "supabase" && cfg.supabaseUrl && cfg.supabaseAnonKey) {
      return supabaseStore(cfg.supabaseUrl, cfg.supabaseAnonKey, size);
    }
    return localStore(size);
  }

  window.MPLeaderboard = { create, validate, NAME_MAX, MESSAGE_MAX, CHARACTERS };
})();
