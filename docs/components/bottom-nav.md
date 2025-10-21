# Bottom Navigation Component

## Overview

A mobile-first bottom navigation bar built with **PrimeVue Tabs** that provides persistent access to the app's primary sections.

## Component Location

`app/components/layout/BottomNav.vue`

## Technology

- **PrimeVue v4** - Uses `Tabs`, `TabList`, and `Tab` components
- **PrimeIcons** - Icon library (`pi-*` classes)
- **Vue Router** - Integrated with `NuxtLink` for navigation

## Features

✅ **Mobile-First Design** - Optimized for thumb-friendly navigation  
✅ **Accessibility** - WCAG AA compliant with keyboard navigation  
✅ **Active State** - Visual indication via `router-link-active` class  
✅ **Session Badge** - Pulse indicator when workout is active  
✅ **Safe Area Support** - Respects iOS notches and home indicators  
✅ **Responsive** - Adapts to tablet/desktop with centered layout  
✅ **PrimeVue Native** - Leverages PrimeVue's built-in accessibility and theming  

## Navigation Structure

| Route | Label | Icon (PrimeIcon) | Purpose |
|-------|-------|------------------|---------|
| `/` | Home | `pi-home` | Dashboard, upcoming sessions |
| `/session` | Workout | `pi-bolt` | Active workout session |
| `/progress` | Progress | `pi-chart-line` | Analytics and reports |
| `/profile` | Profile | `pi-user` | Settings and preferences |

## Usage

The bottom navigation is automatically included in the `default` layout and will appear on all pages except:
- `/login`
- `/onboarding`
- `/confirm`

To use the default layout on a page:

```vue
<template>
  <div>
    <!-- Your page content -->
  </div>
</template>

<script setup lang="ts">
// Layout is applied automatically by Nuxt
</script>
```

## Active Session Badge

The Workout tab shows a pulsing badge when a session is active. To enable this:

1. Create a session store (e.g., `stores/session.ts`)
2. Update the `hasActiveSession` computed in `BottomNav.vue`:

```typescript
// In BottomNav.vue
import { useSessionStore } from '~/stores/session'

const sessionStore = useSessionStore()
const hasActiveSession = computed(() => sessionStore.isActive)
```

## Design Tokens

All styling uses design tokens from `assets/css/main.css`:

```css
--bottom-nav-height: 4rem;           /* Total height */
--bottom-nav-item-size: 3rem;        /* Tap target size */
--bottom-nav-icon-size: 1.5rem;      /* Icon size */
--bottom-nav-font-size: 0.75rem;     /* Label text size */
--nav-gap: 0.25rem;                  /* Icon-label spacing */
```

## Accessibility

- **Tap Targets**: Minimum 48x48px (WCAG AAA)
- **Keyboard Navigation**: Full tab support with visible focus rings
- **Screen Readers**: Proper ARIA labels and `aria-current` for active page
- **Color Contrast**: Meets WCAG AA (4.5:1 minimum)
- **Reduced Motion**: Respects `prefers-reduced-motion` media query

## Customization

### Adding a New Nav Item

Edit `navItems` in `BottomNav.vue`:

```typescript
const navItems = computed<NavItem[]>(() => [
  // ... existing items
  {
    route: '/new-route',
    label: 'New Item',
    icon: YourIcon,
    badge: false // optional
  }
])
```

### Changing Icons

Use PrimeIcons class names. Browse available icons at [primeicons.org](https://primevue.org/icons):

```typescript
{
  route: '/new-route',
  label: 'New Item',
  icon: 'pi pi-star' // PrimeIcon class
}
```

**Popular PrimeIcons for fitness apps:**
- `pi-home` - Home
- `pi-bolt` - Energy/workout
- `pi-chart-line` - Progress/analytics
- `pi-user` - Profile
- `pi-calendar` - Schedule
- `pi-clock` - Timer
- `pi-heart` - Health/favorites
- `pi-cog` - Settings

### Styling Adjustments

Modify design tokens in `assets/css/main.css` to adjust globally, or override styles in the component's `<style scoped>` section.

## Best Practices

1. **Keep 4-5 items max** - More items reduce tap target size and increase cognitive load
2. **Use clear icons** - Icons should be immediately recognizable
3. **Short labels** - Keep labels to 1-2 words for readability
4. **Consistent ordering** - Don't change nav item order across sessions
5. **Active state clarity** - Current page should be immediately obvious

## Future Enhancements

- [ ] Haptic feedback on tap (mobile)
- [ ] Notification badges for other tabs
- [ ] Swipe gestures between tabs
- [ ] Customizable nav items per user preference
- [ ] Dark mode optimization
