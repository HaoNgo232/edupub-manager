---
name: EduPub Moleskine Light
colors:
  surface: '#faf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#faf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f0'
  surface-container: '#efeeea'
  surface-container-high: '#e9e8e4'
  surface-container-highest: '#e3e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#46464b'
  inverse-surface: '#2f312e'
  inverse-on-surface: '#f2f1ed'
  outline: '#76777b'
  outline-variant: '#c7c6cb'
  surface-tint: '#5d5e65'
  primary: '#030509'
  on-primary: '#ffffff'
  primary-container: '#1c1e24'
  on-primary-container: '#84858d'
  inverse-primary: '#c5c6ce'
  secondary: '#585e6b'
  on-secondary: '#ffffff'
  secondary-container: '#dae0ee'
  on-secondary-container: '#5d636f'
  tertiary: '#140000'
  on-tertiary: '#ffffff'
  tertiary-container: '#460002'
  on-tertiary-container: '#e5564b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2ea'
  primary-fixed-dim: '#c5c6ce'
  on-primary-fixed: '#191b21'
  on-primary-fixed-variant: '#45464d'
  secondary-fixed: '#dde2f1'
  secondary-fixed-dim: '#c1c6d5'
  on-secondary-fixed: '#161c26'
  on-secondary-fixed-variant: '#414753'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#8d1514'
  background: '#faf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e3e2df'
  paper-cream: '#F5F5F0'
  graphite-border: '#D1D5DB'
  ink-black: '#0F1115'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-edge: 32px
  page-max-width: 1140px
---

## Brand & Style

The design system is a digital interpretation of the classic scholarly notebook—a space where academic rigor meets the tactile simplicity of high-quality stationery. It is built for EduPub Manager to evoke the feeling of a clean, physical manuscript page: focused, intentional, and devoid of digital clutter.

The aesthetic follows a **Minimalist** approach with a **Tactile** soul. It rejects the artificiality of gradients and shadows in favor of "paper" surfaces, "ink" strokes, and a single, authoritative accent color. The goal is to provide an environment that feels as reliable as a leather-bound journal, prioritizing readability and systematic organization for educational content.

## Colors

The palette is strictly curated to mimic physical media. 

- **Primary (#1C1E24):** The "Graphite" ink. Used for all primary headings and body text to ensure maximum legibility against the paper-like background.
- **Secondary (#707683):** The "Lead" tone. Reserved for metadata, secondary labels, and structural elements like borders.
- **Tertiary (#E4554A):** The "Bookmark Red." This is the sole driver of interaction. It is used sparingly for primary call-to-action buttons, active states, and critical highlights.
- **Neutral (#FDFCF8):** The "Off-White" base. This provides a softer, more eye-friendly canvas than pure white, reducing digital fatigue.

**Color Mode:** This design system is exclusively light-themed to maintain the parchment-and-ink metaphor.

## Typography

The design system utilizes **Inter** across all levels to achieve a professional, systematic, and utilitarian feel. While the concept is based on a notebook, the typography choice ensures it feels like a modern publishing tool rather than a casual sketchpad.

- **Headlines:** Use tight letter-spacing and heavier weights to create an authoritative "printed" look.
- **Body:** Generous line-heights are employed to ensure academic texts remain breathable.
- **Labels:** Small caps or increased letter-spacing should be used for metadata to distinguish it from the narrative flow of the body text.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model that mimics the constraints of a physical page. Content is centered with generous outer margins to focus the user's attention on the "manuscript" area.

- **Grid:** A 12-column grid is used for desktop, reducing to 4 columns for mobile.
- **Rhythm:** An 8px base unit drives all padding and margins, creating a predictable, mathematical rhythm consistent with grid paper.
- **Margins:** Extra-large margins (32px+) are encouraged to prevent content from feeling "trapped" and to allow the neutral background color to act as a frame.

## Elevation & Depth

This design system avoids all drop shadows and blurs. Depth is conveyed exclusively through **Tonal Layers** and **Thin Borders**.

- **Tonal Layers:** The background is the base layer (`#FDFCF8`). Interactive cards or sidebar elements use a slightly darker "paper" tone (`#F5F5F0`) to appear "stacked."
- **Borders:** All container definition is handled by 1px solid borders in `#D1D5DB` (Graphite Border). This provides a crisp, architectural structure similar to the ruled lines of a composition notebook.
- **Selection:** Active states are indicated by a 2px solid Tertiary border or a subtle fill change, never by elevation or lift.

## Shapes

The shape language is **Soft**. Corners are slightly rounded (4px to 8px) to reflect the organic edges of a high-end notebook. 

- **Containers:** Cards and primary containers should use `rounded-lg` (8px).
- **Small Elements:** Buttons, inputs, and chips should use the base `rounded` (4px).
- **Circles:** Strictly reserved for avatars or status indicators; otherwise, the system remains anchored in rectangular forms.

## Components

### Buttons
- **Primary:** Filled with Tertiary Red (`#E4554A`), white text, no shadow.
- **Secondary:** Transparent background, 1px Primary color border, Primary color text.
- **Tertiary/Ghost:** No border, Primary or Secondary text weight depending on importance.

### Input Fields
- **Default State:** 1px border (`#D1D5DB`), white background, Graphite text.
- **Focus State:** 1px border becomes Primary Graphite (`#1C1E24`) with a subtle 2px inset ring. No glow effects.

### Cards
- **Structure:** 1px solid border, 8px corner radius, zero shadow.
- **Content:** Headline-md for titles, Body-md for descriptions, and Label-sm for timestamps or tags.

### Chips & Tags
- **Style:** Small caps text using Label-sm, background fill of `#F5F5F0`, and a 1px border to distinguish them from the surface.

### Dividers
- **Style:** 1px horizontal lines using `#D1D5DB`. Use to separate sections of text or list items, mimicking the ruling of a page.