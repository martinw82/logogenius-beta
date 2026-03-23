# PDF Brand Guide — Design Brief
### A working document for planning the visual direction

**Status:** In progress — needs design decisions before implementation
**Who this is for:** Anyone working on the look and feel (designer, collaborator, you)
**Goal:** Output that looks like it came from a real agency — something the customer is proud to show people

---

## How to use this document

Work through each section and fill in the `[ DECISION ]` boxes. You don't need to be technical — this is purely about how things should *look*. Once decisions are made, hand it back and we'll implement them in CSS.

---

## 1. Current State (What exists right now)

The PDF generates and works. The content is all there. It just looks basic — generic font, small logo, wall of text, tiny colour swatches. Think "Word doc" rather than "agency deck."

**What it currently has:**
- Cover page with a coloured bar and the business name
- Sections of AI-generated text (brand story, identity, voice, etc.)
- Small colour swatches with hex codes
- Font names listed (not shown as actual specimens)
- Mockup images inline

**What it needs:**
- Graphical weight — shapes, dividers, bold visual moments
- Breathing room — more white space, less crammed content
- Strong typography hierarchy — not everything the same size
- A cover that makes you go "wow, that looks professional"
- Colour used intentionally throughout, not just on swatches

---

## 2. Reference Examples — Find These Before Deciding Anything

Look up these real brand guidelines and note what you like / don't like about each one:

| Brand | Where to find | What to look for |
|-------|--------------|-----------------|
| **Uber** | Search: "Uber brand guidelines PDF" | Super clean, grid-based, lots of white space |
| **Spotify** | Search: "Spotify brand guidelines" | Bold colour blocks, strong type hierarchy |
| **Mailchimp** | Search: "Mailchimp brand guidelines" | Friendly, illustrated, lots of personality |
| **Notion** | Search: "Notion brand book" | Minimal, editorial, refined |
| **Airtable** | Search: "Airtable brand guidelines" | Colourful geometry, modern layout |
| **NASA** | Search: "NASA Graphics Standards Manual PDF" | Classic grid system, reference for structure |

**For each one, note:**
- What's the cover doing? (Full bleed photo? Bold colour? Logo only?)
- How many columns? (1, 2, 3?)
- What graphical elements repeat throughout? (Lines, shapes, dots, patterns?)
- Does it use section divider pages? (Full page with just a number and section name?)
- How do they show colour swatches?
- How do they show typography?

---

## 3. Overall Design Direction

Before touching individual pages, agree on these high-level choices:

### 3a. Tone / Feeling

Pick ONE of these directions (or describe your own):

- [ ] **Minimal / Swiss** — Lots of white space, grid-based, typography does the heavy lifting. Think Notion, Stripe.
- [ ] **Bold / Editorial** — Strong colour blocks, large type, almost magazine-like. Think Spotify, Mailchimp.
- [ ] **Corporate / Professional** — Clean, safe, trustworthy. Think Big 4 consultancy deck.
- [ ] **Creative / Expressive** — Geometric shapes, illustration elements, more personality. Think Airtable.
- [ ] **Other:** _______________

`[ DECISION ]` _______________

---

### 3b. Layout Grid

How wide are the margins? How many columns does content sit in?

- [ ] **Single column, generous margins** — Simple and elegant
- [ ] **Two column** — Text left, visual right (or vice versa) on most pages
- [ ] **Mixed** — Single column for text pages, two/three for colour/type pages

`[ DECISION ]` _______________

---

### 3c. Graphical Element Style

What recurring visual elements tie the document together?

**Options:**
- **Thick coloured line** — a horizontal rule in the brand primary colour that appears on every page header
- **Geometric shapes** — circles, rectangles, abstract shapes in the background (subtle or bold?)
- **Dot grid / texture** — a subtle pattern behind certain sections
- **Bold section numbers** — very large, light-weight numerals (like "01", "02") behind section headings
- **Full-bleed colour pages** — some pages are entirely the brand colour with white text
- **None** — typography and layout alone carry the visual weight

`[ DECISION — pick any combination ]` _______________

---

### 3d. Colour Usage Strategy

The PDF is generated with the *customer's* brand colours. How aggressively do we use them?

- [ ] **Accents only** — Colour appears on the cover, section headings, and swatches. Everything else is black on white.
- [ ] **Section dividers** — Divider pages between sections are full brand-colour backgrounds.
- [ ] **Throughout** — Sidebars, callout boxes, pull quotes, headers all use brand colour.
- [ ] **Gradient** — Use a gradient of the brand colours (e.g. primary → secondary) for the cover and dividers.

