// 마감펑크 홍보 사이트 설정 파일
// 대괄호 [ ] 로 표시된 값과 빈 링크("")는 아직 받지 못한 정보입니다. 채우면 페이지에 바로 반영됩니다.
// 링크가 빈 문자열이면 "준비 중"으로 표시되고 클릭할 수 없습니다.

window.MP_CONFIG = {
  band: {
    name: "불과사이",
    nameEn: "[BAND NAME]",
    headline: "책을 찢고 춤을 추자!",
    subhead: "밴드 불과사이의 첫 싱글 [마감펑크]",
    // 소개 기사. type: p(문단) / quotes(추천사) / ps(추신). 줄바꿈은 \n
    article: [
      {
        "type": "p",
        "text": "불과사이는 다섯 명의 작가들로 구성된 록밴드다. 2026년 1월부터 인디씬에서 활동을 시작했으며, 현재까지도 원고 마감의 고통에 시달리는 중이다. [마감펑크]는 펑크 난 마감의 애환을 신나는 펑크록 사운드로 재해석한 곡이다. 다음은 이 노래에 대한 작가들의 추천사다."
      },
      {
        "type": "quotes",
        "items": [
          {
            "q": "이 시대의 펑크, 그리고 몰락의 마감.",
            "by": "송지현(소설가, 2026 김승옥문학상 대상 수상)"
          },
          {
            "q": "펑크는 달린다. 마감도 달린다. 그래서 마감펑크다.",
            "by": "이승용(카피라이터, 『헛소리의 품격』 저자)"
          },
          {
            "q": "3분간 내달리는 작가들의 단말마(馬).",
            "by": "김혜경(에세이스트, 『아무튼 술집』 저자)"
          },
          {
            "q": "닫힌 문을 기어코 열어버린 금기(禁忌)에 대한 기록.",
            "by": "구현우(시인, 『나의 9월은 너의 3월』 저자)"
          },
          {
            "q": "맡은 일을 완수할 수 없었던 이들에게 바치는 자유의 송가.",
            "by": "임국영(소설가, 『헤드라이너』 저자)"
          }
        ]
      },
      {
        "type": "p",
        "text": "글 쓰는 작가들이 어쩌다 펑크록 밴드를 하냐고 묻는다면, 재즈 피아노를 몇 개월 배웠다는 이유로 합주실에 불려온 송지현(건반/소설가)의 등단작이 <펑크록스타일 빨대 디자인에 관한 연구>이기 때문이다. 밴드 이름이 왜 불과사이냐고 묻는다면, ‘불과 잠깐 사이’라는 의미를 언어유희적으로 축약했다고 변명할 이승용(기타/카피라이터)이 『헛소리의 품격』을 썼기 때문이다. 곡 제목은 어떻게 지었냐고 묻는다면, “마감 펑크도 펑크다!”를 외치며 맥주를 들이붓던 김혜경(드럼/에세이스트)이 『아무튼 술집』을 썼기 때문이다. 사죄 메일의 형식을 가사에 차용한 이유를 묻는다면, 작사를 도맡은 구현우(베이스/시인)가 <이토록 유약하고 아름다운 거짓>이란 시를 썼기 때문이다. 데뷔 싱글을 왜 이렇게 열심히 만들었냐고 묻는다면, 연주할 수 있는 악기가 하나도 없는 임국영(노래/소설가)이 『헤드라이너』라는 소설집을 썼기 때문이다."
      },
      {
        "type": "p",
        "text": "그리고 위 대답들이 다소 이상하다고 되묻는다면, 그 생각이 맞다.\n왜냐하면 [마감펑크]는 어딘가 이상한, 조금은 어이없는, 그래서 더 짜릿한 곡이기 때문이다."
      },
      {
        "type": "ps",
        "text": "P.S.\n밴드 슬로건 ‘책을 찢고 춤을 추자!’는 서대문구의 한 카페에서 뮤지션 단편선이 제안했기 때문이다.\n그리고 [마감펑크]의 마감을 펑크내지 않은 건 프로듀서 박장미를 만났기 때문이다."
      }
    ],
    members: [
      {
        "name": "임국영",
        "part": "보컬",
        "job": "소설가"
      },
      {
        "name": "이승용",
        "part": "기타",
        "job": "카피라이터"
      },
      {
        "name": "구현우",
        "part": "베이스",
        "job": "시인"
      },
      {
        "name": "김혜경",
        "part": "드럼",
        "job": "에세이스트"
      },
      {
        "name": "송지현",
        "part": "키보드",
        "job": "소설가"
      }
    ],
    socials: [
      { label: "Instagram", url: "https://www.instagram.com/bulgwasai/" },
      { label: "YouTube", url: "https://www.youtube.com/@Bulgwasai" }
    ],
    contact: "betweenfire.band@gmail.com",
    copyright: "© 2026 불과사이·김혜경",
    // 밴드 사진 갤러리: img/band/ 에 사진을 넣고 아래에 추가하세요. 비어 있으면 사진 자리만 보입니다.
    // 예) { src: "img/band/01.jpg", thumb: "img/band/01_s.jpg"(작은 미리보기, 없으면 src), alt: "사진 설명", caption: "아래 문구" }
    photos: [
      { src: "img/band/01.jpg", thumb: "img/band/01_s.jpg", alt: "마감펑크 포스터, 벽 뒤에서 고개를 내민 다섯 멤버", caption: "마감펑크 포스터 1" },
      { src: "img/band/02.jpg", thumb: "img/band/02_s.jpg", alt: "마감펑크 포스터, 타일 벽 앞의 다섯 멤버", caption: "마감펑크 포스터 2" },
      { src: "img/band/03.jpg", thumb: "img/band/03_s.jpg", alt: "콘크리트 벽에 기댄 다섯 멤버", caption: "" },
      { src: "img/band/04.jpg", thumb: "img/band/04_s.jpg", alt: "허리에 손을 얹고 선 다섯 멤버", caption: "" },
      { src: "img/band/05.jpg", thumb: "img/band/05_s.jpg", alt: "맥주잔을 든 다섯 멤버", caption: "" },
      { src: "img/band/06.jpg", thumb: "img/band/06_s.jpg", alt: "악기를 든 다섯 멤버, 흑백 어안 사진", caption: "" },
      { src: "img/band/07.jpg", thumb: "img/band/07_s.jpg", alt: "잔디 위에 모인 양말 신은 발들", caption: "" },
      { src: "img/band/08.jpg", thumb: "img/band/08_s.jpg", alt: "선글라스를 끼고 잔디에 앉은 다섯 멤버", caption: "" },
      { src: "img/band/09.jpg", thumb: "img/band/09_s.jpg", alt: "콘크리트 블록 위에서 악기를 든 다섯 멤버", caption: "" }
    ]
  },

  single: {
    title: "마감펑크",
    titleEn: "DEADLINE PUNK",
    // 발매 시각 (한국 시간): 2026-11-20 정오(12:00). 카운트다운과 공연 일정의 발매일 표시에 쓰입니다.
    releaseAt: "2026-11-20T12:00:00+09:00",
    // 뮤직비디오 아래 크레딧
    mvCredits: [
      { role: "감독", names: "이승용, 김혜경" },
      { role: "촬영", names: "엄성탁, 황영식, 문지호, 홍민호" },
      { role: "제작 진행", names: "안준원, 최봉기" },
      { role: "컬러 보정", names: "최봉기" },
      { role: "Special Thanks", names: "김재현" }
    ],
    // 앨범 커버 옆 크레딧 (title 이 있으면 소제목)
    credits: [
      { rows: [
        ["프로듀싱", "박장미"], ["작곡", "이승용"], ["작사", "이승용 구현우"],
        ["편곡", "이승용 김혜경 구현우 송지현 임국영 박장미"]
      ] },
      { title: "연주", rows: [
        ["드럼", "김혜경"], ["베이스", "구현우"], ["키보드", "송지현"], ["기타", "이승용"],
        ["보컬", "임국영"], ["코러스", "임국영 김혜경 이승용"], ["전화 음성", "김혜경"]
      ] },
      { title: "레코딩", rows: [
        ["기타·베이스·보컬", "박장미"], ["드럼", "박재준"], ["키보드", "이승용"], ["전화 음성", "이승용"]
      ] },
      { rows: [
        ["믹싱", "천학주 @머쉬룸레코딩스튜디오"], ["마스터링", "강승희 @소닉코리아 마스터링 스튜디오"]
      ] },
      { rows: [["커버·로고 디자인", "조석현"], ["사진", "송재랑"]] },
      { rows: [["서포트", "단편선"]] },
      { rows: [["음원 배급", "미러볼뮤직"]] }
    ],
    // 스트리밍 링크. 비어 있으면 "준비 중"으로 표시됩니다.
    // icon: img/stream/ 의 로고 파일, color: 아이콘 배경색
    streaming: [
      { label: "YouTube Music", icon: "img/stream/youtubemusic.svg", color: "#FF0000", url: "https://www.youtube.com/watch?v=txKm5XUh9Og&list=RDtxKm5XUh9Og&start_radio=1" },
      { label: "Spotify", icon: "img/stream/spotify.svg", color: "#1DB954", url: "https://open.spotify.com/intl-ko/album/2MbruDnyc7wT4wX56uND58" },
      { label: "Apple Music", icon: "img/stream/applemusic.png", full: true, color: "#FA243C", url: "https://music.apple.com/kr/album/deadline-punk-single/6835796042" },
      { label: "멜론", icon: "img/stream/melon.svg", color: "#00CD3C", url: "https://www.melon.com/song/detail.htm?songId=603995741" },
      { label: "지니", icon: "img/stream/genie.png", color: "#FFFFFF", url: "https://www.genie.co.kr/detail/albumInfo?axnm=88471559" },
      { label: "벅스", icon: "img/stream/bugs.png", full: true, color: "#F5400C", url: "https://music.bugs.co.kr/album/20856330" },
      { label: "FLO", icon: "img/stream/flo.png", full: true, color: "#3D3DF5", url: "https://www.music-flo.com/detail/album/467452406/albumtrack" },
      { label: "VIBE", icon: "img/stream/vibe.png", full: true, color: "#E8265E", url: "https://vibe.naver.com/album/39256096" }
    ],
    // 뮤직비디오 유튜브 영상 ID (https://youtu.be/XXXX 의 XXXX 부분)
    youtubeId: "kjsGwgCUU-U"
  },

  support: {
    intro: "여러분의 응원이 모여 저희의 다음 이야기가 됩니다.\n후원해 주신 금액은 다가올 새 앨범 작업과 여러분을 더 가까이에서 만나기 위한 공연 활동의 밑거름으로 소중히 쓰겠습니다. 지속 가능한 창작 활동을 할 수 있도록 응원해 주세요!",
    // 링크형 후원 수단 (토스 송금 링크, 투네이션, Buy Me a Coffee, 텀블벅 등)
    links: [],
    // 계좌 후원. 비워 두면 섹션에서 숨겨집니다.
    account: { bank: "카카오뱅크", number: "7979-12-81725", holder: "이승용" }
  },

  site: {
    // 배포한 사이트 주소. 게임의 '링크 공유'와 점수 이미지 하단에 들어갑니다. 비우면 지금 페이지 주소를 씁니다.
    url: "https://bulgwasai.com"
  },

  schedule: {
    // 공연이 정해지면 아래 형식으로 한 줄씩 추가하세요. 비어 있으면 "일정 준비 중" 안내가 보입니다.
    // 지난 공연은 자동으로 아래로 내려가 흐리게 표시됩니다.
    // 예) { date: "2026-12-05", time: "19:00", title: "공연 이름", venue: "공연장 이름", place: "서울 마포구", note: "한 줄 메모(선택)", url: "예매·안내 링크(선택)", linkLabel: "예매하기" }
    items: [
      { date: "2026-11-20", time: "19:00", title: "ROCKERS ON FRIDAY", venue: "클럽 빅팀" },
      { date: "2026-12-28", time: "19:30", title: "불과(1년)사이 연말파티", venue: "허밋", place: "합정" }
    ]
  },

  // 기사·매거진 소식: 올라오면 아래 형식으로 한 줄씩 추가하세요(여기 적은 순서대로 보입니다). 비어 있으면 안내 문구가 보여요.
  // 예) { kind: "기사"(또는 "from. 불과사이"), date: "2026-11-25", source: "매체 이름", title: "기사 제목", url: "https://..." }
  news: {
    items: [
      { kind: "기사", date: "2026-11-18", source: "매일신문", title: "마감에 쫓기는 작가들, 이번엔 펑크록으로 달린다…밴드 '불과사이' 첫 싱글", url: "https://www.imaeil.com/page/view/2026111815045651233" },
      { kind: "기사", date: "2026-11-18", source: "스포츠한국", title: "작가들이 만든 펑크록 밴드가 왔다 ‘불과사이’", url: "https://sports.hankooki.com/news/articleView.html?idxno=6943804" },
      { kind: "from. 불과사이", character: "drums", date: "2026-11-11", source: "조선일보", title: "[일사일언] 취미는 무능할 수 있는 권리", url: "https://n.news.naver.com/mnews/article/023/0004008887?sid=103" },
      { kind: "from. 불과사이", character: "vocal", source: "당신의책", title: "숟가락도 ‘락’이다", url: "https://yourbook.co.kr/social/details/j6IRgCJMe63cWSehQFzSXA==" },
      { kind: "from. 불과사이", character: "bass", date: "2026-06-25", source: "경북매일", title: "우리가 같은 취향을 공유할 때", url: "https://www.kbmaeil.com/article/20260622500395" }
    ]
  },

  game: {
    // 게임 스레드가 만든 파일을 site/game/ 에 두면 됩니다.
    src: "game/index.html"
  },

  leaderboard: {
    // "supabase": 실제 공개 순위표 (supabase/README 참고)
    // "local": 이 브라우저에만 저장되는 데모 모드
    provider: "supabase",
    supabaseUrl: "https://tbzfwbrskxbqwhsrznmg.supabase.co",
    supabaseAnonKey: "sb_publishable_FPYdRow5uh3v_7bhYp9rJQ_LP1jNf3v",
    size: 20
  }
};
