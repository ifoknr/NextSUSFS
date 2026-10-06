# NEXT design rules

These apply to every WebUI in the NEXT suite (NextWheel, NextZygisk, NextSUSFS) and to any
new design for it.

- **Fonts:** Sora for Latin text, Noto Kufi Arabic for Arabic, Roboto only for scripts Sora
  lacks (Cyrillic, Vietnamese). Bundle them in `fonts/` with the shared `fonts.css` and
  `OFL.txt`; never load fonts from the network.
- **Layout:** dark cards, a status hero, a compact floating pill navbar. Content fills the
  screen width on tablets (no narrow centred column); grids go 2 → 3 columns at 640px.
- **Arabic:** right-to-left via `dir="rtl"`. Put a space between "و" and a following
  English word or path, or the browser shows them in the wrong order.
- **Links:** developer and project links open in the system browser
  (`am start -a android.intent.action.VIEW`), never inside the WebView.
- **Credits:** ifoknr (https://github.com/ifoknr) is listed as developer, next to the
  upstream authors the project's license requires.
