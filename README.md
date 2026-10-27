# Tie Bar PDP cross-sell prototype

A clickable prototype of the "Pairs Well With" cross-sell row on a Tie Bar tie page, desktop and mobile.

**Live:** https://christopher-tds.github.io/ttb-cross-sell-prototype/

- Use the prototype controls (top right) to switch style, layout, product mix and viewport. The settings are kept in the URL, so a link opens the same view.
- Dress shirts and belts open an options sheet (a bottom sheet on mobile, a modal on desktop). Everything else adds to the bag in one tap.
- Product names, prices, options and photos come from thetiebar.com (checked Oct 26, 2026). Photos load from Shopify's CDN.
- Design source: Figma `ZTcjdmCwmWRjVy5OMtV7xg`, page "PDP / Cross-Sell". Background: Asana task 1214141640107315.

## Fonts

The brand fonts (Poynter Gothic, Belizio) are licensed and aren't in this repo. The live page falls back to Roboto, the same fallbacks thetiebar.com uses. To preview with the real fonts locally, put the `.woff2` files in `fonts/`.

## Run locally

```bash
python3 serve.py
```

Then open http://localhost:5180/. The page reloads when a file changes.
