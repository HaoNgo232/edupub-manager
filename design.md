---
version: alpha
name: Moleskine
description: Composition notebook: graph-paper blue, pencil lead.
colors:
  primary: "#1C1E24"
  secondary: "#707683"
  tertiary: "#E4554A"
  neutral: "#ECEEF5"
  surface: "#FFFFFF"
  on-primary: "#FFFFFF"
typography:
  display:
    fontFamily: Patrick Hand
    fontSize: 4rem
    fontWeight: 400
    letterSpacing: "0"
  h1:
    fontFamily: Patrick Hand
    fontSize: 2rem
    fontWeight: 400
  body:
    fontFamily: Patrick Hand
    fontSize: 1.05rem
    lineHeight: 1.6
  label:
    fontFamily: Patrick Hand
    fontSize: 0.82rem
    letterSpacing: "0.04em"
rounded:
  sm: 2px
  md: 4px
  lg: 8px
spacing:
  sm: 8px
  md: 16px
  lg: 32px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 12px 20px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: 24px
---
## Overview

A composition-notebook palette: graph-paper blue grid, pencil-lead ink, margin red.

## Colors

The palette is built around high-contrast neutrals and a single accent that drives interaction.

- **Primary (`#1C1E24`):** Headlines and core text.
- **Secondary (`#707683`):** Borders, captions, and metadata.
- **Tertiary (`#E4554A`):** The sole driver for interaction. Reserve it.
- **Neutral (`#ECEEF5`):** The page foundation.

## Typography

- **display:** Patrick Hand 4rem
- **h1:** Patrick Hand 2rem
- **body:** Patrick Hand 1.05rem
- **label:** Patrick Hand 0.82rem

## Do's and Don'ts

- **Do** use Tertiary for exactly one action per screen.
- **Do** let Neutral carry the composition — negative space is a feature.
- **Don't** introduce gradients. This system is flat on purpose.
- **Don't** mix Tertiary with alternate accents; the single-accent rule is load-bearing.
