# 리더보드 v2: 응원 메시지 + 서버 검증

## 무엇이 바뀌나
- `scores` 테이블에 `message`(한 줄 응원, 40자 이하)와 `ip_hash`(도배 방지, 공개 안 함) 칸이 생깁니다.
- 브라우저가 anon 키로 테이블에 직접 INSERT 하던 길을 막고, 등록은 **Edge Function `submit-score`** 만 할 수 있습니다.
- 검증은 두 겹입니다. Edge Function이 먼저 보고, DB 제약(check)이 마지막으로 다시 봅니다.

| 규칙 | 값 |
|---|---|
| 닉네임 | 1–12자, 앞뒤 공백·줄바꿈·제어문자 없음 |
| 응원 메시지 | 0–40자, 같은 규칙 |
| 점수 상한 | `플레이 초 × 100 + 500` (피버 2배·악기 휘두르기 +50 포함) |
| 거리 상한 | `플레이 초 × 53 + 20` (최고 속도 × 아아 부스트 기준) |
| 점수 ≥ 거리 | 보너스는 음수가 될 수 없음 |
| 플레이 시간 | 1초 – 1시간 |
| 도배 방지 | 같은 IP 1분에 5회 |
| 금칙어 | `BANNED_WORDS` 비밀값에 쉼표로 (선택) |

## 적용 순서
1. **Edge Function 배포**
   ```bash
   supabase functions deploy submit-score
   supabase secrets set ALLOWED_ORIGINS="https://사이트주소" IP_SALT="길고-무작위인-문자열"
   # 선택: supabase secrets set BANNED_WORDS="욕1,욕2"
   ```
2. **사이트 코드 전환**: 아래 `submit()` 처럼 Edge Function을 부르게 바꿉니다.
3. **SQL 실행**: `migrations/002_cheer_message_and_secure_insert.sql` 을 SQL Editor에서 실행.
   1·2보다 먼저 실행하면 기존 사이트의 등록이 막힙니다.

## 사이트 쪽 submit (leaderboard.js 의 supabaseStore)
```js
async submit(row) { // row: { name, message, character, score, distance, duration_ms }
  const res = await fetch(url.replace(/\/$/, "") + "/functions/v1/submit-score", {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: row.name, message: row.message || "", character: row.character,
                           score: row.score, distance: row.distance, durationMs: row.duration_ms })
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok || !out.ok) throw Object.assign(new Error("save_failed"), { userMessage: out.error });
  return { rank: out.rank };
}
```
목록 조회 `select=` 에 `message` 를 추가하세요. `ip_hash` 는 anon에게 권한이 없어 `select=*` 는 실패하므로 칼럼을 꼭 나열합니다.

## 게임 → 사이트 메시지 (바뀐 점)
- `magam:submit` 에 `message` (빈 문자열 가능) 추가
- 새 `magam:share` `{ kind: "image" | "link", score, character }` — 통계용, 응답 불필요
- 사이트 → 게임 `magam:config` `{ shareUrl }` — 링크 공유·이미지 하단에 들어갈 주소. 안 보내면 상위 페이지 주소를 씁니다.

## 한계
게임이 브라우저에서 돌아가는 이상 점수를 100% 위조 불가능하게 만들 수는 없습니다. 이 규칙은 "말이 안 되는 점수"와 도배를 막는 수준이고, 이상한 기록은 대시보드에서 지우면 됩니다.
