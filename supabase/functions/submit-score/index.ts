// 마감펑크 리더보드 점수 등록 Edge Function
// 배포:  supabase functions deploy submit-score
// 비밀값: supabase secrets set ALLOWED_ORIGINS="https://내사이트주소" IP_SALT="아무-긴-무작위-문자열"
//        (선택) BANNED_WORDS="금칙어1,금칙어2"
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 는 Supabase가 자동으로 넣어 줍니다.
//
// 요청: POST /functions/v1/submit-score
//   headers: apikey, Authorization: Bearer <anon key>, Content-Type: application/json
//   body: { name, message?, character?, score, distance, durationMs }
// 응답: 200 { ok: true, rank, id }  |  4xx { ok: false, error: "사용자에게 보여줄 문구" }

import { createClient } from "jsr:@supabase/supabase-js@2";

const NAME_MAX = 12;
const MESSAGE_MAX = 40;
const POINTS_PER_SEC = 400;   // DB 제약과 같은 값 (콤보 ×3 · 피버 2배 · 아아 부스트 포함 이론 최대치 위)
const SCORE_SLACK = 1000;
const DIST_PER_SEC = 53;   // 최고 속도 300px/s × 부스트 1.4 ÷ 8
const DIST_SLACK = 20;
const MAX_DURATION_MS = 3_600_000;
const MIN_DURATION_MS = 1_000;
const RATE_WINDOW_SEC = 60;   // 같은 IP는 1분에 5번까지
const RATE_MAX = 5;
const CHARACTERS = new Set(["vocal", "guitar", "bass", "keys", "drums"]);

const allowed = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const banned = (Deno.env.get("BANNED_WORDS") ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
const salt = Deno.env.get("IP_SALT") ?? "";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

function cors(origin: string | null) {
  const ok = origin && (allowed.length === 0 || allowed.includes(origin));
  return {
    "Access-Control-Allow-Origin": ok ? origin! : allowed[0] ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

// 게임과 같은 정리: 제어문자·보이지 않는 문자 제거, 공백 하나로, 앞뒤 공백 제거
function clean(v: unknown): string {
  return String(v ?? "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028-\u202e\u2060-\u2064\ufeff]/g, "")
    .trim();
}
const len = (s: string) => [...s].length;
const hasBanned = (s: string) => {
  const t = s.toLowerCase().replace(/\s/g, "");
  return banned.some((w) => t.includes(w));
};

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

type Body = { name?: unknown; message?: unknown; character?: unknown; score?: unknown; distance?: unknown; durationMs?: unknown };

function validate(b: Body) {
  const name = clean(b.name);
  const message = clean(b.message);
  const score = Number(b.score);
  const distance = Number(b.distance ?? 0);
  const durationMs = Number(b.durationMs);
  const character = typeof b.character === "string" && CHARACTERS.has(b.character) ? b.character : null;

  if (!name) return { error: "닉네임을 입력해 주세요." };
  if (len(name) > NAME_MAX) return { error: `닉네임은 ${NAME_MAX}자까지 쓸 수 있어요.` };
  if (len(message) > MESSAGE_MAX) return { error: `응원 메시지는 ${MESSAGE_MAX}자까지 쓸 수 있어요.` };
  if (hasBanned(name) || hasBanned(message)) return { error: "사용할 수 없는 표현이 들어 있어요." };
  if (![score, distance, durationMs].every(Number.isInteger)) return { error: "기록을 읽지 못했어요. 다시 플레이해 주세요." };
  if (durationMs < MIN_DURATION_MS || durationMs > MAX_DURATION_MS) return { error: "기록을 확인하지 못해 저장하지 않았어요." };
  const sec = durationMs / 1000;
  if (score < 0 || distance < 0 || score < distance ||
      score > sec * POINTS_PER_SEC + SCORE_SLACK ||
      distance > sec * DIST_PER_SEC + DIST_SLACK) {
    return { error: "기록을 확인하지 못해 저장하지 않았어요." };
  }
  return { row: { name, message, character, score, distance, duration_ms: durationMs } };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = { ...cors(origin), "Content-Type": "application/json; charset=utf-8" };
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });

  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return reply(405, { ok: false, error: "POST만 받아요." });
  if (allowed.length && (!origin || !allowed.includes(origin))) return reply(403, { ok: false, error: "허용되지 않은 곳에서 온 요청이에요." });

  let body: Body;
  try { body = await req.json(); } catch { return reply(400, { ok: false, error: "요청 형식이 잘못됐어요." }); }

  const v = validate(body);
  if ("error" in v) return reply(422, { ok: false, error: v.error });

  // 도배 방지: IP 원본은 저장하지 않고 소금 친 해시만 저장
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const ipHash = await sha256(salt + ip);
  const since = new Date(Date.now() - RATE_WINDOW_SEC * 1000).toISOString();
  const { count: recent, error: rateErr } = await db.from("scores")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash).gte("created_at", since);
  if (rateErr) return reply(500, { ok: false, error: "잠시 후 다시 시도해 주세요." });
  if ((recent ?? 0) >= RATE_MAX) return reply(429, { ok: false, error: "너무 자주 등록하고 있어요. 1분 뒤에 다시 시도해 주세요." });

  const { data, error } = await db.from("scores").insert({ ...v.row, ip_hash: ipHash }).select("id").single();
  if (error) {
    // 23514 = DB check 제약 위반 (닉네임·메시지·점수 상한)
    const msg = error.code === "23514" ? "기록을 확인하지 못해 저장하지 않았어요." : "저장하지 못했어요. 잠시 후 다시 시도해 주세요.";
    return reply(error.code === "23514" ? 422 : 500, { ok: false, error: msg });
  }

  const { count: higher } = await db.from("scores")
    .select("id", { count: "exact", head: true })
    .gt("score", v.row.score);
  return reply(200, { ok: true, id: data.id, rank: (higher ?? 0) + 1 });
});
