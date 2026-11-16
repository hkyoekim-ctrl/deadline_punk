"""사이트를 claude.ai Artifact 미리보기용 단일 HTML 로 묶습니다.
사용: python3 build_preview.py <site 폴더> <출력 파일>"""
import re, sys, pathlib
site, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
html = (site / "index.html").read_text()
body = html.split("<!--BODY-START-->")[1].split("<!--BODY-END-->")[0]
css = (site / "styles.css").read_text()
js = "\n".join((site / f).read_text() for f in ["config.js", "leaderboard.js", "app.js"])
page = f"""<title>마감펑크</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;600&display=swap">
<style>
{css}
</style>
{body}
<script>window.MP_PREVIEW = true;</script>
<script>
{js}
</script>
"""
out.write_text(page)
print("wrote", out, len(page))
