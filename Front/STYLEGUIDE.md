# Project Style Guide

This document describes the coding and styling rules for the project.

---

## 1. Import Order
Imports in each file should follow this exact order:

1. **React components** (e.g., `import React, { useState } from "react";`)
2. **Component-specific CSS file** (if exists)
3. **React Bootstrap components**
4. **External libraries** (e.g., `axios`, `dayjs`)
5. **FontAwesome icons and types**
6. **Custom components** (from `src/components`)
7. **Custom hooks** (from `src/hooks`)
8. **Models / DTOs / Types** (from `src/models`)
9. **Utility functions** (e.g., from `src/utils`)

> Each group should be separated by a blank line for clarity.

---

## 2. Colors
I use the following color palette:

- Dark background: `rgb(23, 25, 27)`
- Regular background: `rgb(33, 37, 41)`
- Primary text: `white`
- Secondary text: `rgb(186, 191, 196)`
- Tertiary text: `rgb(137, 143, 150)`
- Quaternary text: `rgb(100, 105, 111)`
- Success: `rgb(40, 167, 69)`
- Error: `rgb(220, 53, 69)`

---

## 3. Font Sizes
Font size should depend on importance:

- **1.2rem** — very important text (main titles) 
- **1.1rem** — important text (section titles)
- **1rem** — regular text
- **0.8rem** — secondary/less important text
- **0.7rem** — small notes, hints, captions, tooltips

---

## 4. Formatting Rules

- Always leave **one empty line** between logical code blocks.
- Component props should be written **each on a new line**.
- **Exception**: If the only prop is `style`, it may be written in the same line as the component name.

> Example:
```tsx
<Button
    variant="primary"
    style={{
        color: "white"
    }}
    onClick={handleClick}
>
    Click me
</Button>
```

> Exeption:
```tsx
<div style={{ 
    marginTop: "10px" 
}}>
    Content
</div>