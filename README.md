# KoviFly — kovifly.si

Enostranska predstavitvena stran za snemanje z dronom (SL + EN). Gostovanje: GitHub Pages.

## Kako urejati

| Kaj | Kje |
|---|---|
| Cene paketov, UAS registracija, zavarovanje, podatki o podjetju | `js/config.js` |
| Besedila in struktura strani (oba jezika) | `src/*.src.html` |
| Videz | `css/main.css` |
| Obnašanje | `js/main.js` |

Besedila sta v predlogah zapisani drug ob drugem: `[[slovensko||English]]`.

**Po vsaki spremembi v `src/` poženi:**

```
python3 tools/build.py
```

Skript zgradi `index.html`, `en/index.html` in pravne strani. Teh datotek ne urejaj ročno — ob gradnji se prepišejo.

## Mape

- `img/` — slike v AVIF + WebP (800 in 1600 px)
- `video/` — hero scrub videa in predogledi portfelja
- `models/dron.glb` — 3D model (naloži se šele v sekciji Oprema)
- `fonts/`, `js/vendor/` — lokalno gostovane pisave in knjižnice (GSAP, Lenis, model-viewer)

Imena datotek: male črke, brez presledkov in šumnikov.
