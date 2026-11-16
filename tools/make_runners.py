"""게임 스프라이트(game/assets)에서 멤버별 달리기 8프레임을 가로 띠 PNG 로 뽑습니다.
게임 그림이 바뀌면 다시 실행:  python3 tools/make_runners.py
결과: img/runners/{vocal,guitar,bass,drums,keys}.png (프레임 8장을 가로로. 게임이 @2x 면 32x48 x 8)"""
import json, os
from PIL import Image
here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = os.path.join(here, "game", "assets")
atlas = json.load(open(os.path.join(src, "atlas.json")))["frames"]
sheet = Image.open(os.path.join(src, "spritesheet.png")).convert("RGBA")
os.makedirs(os.path.join(here, "img", "runners"), exist_ok=True)
for cid in ["vocal", "guitar", "bass", "drums", "keys"]:
    frames = [atlas[f"{cid}_run{i}"] for i in range(1, 9)]
    w, h = frames[0]["w"], frames[0]["h"]
    strip = Image.new("RGBA", (w * 8, h))
    for i, f in enumerate(frames):
        strip.paste(sheet.crop((f["x"], f["y"], f["x"] + f["w"], f["y"] + f["h"])), (i * w, 0))
    strip.save(os.path.join(here, "img", "runners", f"{cid}.png"), optimize=True)
    print(cid, strip.size)