`[ DECISION ]` _______________

---

### 3e. Font Strategy

We can use any Google Font. The customer's brand fonts are used for headings in the *content*, but what about the document's own UI chrome (page numbers, labels, section names)?

- [ ] **Match customer fonts entirely** — The whole doc uses whatever fonts the customer chose
- [ ] **One neutral font for chrome** — e.g. Inter or DM Sans for page numbers/labels, customer font for headings
- [ ] **Specific pairing:** Heading: ___________ / Body: ___________

`[ DECISION ]` _______________

---

## 4. Page-by-Page Design Decisions

Work through each page and answer the questions. Sketches welcome — photograph a napkin sketch and attach it.

---

### PAGE 1 — Cover

**Job:** First impression. Should be striking.

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                                                 │
│          What goes here?                        │
│                                                 │
│          [ Full bleed brand colour? ]           │
│          [ Large background shape? ]            │
│          [ Diagonal split — colour/white? ]     │
│          [ Dark/moody photo texture? ]          │
│                                                 │
│               [ LOGO — how big? ]               │
│                                                 │
│            BUSINESS NAME  (what size?)          │
│              Tagline here  (what size?)         │
│                                                 │
│  ─────────────────── Brand Guidelines ──────── │
│                                                 │
│   Prepared for: Client Name    Date: Mar 2026   │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Design questions:**
- Background: solid brand colour / split layout / something else?
- Logo: centred / top-left / large and hero / small and subtle?
- Is the logo on a white "card" panel, or floating on the colour?
- What text appears? (Name, tagline, date, "Brand Guidelines" label?)
- Bottom area: simple footer bar / nothing / gradient fade?

`[ DECISION / SKETCH NOTES ]`

```
(write notes or describe your sketch here)
```

---

### PAGE 2 — Table of Contents

**Job:** Give the reader a map. Should feel organised and clean.

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   Contents                                      │
│   ════════════════════════════════════════      │
│                                                 │
│   01 .................. Brand Story             │
│   02 .................. Brand Identity          │
│   03 .................. Logo                    │
│   04 .................. Logo Usage              │
│   05 .................. Colour Palette          │
│   06 .................. Typography              │
│   07 .................. Imagery Style           │
│   08 .................. Brand Voice             │
│   09 .................. Applications            │
│   10 .................. Do's & Don'ts           │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Design questions:**
- Left-aligned list / two-column / centred?
- Dot leaders (.....) or lines (─────) or nothing between title and number?
- Section numbers in brand colour?
- Small thumbnail/icon per section?
- Or keep it super minimal — just the list?

`[ DECISION ]`

---

### PAGE 3 — Section Divider (repeated between sections)

**Job:** Clear visual break between chapters. Often the most graphic page.

```
Option A — Full brand colour:
┌─────────────────────────────────────────────────┐
│█████████████████████████████████████████████████│
│█                                               █│
│█                                               █│
│█           01                                  █│
│█                                               █│
│█        Brand Story                            █│
│█                                               █│
│█                                               █│
│█████████████████████████████████████████████████│

Option B — Large number, minimal:
┌─────────────────────────────────────────────────┐
│                                                 │
│                                                 │
│    ░░░░░░░                                      │
│    ░░  01 ░░  Brand Story                       │
│    ░░░░░░░                                      │
│                                                 │
│                                                 │

Option C — No divider pages at all — sections just start
```

`[ DECISION ]`

---

### PAGE 4 — Brand Story (text-heavy page)

**Job:** Two to three paragraphs of the brand narrative.

```
┌─────────────────────────────────────────────────┐
│  ▌ Brand Story                   [ page 4 ]    │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Paragraph one of the brand narrative goes      │
│  here. Two to three sentences. Brand voice.     │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │  "Key mission statement pulled out as    │   │
│  │   a highlighted quote or callout box"    │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  Paragraph two continues the story...           │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Design questions:**
- Pull quote / callout box: yes or no? What colour?
- Left accent bar (thick coloured line on left edge of callout)?
- One column or two (text left, decorative right)?
- Header style: big section title / small label?

`[ DECISION ]`

---

### PAGE 5 — Logo Showcase (full page)

**Job:** The logo gets a moment to breathe. Should feel premium.

```
┌─────────────────────────────────────────────────┐
│  ▌ Our Logo                                     │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │                                           │  │
│  │                                           │  │
│  │              [ LOGO ]                     │  │
│  │           large, centred                  │  │
│  │         on white background               │  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  Optional: also show logo on dark background    │
│  Optional: also show icon/mark only version     │
│                                                 │
│  Short philosophy text (1 paragraph)            │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Design questions:**
- Logo on white only, or also show on brand-colour background?
- Show just the main logo, or also the icon, and reversed (white on dark)?
- How much of the page should the logo fill? (50%? 70%? Edge to edge?)
- Light grey bounding box around it, or no border at all?

