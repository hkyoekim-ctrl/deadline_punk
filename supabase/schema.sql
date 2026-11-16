-- 마감펑크 리더보드 테이블 (Supabase SQL Editor 에 붙여 넣고 실행)
create table if not exists public.scores (
  id          bigint generated always as identity primary key,
  name        text    not null check (char_length(btrim(name)) between 1 and 12),
  score       integer not null check (score >= 0 and score <= 1000000),
  distance    integer not null default 0 check (distance >= 0),
  duration_ms integer not null check (duration_ms > 0 and duration_ms <= 3600000),
  character   text check (character in ('vocal', 'guitar', 'bass', 'keys', 'drums')),
  created_at  timestamptz not null default now(),
  -- 초당 최대 60점 + 여유 200점: 게임 규칙상 불가능한 점수는 거절
  constraint plausible_score check (score <= duration_ms / 1000.0 * 60 + 200)
);

create index if not exists scores_rank_idx on public.scores (score desc, created_at asc);

alter table public.scores enable row level security;

-- 누구나 순위를 읽을 수 있음
drop policy if exists "scores are public" on public.scores;
create policy "scores are public" on public.scores
  for select to anon, authenticated using (true);

-- 누구나 기록을 추가할 수 있지만 수정·삭제는 불가 (관리자는 대시보드에서 정리)
drop policy if exists "anyone can add a score" on public.scores;
create policy "anyone can add a score" on public.scores
  for insert to anon, authenticated with check (true);

-- 이미 테이블을 만든 뒤라면 아래 한 줄로 캐릭터 칸만 추가하세요.
-- alter table public.scores add column if not exists character text check (character in ('vocal', 'guitar', 'bass', 'keys', 'drums'));
