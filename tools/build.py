#!/usr/bin/env python3
"""KoviFly — gradnja statičnih strani iz dvojezičnih predlog.

Uporaba:  python3 tools/build.py

Predloge so v src/*.src.html. Oba jezika sta zapisana drug ob drugem:
    [[slovensko besedilo||English text]]
Skript iz vsake predloge naredi slovensko in angleško stran.
Ostale oznake:
    {{LANG}}            sl | en
    {{URL}}             kanonični URL te strani
    {{URL_SL}} {{URL_EN}}  URL-ja obeh jezikovnih različic (hreflang, preklopnik)
    {{>ime}}            vključi src/_ime.html
    {{pic ime ;; sizes ;; alt ;; dodatni atributi}}   <picture> z AVIF + WebP
NE urejaj index.html / en/*.html ročno — spremembe se ob gradnji prepišejo.
"""
import re
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
SITE = "https://kovifly.si"

# predloga -> (pot SL, pot EN)
PAGES = {
    "index": ("/", "/en/"),
    "zasebnost": ("/zasebnost.html", "/en/privacy.html"),
    "pravno": ("/pravno-obvestilo.html", "/en/legal.html"),
}

TR = re.compile(r"\[\[(.*?)\|\|(.*?)\]\]", re.S)
INC = re.compile(r"\{\{>\s*([\w-]+)\s*\}\}")
PIC = re.compile(r"\{\{pic (.*?)\}\}", re.S)


def webp_size(path):
    """Širina in višina WebP datoteke (VP8 / VP8L / VP8X) brez zunanjih knjižnic."""
    b = path.read_bytes()[:40]
    kind = b[12:16]
    if kind == b"VP8 ":
        w, h = struct.unpack("<HH", b[26:30])
        return w & 0x3FFF, h & 0x3FFF
    if kind == b"VP8L":
        n = struct.unpack("<I", b[21:25])[0]
        return (n & 0x3FFF) + 1, ((n >> 14) & 0x3FFF) + 1
    if kind == b"VP8X":
        w = int.from_bytes(b[24:27], "little") + 1
        h = int.from_bytes(b[27:30], "little") + 1
        return w, h
    raise ValueError(f"neznan WebP: {path}")


def picture(m):
    parts = [p.strip() for p in m.group(1).split(";;")]
    name, sizes, alt = parts[0], parts[1], parts[2]
    extra = parts[3] if len(parts) > 3 else 'loading="lazy"'
    variants = []
    for tag in ("800", "1600"):
        f = ROOT / "img" / f"{name}-{tag}.webp"
        if f.exists():
            variants.append((tag, *webp_size(f)))
    if not variants:
        raise SystemExit(f"manjka slika: img/{name}-800.webp")

    def srcset(ext):
        return ", ".join(f"/img/{name}-{t}.{ext} {w}w" for t, w, _ in variants)

    t, w, h = variants[0]
    return (
        f'<picture><source type="image/avif" srcset="{srcset("avif")}" sizes="{sizes}">'
        f'<source type="image/webp" srcset="{srcset("webp")}" sizes="{sizes}">'
        f'<img src="/img/{name}-{t}.webp" alt="{alt}" width="{w}" height="{h}" decoding="async" {extra}></picture>'
    )


def render(text, lang, sl_path, en_path):
    while INC.search(text):
        text = INC.sub(lambda m: (SRC / f"_{m.group(1)}.html").read_text(encoding="utf-8"), text)
    text = TR.sub(lambda m: m.group(1 if lang == "sl" else 2), text)
    text = PIC.sub(picture, text)
    here = sl_path if lang == "sl" else en_path
    return (
        text.replace("{{LANG}}", lang)
        .replace("{{URL_SL}}", SITE + sl_path)
        .replace("{{URL_EN}}", SITE + en_path)
        .replace("{{URL}}", SITE + here)
        .replace("{{PATH_SL}}", sl_path)
        .replace("{{PATH_EN}}", en_path)
    )


def out_file(path):
    return ROOT / (path.lstrip("/") + "index.html" if path.endswith("/") else path.lstrip("/"))


def main():
    for name, (sl_path, en_path) in PAGES.items():
        tpl = (SRC / f"{name}.src.html").read_text(encoding="utf-8")
        for lang, path in (("sl", sl_path), ("en", en_path)):
            html = render(tpl, lang, sl_path, en_path)
            left = re.findall(r"\[\[|\]\]|\{\{[^}]*\}\}", html)
            if left:
                raise SystemExit(f"{name} ({lang}): nerazrešene oznake {left[:5]}")
            f = out_file(path)
            f.parent.mkdir(parents=True, exist_ok=True)
            f.write_text(html, encoding="utf-8")
            print(f"✓ {f.relative_to(ROOT)}  ({len(html) // 1024} KB)")


if __name__ == "__main__":
    main()