`[ DECISION ]`

---

### PAGE 6 — Logo Usage Rules

**Job:** Clear space, minimum size, do's and don'ts.

```
┌─────────────────────────────────────────────────┐
│  ▌ Logo Usage                                   │
│                                                 │
│  Clear Space                                    │
│  ┌──────────────────────┐                       │
│  │  · · · · · · · · · · │                       │
│  │  ·  ┌──────────┐  · │                       │
│  │  ·  │  LOGO    │  · │                       │
│  │  ·  └──────────┘  · │                       │
│  │  · · · · · · · · · · │                       │
│  └──────────────────────┘                       │
│  Maintain 1× logo height on all sides           │
│                                                 │
│  ┌──────────────┐    ┌──────────────┐           │
│  │  ✓  DO       │    │  ✗  DON'T   │           │
│  │  Use on      │    │  Stretch it  │           │
│  │  approved    │    │  Rotate it   │           │
│  │  backgrounds │    │  Add effects │           │
│  └──────────────┘    └──────────────┘           │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Design questions:**
- Green/red for do/don't boxes, or brand colours?
- Inline on one page or split across two?
- Show actual misuse examples (logo stretched, distorted) as visual warnings?

`[ DECISION ]`

---

### PAGE 7 — Colour Palette

**Job:** Make the colours look beautiful, not like a spreadsheet.

```
┌─────────────────────────────────────────────────┐
│  ▌ Colour Palette                               │
│                                                 │
│  Primary                                        │
│  ┌─────────────────┐  ┌─────────────────┐       │
│  │                 │  │                 │       │
│  │  (large swatch) │  │  (large swatch) │       │
│  │                 │  │                 │       │
│  └─────────────────┘  └─────────────────┘       │
│  Ocean Blue             Midnight Navy            │
│  #2563EB                #1E40AF                  │
│  R 37  G 99  B 235      R 30  G 64  B 175       │
│  C84 M58 Y0 K8          C83 M63 Y0 K31          │
│                                                 │
│  Secondary    ┌──────┐  ┌──────┐  ┌──────┐      │
│               │      │  │      │  │      │      │
│               └──────┘  └──────┘  └──────┘      │
│                                                 │
│  Usage: ████████████░░░░░░░░░░░░░░░░            │
│         60% Primary  30% Secondary  10% Accent  │
└─────────────────────────────────────────────────┘
```

**Design questions:**
- Primary swatch size: large rectangle (the whole left half of the page?) or moderate card?
- Show colour name (e.g. "Ocean Blue") or just the hex?
- Show RGB + CMYK values, or hex only?
- Usage proportion bar: yes or no?
- Show text-on-colour examples (e.g. white text on primary, dark text on light)?
- Pantone references: yes (approximate) or skip?

`[ DECISION ]`

---

### PAGE 8 — Typography

**Job:** Show the actual fonts in use, at real sizes.

```
┌─────────────────────────────────────────────────┐
│  ▌ Typography                                   │
│                                                 │
│  Primary Typeface: Montserrat                   │
│  ┌───────────────────────────────────────────┐  │
│  │  Aa  Bb  Cc  Dd  Ee  Ff  Gg  Hh  Ii  Jj  │  │
│  │  1   2   3   4   5   6   7   8   9   0   │  │
│  │  ! @ # $ % & * ( ) - = + [ ] { } ; :     │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  Display (48pt)   This is Display Text          │
│  Heading (32pt)   This is Heading Text          │
│  Subheading (24pt) Subheading Text              │
│  Body (14pt)  The quick brown fox jumps over    │
│  Caption (10pt)  Caption or label text          │
│                                                 │
│  Body Typeface: Inter                           │
│  ┌───────────────────────────────────────────┐  │
│  │  Aa  Bb  Cc  Dd  Ee  Ff  Gg  ...         │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Design questions:**
- Show full alphabet specimen, or just "Aa Bb Cc..." sample?
- Show the type hierarchy (H1, H2, Body, Caption) with real sizes?
- One font per page, or fit all fonts on one page?
- Font pairing rationale text (a sentence explaining why these work together)?

