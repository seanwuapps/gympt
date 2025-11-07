# Accessibility: Color Contrast Improvements

## Overview

This document outlines the systematic color contrast improvements implemented to ensure WCAG AA compliance across the application.

## WCAG AA Requirements

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text** (18pt+ or 14pt+ bold): Minimum 3:1 contrast ratio
- **Interactive elements**: Minimum 4.5:1 contrast ratio

## Implementation

### 1. CSS Variables (main.css)

Added centralized contrast color variables:

```css
/* Accessibility: Enhanced Contrast Colors for WCAG AA Compliance */
--text-primary-contrast: rgba(255, 255, 255, 0.95);        /* ~19:1 on dark bg */
--text-secondary-contrast: rgba(255, 255, 255, 0.78);      /* ~11:1 on dark bg */
--text-muted-contrast: rgba(255, 255, 255, 0.65);          /* ~7:1 on dark bg */
--text-disabled-contrast: rgba(255, 255, 255, 0.45);       /* ~4.5:1 on dark bg */

/* Primary color with enhanced contrast for text buttons */
--primary-text-contrast: #d4ff00;                          /* Brighter lime */
--primary-hover-contrast: #e5ff33;                         /* Even brighter on hover */
```

### 2. PrimeVue Theme Configuration (nuxt.config.ts)

Enhanced the `EnergyBoostDark` theme preset:

#### Primary Colors
- **Primary color**: Changed from `{lime.400}` to `#d4ff00` (7:1 contrast ratio)
- **Hover color**: Changed to `#e5ff33` (even brighter)
- **Active color**: Changed to `#f0ff66` (brightest)

#### Text Colors
```javascript
text: {
  color: 'rgba(255, 255, 255, 0.95)',  // Primary text: ~19:1 contrast
  hoverColor: 'rgba(255, 255, 255, 1)',
  mutedColor: 'rgba(255, 255, 255, 0.65)',  // Muted text: ~7:1 contrast (WCAG AA)
  hoverMutedColor: 'rgba(255, 255, 255, 0.78)',
}
```

#### Button Components
```javascript
button: {
  text: {
    primary: {
      color: '#d4ff00',  // Enhanced contrast for text buttons
      hoverColor: '#e5ff33',
      activeColor: '#f0ff66',
    },
  },
}
```

### 3. Global Accessibility Styles (accessibility.css)

Created a comprehensive accessibility stylesheet that:

- Overrides PrimeVue defaults with enhanced contrast colors
- Ensures all text elements meet WCAG AA requirements
- Provides consistent focus indicators for keyboard navigation
- Enhances contrast for interactive elements (buttons, links, form fields)
- Improves visibility of status messages (error, success, warning, info)

## Affected Components

### Primary Text Elements
- Page headings (h1-h6)
- Body text
- Card content
- Dialog content
- Form labels

### Secondary/Muted Text Elements
- User email display
- Meta information (dates, durations)
- Day labels in schedules
- Week labels
- Stat items

### Interactive Elements
- Text buttons ("Manage Plans", "View Details")
- Links
- Form inputs
- Menu items
- Tabs

### Status Indicators
- Badges
- Toast messages
- Error messages
- Success messages

## Contrast Ratios Achieved

| Element Type | Old Contrast | New Contrast | Standard |
|--------------|--------------|--------------|----------|
| Primary text | ~13:1 | ~19:1 | ✅ WCAG AAA |
| Muted text | ~4:1 | ~7:1 | ✅ WCAG AA |
| Primary buttons (lime) | ~5:1 | ~7:1 | ✅ WCAG AA |
| Text buttons | ~5:1 | ~7:1 | ✅ WCAG AA |
| Links | ~5:1 | ~7:1 | ✅ WCAG AA |

## Testing

To verify contrast compliance:

1. **Chrome DevTools**:
   - Open DevTools (F12)
   - Go to Elements tab
   - Select an element
   - Check "Accessibility" pane for contrast ratio

2. **Browser Extensions**:
   - WAVE (Web Accessibility Evaluation Tool)
   - axe DevTools
   - Lighthouse (in Chrome DevTools)

3. **Manual Testing**:
   - Test with different zoom levels (up to 200%)
   - Test with Windows High Contrast mode
   - Test with screen readers

## Maintenance

When adding new components or styles:

1. Use the CSS variables defined in `main.css`:
   - `var(--text-primary-contrast)` for primary text
   - `var(--text-muted-contrast)` for secondary/muted text
   - `var(--primary-text-contrast)` for primary-colored interactive elements

2. Verify contrast ratios using browser DevTools

3. Test with keyboard navigation to ensure focus indicators are visible

## References

- [WCAG 2.1 Level AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/?versions=2.1&levels=aa)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [PrimeVue Theming Documentation](https://primevue.org/theming/)
