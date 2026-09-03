"""重新生成 public/paper-noise.png（仓库为保持文本化未纳入该二进制，clone 后运行一次即可）。"""
from PIL import Image
import random
random.seed(42)
img = Image.new("L", (256, 256))
px = img.load()
for y in range(256):
    for x in range(256):
        px[x, y] = 245 + random.randint(0, 10)
img.save("public/paper-noise.png")
print("public/paper-noise.png 已生成")
