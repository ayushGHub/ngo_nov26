# LEAF website — Human-inspired redesign copy

A rebuild of the Let's Educate All Foundation site (`letseducateall.org`), replacing
the January 2024 templatemo/Bootstrap version in `../jan24_ngo_web-main`.

This is a separate copy of the static LEAF site. The original remains in
`../sep26_ngo_web/`; this copy adds the Human MD-inspired visual theme and does
not modify the original.

Plain static HTML, CSS and JavaScript. **No build step, no dependencies, no npm.**
Upload the folder to any static host and it works.

---

## What changed from the old site

| | Old (jan24) | Static redesign copy |
|---|---|---|
| Framework | Bootstrap 3 + jQuery 1.x + Owl Carousel + Font Awesome | none — hand-written CSS/JS |
| JS payload | ~300 KB of libraries | ~11 KB, vanilla |
| Photography | mostly stock; 8 images returned **404** on the live site | **45 real photos**, zero stock, no photo repeated |
| Largest image | 4–5 MB JPEGs served full size | responsive WebP + JPEG fallback |
| First load | several MB | **~270 KB** |
| Theme | Bootstrap template | Human MD-inspired palette, shapes and motion |
| Pages | one (`contribute.html` was 0 bytes / broken) | home, donate, **gallery**, documents, 404 |
| Logo | 2021 seal (223 KB copy) | **2025 seal** (`NGO_LOGO25-removebg-preview.png`) |
| Verification | registration number only | **NGO DARPAN ID, CIN, office bearers** + DARPAN certificate |
| `<meta name="description">` | empty | written per page |
| Social sharing | none | Open Graph + Twitter card + generated share image |
| Structured data | none | `NGO` JSON-LD |
| Accessibility | no landmarks, no alt text, no focus styles | skip link, landmarks, alt on all 54 images, visible focus, keyboard carousel + lightbox, `prefers-reduced-motion` |
| Dark mode | no | yes, via `prefers-color-scheme` |

### Bugs fixed along the way
- Eight images referenced by the live site (`tst-image1–4`, `author-image1–2`,
  `courses-image4–5`) are **404s** in production — templatemo placeholders,
  now gone entirely.
- `contribute.html` on the live site is a **zero-byte file**. Replaced by `donate.html`.
- The old local folder shipped an **older logo** than the live site. Both are now
  superseded by the April 2025 seal.
- `DIN.PDF` had an inconsistent uppercase extension — normalised.

---

## Layout

```
sep26_ngo_web-human-md/
├── index.html              home
├── donate.html             ways to give (UPI / NEFT / cheque)
├── gallery.html            18 photos in five themed groups
├── transparency.html registration certificates
├── 404.html
├── favicon.ico, apple-touch-icon.png, site.webmanifest
├── robots.txt, sitemap.xml
├── assets/
│   ├── css/site.css        base design tokens + styles
│   ├── css/human-theme.css Human MD-inspired theme overrides
│   ├── js/site.js          nav, carousel, reveal, lightbox, copy-to-clipboard
│   ├── img/                157 shipped derivatives (WebP + JPEG/PNG)
│   │   └── _raw/           ORIGINALS — do not deploy (see below)
│   ├── docs/               6 registration PDFs
│   └── video/leaf-story.mp4
└── tools/
    ├── optimize-images.py  responsive derivatives from _raw/
    └── make-icons.py       favicons, app icons, OG share card
```

### `assets/img/_raw/` is a source folder, not a web asset
It holds ~29 MB of full-resolution originals so the image pipeline can be re-run.
It is excluded in `robots.txt`, but **exclude it from upload** too. Everything the
site actually loads lives directly in `assets/img/`.

---

## Where the photos came from

All photography is the foundation's own, pulled from this Dropbox — **nothing is
stock and nothing was sourced from the internet**:

| Source folder | Used for |
|---|---|
| `../RishiVille/photos/school_inside_july/` | computer lab, smart classroom, assembly, carrom, playtime |
| `../RishiVille/photos/` | library opening, exams, attendance awards, nursery, group photo, village sabha |
| `../FundRaise/` | About section, "Laying foundations" |
| `../jan24_ngo_web-main/.../images/` | the four hero slides, catchment map, team headshots |
| `../../NGO_LOGO25-removebg-preview.png` | logo, favicons, share card |

There are ~320 more photos in `../RishiVille/photos/` (including 230 from the
2023–24 village tour) that are not yet used.

---

## NGO verification details

Taken from the NITI Aayog NGO DARPAN record
(`../Docs/DRPANID_LETS_EDUCATE_ALL_FOUNDATION.pdf`, generated 15-11-2025):

| Field | Value |
|---|---|
| NGO DARPAN ID | BR/2025/0886821 |
| DARPAN registered | 15 November 2025 |
| CIN | U80900BR2021NPL051236 |
| Registered with | Registrar of Companies, Rohtas, Bihar |
| Date of registration | 19 March 2021 |
| Registered address | Sasaram, Rohtas district, Bihar — 821115 |

These appear on `transparency.html` and in the footer of every page, alongside a
link so donors can verify the DARPAN ID at ngodarpan.gov.in themselves.

### Three things to check

1. **The registration number differs from the old site.** The old site said
   "Reg no 051238". The DARPAN record and CIN say **...051236**. The last digit
   of a CIN's numeric tail *is* the registration number, so `051238` looks like
   a typo that has been carried for years. The site now shows the full CIN from
   the official record. If `051238` is in fact correct, it needs changing in
   4 files.
