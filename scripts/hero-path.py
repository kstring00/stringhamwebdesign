# The home hero's line: a tangle that unravels into one straight line, as an
# SVG path for a 1200 x 140 box. Run once; the output is pasted into
# app/home/heroPath.ts as HERO_PATH. Kept here so the path can be traced
# back to what made it.
#   python3 scripts/hero-path.py
import math
def ss(a, b, t):
    u = max(0, min(1, (t - a) / (b - a))); return u * u * (3 - 2 * u)
pts = []; N = 1500; T = 0.6
for i in range(N + 1):
    t = T * i / N
    A = 50 * (1 - ss(0.14, T, t)) ** 1.3
    xb = 110 + 1050 * t ** 1.7
    p = 2 * math.pi * t / T
    dx = A * 1.25 * (math.cos(15 * p) + 0.45 * math.cos(22.3 * p + 1.1) + 0.25 * math.cos(23.7 * p + 2.3)) / 1.7
    dy = A * (math.sin(15 * p + 0.4) + 0.45 * math.sin(20.1 * p + 2.0) + 0.25 * math.sin(27.3 * p + 0.7)) / 1.7
    pts.append((xb + dx, 70 + dy))
pts.append((1160, 70))
print("M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts))
