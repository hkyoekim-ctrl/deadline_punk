# 마감펑크 홍보 사이트

정적 사이트입니다. 빌드 없이 이 폴더를 그대로 올리면 됩니다 (GitHub Pages, Netlify, Vercel, Cloudflare Pages 등).

## 파일
- `index.html` · `styles.css` · `app.js`: 페이지
- `config.js`: **밴드 정보, 스트리밍 링크, 유튜브 ID, 후원 수단, 리더보드 설정** — 내용 수정은 이 파일만 하면 됩니다
- `leaderboard.js`: 순위표 저장소 (Supabase 또는 브라우저 데모 모드)
- `game/index.html`: 게임 파일 자리 (게임 개발 스레드 결과물을 여기에 복사). 없으면 "게임 준비 중" 화면이 나옵니다
- `supabase/schema.sql`: 공개 순위표 테이블
- `tools/build_preview.py`: claude.ai 미리보기용 단일 파일 생성

## 게임 연동 규약 (postMessage)
- 게임 → 페이지: `{type:"magam:submit", name, score, distance, durationMs}`
- 페이지 → 게임: `{type:"magam:submit-result", ok:true, rank}` 또는 `{ok:false, error:"사용자에게 보여줄 문구"}`
- 페이지는 이름 1~12자, 점수 0 이상 정수, `score <= durationMs/1000*60 + 200` 을 확인한 뒤 저장합니다.

## 공개 순위표 켜기 (Supabase, 무료 플랜으로 충분)
1. supabase.com 에서 프로젝트 생성
2. SQL Editor 에 `supabase/schema.sql` 붙여 넣고 실행
3. Project Settings → API 에서 Project URL 과 `anon` public key 복사
4. `config.js` 의 `leaderboard` 를 `provider: "supabase"`, `supabaseUrl`, `supabaseAnonKey` 로 채우기
5. 이어서 `supabase/README-v2.md` 순서대로 Edge Function `submit-score` 배포 → `migrations/002_cheer_message_and_secure_insert.sql` 실행 (응원 메시지 칸 추가, 등록은 Edge Function 으로만). 사이트 코드(`leaderboard.js`)는 이미 Edge Function 으로 등록하도록 바뀌어 있어서, **Edge Function 배포 전에는 Supabase 모드의 기록 저장이 실패합니다.**
6. 사이트 주소가 정해지면 `config.js` 의 `site.url` 에 넣기 (게임의 링크 공유·점수 이미지에 쓰임)

anon key 는 공개되어도 되는 키입니다. 테이블은 읽기·추가만 허용되고 수정·삭제는 막혀 있습니다.
점수는 브라우저에서 보내므로 마음먹고 조작하는 사람을 완전히 막을 수는 없습니다. 이상한 기록은 Supabase 대시보드 Table Editor 에서 지우면 됩니다.

## 게임 파일 갱신
게임 원본은 `/mnt/project-files/game/` 에 있고, `site/game/index.html` 은 배포용 복사본입니다. 게임이 바뀌면 다시 복사하세요. 게임 BGM은 `site/game/assets/bgm.mp3` (신곡 음원)입니다. 오프닝 건너뛰기가 음원 위치를 옮기므로, 배포 서버가 HTTP Range 요청을 지원해야 합니다 (GitHub Pages, Netlify, Vercel, Cloudflare Pages 등 일반 정적 호스팅은 지원).

## 폰트
- 제목·라벨·버튼·순위표: 물마루 (Mushsooni, SIL OFL 1.1, `fonts/Mulmaru.woff2`, 약 100KB). 웹 사용·배포 모두 허용되는 라이선스이며 `fonts/OFL.txt` 를 함께 두세요.
- 긴 본문: IBM Plex Sans KR (Google Fonts)

## 밴드 사진 갤러리
사진을 `img/band/` 에 넣고 `config.js` 의 `band.photos` 에 `{ src, alt, caption }` 으로 추가하면 밴드 소개 아래 갤러리에 나옵니다. 첫 사진이 크게 보이고, 누르면 크게 보기(좌우 넘기기, ESC로 닫기)가 열립니다. 사진은 긴 변 1600px 이하 JPG를 권장합니다.

## 공연 일정 · 크레딧 · 전광판
- 공연 일정: `config.js` 의 `schedule.items` 에 한 줄씩 추가 (예시는 파일 안 주석). 지난 공연은 자동으로 아래로 내려가 흐리게 표시됩니다.
- 뮤직비디오 크레딧은 `single.mvCredits`, 앨범 커버 옆 크레딧은 `single.credits`, 커버 이미지는 `img/cover.jpg`.
- 로고 아래 전광판은 1위와 최근 기록의 응원 메시지를 돌려가며 보여 줍니다 (Supabase 모드에서는 최근 30건 조회).
- 로고 아래 달리는 캐릭터 그림은 게임 그림이 바뀌면 `python3 tools/make_runners.py` 로 다시 뽑습니다.
