# Photos

The strip above the footer pulls from here by filename: `life-1.jpeg`,
`life-2.jpeg`, `life-3.jpeg` and so on.

- Numbering starts at 1 and must not skip — the loader stops at the first gap.
- `.jpeg`, `.jpg`, `.png` and `.webp` all work.
- Any orientation is fine; the strip is a fixed height and each photo keeps its
  own aspect ratio, so portrait shots simply sit narrower than landscape ones.
- Keep them under ~300KB each — they all load on one page.
