import os
import sys

bdf_path, out_dir = sys.argv[1], sys.argv[2]
bg, fg = "#111", "#0f0"

glyphs, rows = {}, None
for line in open(bdf_path):
    key, *args = line.split() or [""]
    if key == "ENCODING":
        code = int(args[0])
    elif key == "BBX":
        width = int(args[0])
    elif key == "BITMAP":
        rows = []
    elif key == "ENDCHAR":
        if code >= 0:
            glyphs[chr(code)] = (width, rows)
        rows = None
    elif rows is not None:
        bits, n = int(key, 16), len(key) * 4
        rows.append([x for x in range(width) if bits >> (n - 1 - x) & 1])


def fmt(v):
    return ("%.4f" % v).rstrip("0").rstrip(".")


def rects(text):
    lit = {}
    left = 0
    for ch in text:
        width, glyph = glyphs[ch]
        for y, xs in enumerate(glyph):
            lit.setdefault(y, []).extend(left + x for x in xs)
        left += width
    spans = []
    for y, xs in sorted(lit.items()):
        for x in sorted(xs):
            if spans and spans[-1][0] == y and spans[-1][2] == x:
                spans[-1][2] = x + 1
            else:
                spans.append([y, x, x + 1])
    out, last = [], {}
    for y, a, b in spans:
        r = last.get((a, b))
        if r and r[1] + r[3] == y:
            r[3] += 1
        else:
            r = last[a, b] = [a, y, b - a, 1]
            out.append(r)
    return out


def svg(lines, w=96, h=96, gap=8, px=None):
    placed = []
    for text, width in lines:
        r = rects(text)
        x0, x1 = min(rx for rx, *_ in r), max(rx + rw for rx, _, rw, _ in r)
        y0, y1 = r[0][1], max(ry + rh for _, ry, _, rh in r)
        s = width / (x1 - x0)
        if px:
            s = max(1, round(s / px)) * px
        placed.append((r, s, x0, y0, (x1 - x0) * s, (y1 - y0) * s))

    top = (h - sum(p[-1] for p in placed) - gap * (len(placed) - 1)) / 2
    paths = []
    for r, s, x0, y0, lw, lh in placed:
        ox, oy = (w - lw) / 2 - x0 * s, top - y0 * s
        if px:
            ox, oy = round(ox / px) * px, round(oy / px) * px
        d, cx, cy = "", 0, 0
        for rx, ry, rw, rh in r:
            d += f"m{rx - cx} {ry - cy}h{rw}v{rh}h{-rw}z"
            cx, cy = rx, ry
        paths.append(f'transform="matrix({fmt(s)} 0 0 {fmt(s)} {fmt(ox)} {fmt(oy)})" d="{d}"')
        top += lh + gap

    body = "".join(f"\n    <path {p} />" for p in paths)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">\n'
        f'  <rect width="{w}" height="{h}" fill="{bg}" />\n'
        f'  <g fill="{fg}">{body}\n  </g>\n</svg>\n'
    )


open(os.path.join(out_dir, "logo.svg"), "w").write(svg([("\\033[32m", 72), ("ANSI", 76)], px=0.75))
open(os.path.join(out_dir, "favicon.svg"), "w").write(svg([("ANSI", 80)]))
open(os.path.join(out_dir, "ansi.tools.svg"), "w").write(svg([("\\033[32m", 240), ("ANSI.tools", 960)], 1200, 630, 48, px=1))