2. **The DARPAN certificate contains personal data.** The PDF shows a
   residential address ("c/o Shanti Kumari w/o Sushil Kumar Dubey…") and a
   personal Gmail address as the NPO contact. DARPAN records are publicly
   searchable, so this is not new exposure — but the PDF is now linked from the
   site. The page text itself deliberately shows only the town and PIN, and
   `contact@letseducateall.org` rather than the personal address.
3. **DARPAN lists "Type of NPO: Trust"** while the entity is a Section 8
   company. That inconsistency is in the government record, not on the site —
   worth correcting on the portal. The portal's "Website Url" field is also
   empty; adding `letseducateall.org` there would help donors cross-check.

The original 31 MB / 2-page PDF was recompressed to a **144 KB single page**
(page 2 was blank). The original remains untouched in `../Docs/`.

---

## Editing

**Text and numbers** are plain HTML — edit the file directly.

**Campaign progress bars** appear on the home page:
```html
<div class="meter__fill" data-pct="5"></div>
<div class="meter__row"><span class="meter__pct">5% funded</span>...
```
`data-pct` drives the bar width; the adjacent text is separate, so **update both**.

> Figures last confirmed September 2026: digital library **5%**, kindergarten
> **10%**, computer centre **10%**, each against a US$10,000 target.

**Colours and type** are CSS custom properties in `site.css` and
`human-theme.css`. The theme overrides the base palette; change the theme file
to update this copy without changing the original site.

### Adding or replacing a photo
1. Drop the original into `assets/img/_raw/`, named after its slot
   (e.g. `hero-village.jpg`).
2. Add or adjust its entry in `SPECS` in `tools/optimize-images.py` —
   aspect ratio, widths, and a vertical focal point (`0` top … `1` bottom)
   controlling where a tall image gets cropped.
3. `python3 tools/optimize-images.py`
4. Update the `srcset`/`src` in the HTML if the widths changed.

The optimizer **auto-trims solid black letterbox/pillarbox bars**, which
forwarded WhatsApp photos frequently have baked in. Two of the nursery images
needed 296 px and 312 px removed.

### Replacing the logo
Overwrite `assets/img/_raw/logo.png`, then `python3 tools/make-icons.py`.
That regenerates the shipped logo, `favicon.ico`, the Apple touch icon, the
PWA icons and the Open Graph share card in one pass.

Both tools need Pillow: `python3 -m pip install Pillow`

### Adding gallery photos
Each tile in `gallery.html` is a real `<a href="full.jpg">`, so it works without
JavaScript; the lightbox is a progressive enhancement. Tile counts are chosen to
divide evenly into the 4-column desktop grid — `gallery__item--wide` spans two
cells, so count cells, not tiles, if you add more.

**No photo is used twice anywhere on the site.** Gallery-page-only images use a
`g-` filename prefix to keep that obvious. To check after editing:

```sh
grep -oE 'assets/img/[a-z0-9-]+-[0-9]+\.(webp|jpg|png)' *.html \
  | sed 's/:.*img\///; s/-[0-9]*\.[a-z]*$//' | sort -u | wc -l
```

---

## Preview locally

```sh
cd sep26_ngo_web
python3 -m http.server 8000
# then open http://localhost:8000
```

Open it over `http://`, not by double-clicking — `file://` blocks the clipboard
copy buttons.

---

## Deploying

Static files only, so any of these work: the current host, Netlify, Cloudflare
Pages, GitHub Pages, S3. Two things to set if your host supports them:

- serve `404.html` for unknown paths
- long `Cache-Control` on `/assets/` (filenames carry their width, so a changed
  image means a changed filename)

Before going live, replace `https://www.letseducateall.org/` in the canonical
tags, Open Graph URLs and `sitemap.xml` if the domain ever changes.

---

## Known gaps / worth doing next

- **Two team headshots are very low resolution** — `preeti_s.jpg` (127×127) and
  `klaus.jpg` (128×129). They are displayed at 150 px and look soft. Replace the
  originals in `_raw/` and re-run the optimizer.
- **No donation form.** The donate page gives UPI, bank and cheque details
  rather than taking card payments, matching what the old site did. A gateway
  (Razorpay / Instamojo) would need a backend.
- **Udit Satija and Vipul Rawal** are commented out in the old `index.html`
  and so are not shown. Their photos and details exist if you want them back.
- **The RishiVille International School seal** (`NGO_SCHOOL_LOGO25-removebg-preview.png`,
  Estd. 2024, with a LEAF ribbon) is a separate mark and is not used here. Say
  the word if the site should carry the school brand rather than the foundation's.
- No analytics is installed. Nothing tracks visitors.
- ~320 photos in `../RishiVille/photos/` are still unused, including most of the
  230-image 2023–24 village tour.
- `leaf-story.mp4` is 19 MB with `preload="none"`, so it only downloads on play.
  Worth compressing if you have the tooling.

---

## Content provenance

All copy, names, roles, registration numbers, bank details and the UPI ID were
taken from the existing site and `contribute_old.html` — nothing was invented.
The "at a glance" strip on the homepage (2021 / Rohtas / Section 8 / 80G) is
derived only from facts already stated in that source material; no impact
figures were estimated. Photo captions and section copy describe only what is visibly in each frame or
what the foundation's own material already states. An earlier draft of the
"Inside the centre" and gallery text contained claims about effectiveness and
popularity that were not sourced from anything — those have been removed.
