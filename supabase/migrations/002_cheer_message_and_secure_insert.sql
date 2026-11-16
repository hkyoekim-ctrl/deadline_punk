-- 마감펑크 리더보드 v2: 한 줄 응원 메시지 + 서버 검증 강화
-- 순서: ① 이 SQL을 SQL Editor에서 실행 → ② Edge Function(submit-score) 배포 → ③ 사이트가 Edge Function으로 등록하도록 전환
-- ②까지 끝나기 전에 ①을 실행하면 브라우저에서 직접 넣는 기존 등록이 막히니, 순서를 지켜 주세요.

-- 1) 새 칸: 응원 메시지(선택, 40자), 도배 방지용 IP 해시(공개 안 함)
alter table public.scores add column if not exists message text not null default '';
alter table public.scores add column if not exists ip_hash text;

-- 2) 규칙 (DB 제약: Edge Function을 우회해도 마지막에 여기서 막힘)
alter table public.scores drop constraint if exists scores_name_check;
alter table public.scores drop constraint if exists name_rules;
alter table public.scores add constraint name_rules check (
  char_length(name) between 1 and 12          -- 닉네임 1~12자
  and name = btrim(name)                       -- 앞뒤 공백 없음
  and name !~ '[[:cntrl:]]'                    -- 줄바꿈·제어문자 없음
) not valid;  -- not valid: 이미 쌓인 기록은 그대로 두고 새 등록부터 검사

alter table public.scores drop constraint if exists message_rules;
alter table public.scores add constraint message_rules check (
  char_length(message) <= 40                   -- 응원 메시지 40자 이하
  and message = btrim(message)
  and message !~ '[[:cntrl:]]'
);

-- 점수 상한: 피버(거리 점수 2배)·악기 휘두르기(+50)를 넣어도 초당 100점 + 여유 500점을 넘을 수 없음
-- 거리 상한: 최고 속도 300px/s × 아아 부스트 1.4 ÷ 8px = 초당 52.5m → 초당 53m + 여유 20m
-- 점수 ≥ 거리: 점수 = 거리 + 보너스(0 이상)
alter table public.scores drop constraint if exists plausible_score;
alter table public.scores add constraint plausible_score check (
  score <= duration_ms / 1000.0 * 100 + 500
  and distance <= duration_ms / 1000.0 * 53 + 20
  and score >= distance
) not valid;

-- 3) RLS: 읽기는 누구나, 쓰기는 Edge Function(service_role)만
alter table public.scores enable row level security;

drop policy if exists "scores are public" on public.scores;
create policy "scores are public" on public.scores
  for select to anon, authenticated using (true);

-- 브라우저(anon 키)에서 직접 INSERT 하던 정책 제거 → 이제 등록은 Edge Function을 거쳐야만 가능
drop policy if exists "anyone can add a score" on public.scores;
-- 수정·삭제 정책은 만들지 않음 = anon/authenticated는 UPDATE/DELETE 불가
-- (service_role은 RLS를 우회하므로 Edge Function과 대시보드 관리자만 쓸 수 있음)

-- 4) 칼럼 권한: ip_hash는 공개 API로 읽을 수 없게
revoke all on public.scores from anon, authenticated;
grant select (id, name, message, score, distance, duration_ms, character, created_at)
  on public.scores to anon, authenticated;

-- 5) 도배 방지 조회용 인덱스
create index if not exists scores_ip_recent_idx on public.scores (ip_hash, created_at desc);

-- 확인용:
--   select policyname, cmd, roles from pg_policies where tablename = 'scores';
--   insert into public.scores (name, score, distance, duration_ms) values ('테스트', 999999, 0, 1000);  -- plausible_score 위반으로 실패해야 정상