`[ DECISION ]`

---

### PAGE 9 — Imagery Style

**Job:** Tell the reader what photography and visual style to use.

**Design questions:**
- Show placeholder image frames, or text description only?
- "Good example" vs "bad example" side by side?
- Bullet list of rules, or paragraph, or icon list?
- This page tends to be thin on content — does it need a full page, or combine with Brand Voice?

`[ DECISION ]`

---

### PAGE 10 — Brand Voice

**Job:** How the brand writes and speaks.

```
  ┌─────────────────┐    ┌─────────────────┐
  │  We ARE:        │    │  We are NOT:    │
  │  ─────────────  │    │  ──────────── │
  │  Confident      │    │  Arrogant      │
  │  Warm           │    │  Casual        │
  │  Expert         │    │  Pretentious   │
  └─────────────────┘    └─────────────────┘
```

**Design questions:**
- Two-column "We are / We are not" table — yes or no?
- Accent colour on the "We are" column?
- Writing examples shown (sample sentences in the brand voice)?
- Vocabulary guide (words to use / avoid)?

`[ DECISION ]`

---

### PAGE 11–12 — Mockup Gallery (Applications)

**Job:** Show the logo in the real world. This is often the most impressive section.

**Design questions:**
- Each mockup full-width (one per page), or 2-up grid?
- Caption below each? (e.g. "Business card — professional networking")
- Dark background behind mockups or white?
- Full-bleed to the page edge, or with a margin?
- Which mockups are included? Business card / letterhead / t-shirt / phone screen / billboard / other?

`[ DECISION ]`

---

### PAGE 13 — Back Cover

**Job:** Clean ending. Mirror the front cover in feel.

**Design questions:**
- Same background as the front cover, or reversed (e.g. dark instead of light)?
- Just business name + tagline, or also website/email?
- "Prepared by LogoGenius" credit — yes or no?
- Version number and date?

`[ DECISION ]`

---

## 5. Recurring Page Elements (Chrome)

Every page has these. Decide once, apply everywhere.

### Page Header
- [ ] Just the section name in small caps
- [ ] Business name left + section name right
- [ ] Thin coloured line under header
- [ ] Nothing at all — clean

`[ DECISION ]`

### Page Footer
- [ ] Page number only (centred)
- [ ] Business name left + page number right
- [ ] "Confidential | Brand Guidelines" + page number
- [ ] Nothing

`[ DECISION ]`

### Section Heading Style (inside pages)
What does the heading "Colour Palette" look like at the top of that page?

- [ ] Large, bold, left-aligned with a thick coloured underline
- [ ] Large, bold with a vertical coloured bar on the left (like a blockquote)
- [ ] Smaller, all-caps, spaced-out letters (elegant, quiet)
- [ ] Giant and light-weight, almost a background element

`[ DECISION ]`

---

## 6. Assets to Source or Create

Things you'll need before implementation can be finalised:

| Asset | Status | Notes |
|-------|--------|-------|
| Reference PDFs (see Section 2) | ⬜ To find | Google the examples above |
| Preferred font pairing | ⬜ To decide | From Google Fonts — test at fonts.google.com |
| Graphical element direction | ⬜ To decide | Shapes? Lines? Patterns? |
| Cover layout sketch | ⬜ To sketch | Napkin sketch is fine |
| Mockup types to include | ⬜ To decide | Which ones matter most to customers? |
| Do/Don't example images | ⬜ Optional | Show logo misuse visually |

---

## 7. Open Questions

Things we haven't decided yet — add more as you think of them:

- [ ] Should the PDF feel **branded to LogoGenius** (our watermark/credit) or feel **100% like it came from the customer**?
- [ ] Should section divider pages be included, or is that too many pages?
- [ ] Do we include a Pantone colour approximation on the swatches?
- [ ] How many pages total is acceptable? (Currently ~13. Is 15–18 okay?)
- [ ] Should there be a "Web Colours" vs "Print Colours" distinction anywhere?
- [ ] Do we want a light background texture/noise across all pages (subtle, like a paper texture), or stark white?

---

## 8. Next Step After This Document

Once the design decisions above are filled in:

1. Share back with the developer
2. We implement in the HTML/CSS template (in-browser preview first)
3. You review in-browser, tweak, sign off
4. Then and only then: Railway microservice is wired up for final PDF output

---

*Last updated: 2026-03-23*
