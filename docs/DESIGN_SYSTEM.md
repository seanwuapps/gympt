# Design System — AI Training Companion

## Typography

### Primary Font: Inter

**Why Inter?**

- **Optimized for screens** - Designed specifically for digital interfaces
- **Excellent legibility** - Clear at small sizes, crucial for mobile workout tracking
- **Superior number clarity** - Critical for distinguishing reps, weights, and sets
- **Variable font support** - Flexible weights without multiple file downloads
- **Professional & modern** - Clean aesthetic that inspires confidence
- **Open source** - No licensing concerns

**Implementation:**

- Loaded via `@nuxt/fonts` module from Google Fonts
- Configured in `nuxt.config.ts`
- Applied globally via `app/assets/css/main.css`

### Font Features

- **Tabular numbers** enabled for numeric displays (`.numeric` class)
- Ensures consistent width for numbers (important for aligned columns of weights/reps)
- Lining figures for better readability in UI contexts

## Spacing System

Mobile-first spacing scale using CSS custom properties (rem-based for accessibility):

```css
--spacing-xs: 0.25rem (4px at 16px base) --spacing-sm: 0.5rem (8px at 16px base) --spacing-md: 1rem
  (16px at 16px base) --spacing-lg: 1.5rem (24px at 16px base) --spacing-xl: 2rem
  (32px at 16px base);
```

**Why rem units?**

- Respects user's browser font size preferences (accessibility)
- Scales proportionally when users adjust text size
- More predictable than em units (relative to root, not parent)
- Better for responsive design

## Mobile-First Principles

### Touch Targets

- **Minimum 2.75rem (44px)** for all interactive elements (buttons, inputs)
- Ensures accessibility and ease of use during workouts
- Uses rem units to respect user font size preferences

### Font Sizing

- **Base: 1rem (16px default)** on mobile to prevent iOS zoom on input focus
- Responsive scaling for larger screens
- All sizing in rem units for accessibility

### Layout

- **Single-column** layouts for mobile
- **Card-based** UI for clear content separation
- **Generous padding** for thumb-friendly interactions

## UI Components (Custom Vanilla)

Using custom vanilla components in `app/components/base/`:

- `BaseCard` - Content containers
- `BaseButton` - Actions (primary, secondary, text, danger)
- `BaseSelect` - Dropdown selects
- `BaseDialog` - Modal dialogs
- `BaseTabs` / `BaseTabList` / `BaseTab` - Tab navigation
- `BaseMessage` - Feedback messages
- `BaseDivider` - Visual separation
- `BaseBadge` - Status indicators
- `BaseProgressSpinner` - Loading states

Toast notifications via `useToast()` composable.

## Color Strategy (Future)

To be defined based on brand direction:

- Primary: Action colors (start workout, log set)
- Success: Completed actions, PRs
- Warning: Caution states (high RPE, injury flags)
- Error: Failed validations, critical issues
- Neutral: Text, backgrounds, borders

## Accessibility

- **WCAG AA** minimum contrast ratios
- **Semantic HTML** for screen readers
- **Keyboard navigation** support
- **Focus indicators** on all interactive elements
- **Clear error messages** with actionable guidance

## Performance

- **Variable fonts** reduce file size vs. multiple font weights
- **Google Fonts** CDN for optimal delivery
- **CSS custom properties** for efficient theming
- **Mobile-first CSS** loads only necessary styles

## Design Tokens (Future Enhancement)

Consider migrating to a token-based system:

- Colors, spacing, typography as JSON
- Shared between design tools and code
- Single source of truth for design decisions
