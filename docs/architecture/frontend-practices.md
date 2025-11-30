# Front-End Practices

## State Management

### Pinia Store for Shared State

- **Use Pinia stores** for data that needs to be shared across multiple components
- Avoid prop drilling through multiple component layers
- Store should be the single source of truth for shared application state

**When to use Pinia:**

- User session data accessed by multiple components
- Global UI state (modals, notifications, theme)
- Cached API responses shared across views
- Complex form state spanning multiple components
- Real-time data that multiple components need to react to

**When NOT to use Pinia:**

- Component-local state (use `ref`/`reactive`)
- Simple parent-child communication (use props/events)
- Data used in only one component tree

### Example Pattern

```typescript
// stores/profile.ts
import { defineStore } from 'pinia'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<Profile | null>(null)
  const loading = ref(false)

  async function fetchProfile() {
    loading.value = true
    try {
      profile.value = await $fetch('/api/profile')
    } finally {
      loading.value = false
    }
  }

  return { profile, loading, fetchProfile }
})
```

```vue
<!-- Any component can access -->
<script setup>
const profileStore = useProfileStore()
</script>

<template>
  <div v-if="profileStore.profile">
    {{ profileStore.profile.experienceLevel }}
  </div>
</template>
```

## Component Communication

### Props Down, Events Up

- Parent → Child: Use props
- Child → Parent: Emit events
- Sibling → Sibling: Use Pinia store or parent coordination

### v-model Pattern

- Use `v-model` for two-way binding with proper emit
- For complex objects, emit entire updated object
- Avoid mutating props directly

**Correct v-model implementation:**

```vue
<script setup>
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <input v-model="localValue" />
</template>
```

## Composables

### Reusable Logic

- Extract reusable logic into composables (`use*` pattern)
- Composables can access Pinia stores
- Keep composables focused and single-purpose

### Example

```typescript
// composables/useProfile.ts
export function useProfile() {
  const profileStore = useProfileStore()

  async function saveProfile(data: ProfileFormData) {
    await $fetch('/api/profile', {
      method: 'POST',
      body: data,
    })
    await profileStore.fetchProfile()
  }

  return { saveProfile }
}
```

## Performance

### Computed Properties

- Use `computed()` for derived state
- Computed values are cached and only recalculate when dependencies change
- Prefer computed over methods for template expressions

### Lazy Loading

- Use dynamic imports for route components
- Lazy load heavy components not immediately visible
- Code-split by route for optimal bundle sizes

## Component Reusability

### Extract Repeated Patterns

- **Identify repeated UI patterns** across pages and components
- **Create shared components** for patterns used 2+ times
- **Prioritize reusability** - easier to update in one place
- **Use generic naming** - avoid page-specific names for shared components

### When to Extract a Component

**Extract if:**

- Pattern appears 2+ times in codebase
- Pattern has consistent structure/behavior
- Pattern will likely be used in future features
- Updating the pattern requires changes in multiple places

**Don't extract if:**

- Pattern appears only once
- Pattern is highly page-specific
- Extraction adds unnecessary complexity
- Pattern is likely to diverge in different contexts

### Shared Component Patterns

#### Display Components

For read-only data display patterns:

```vue
<!-- components/display/FieldRow.vue -->
<template>
  <div class="field-row">
    <label class="field-label">{{ label }}</label>
    <div class="field-value">
      <slot>{{ value }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value?: string | number
}>()
</script>
```

**Usage:**

```vue
<FieldRow label="Experience Level" :value="profile.experienceLevel" />
<FieldRow label="Goals">
  <span class="custom-formatting">{{ formatGoals(profile.goals) }}</span>
</FieldRow>
```

#### Form Components

For input patterns with consistent styling:

```vue
<!-- components/form/FormField.vue -->
<template>
  <div class="form-field">
    <label class="field-label">{{ label }}</label>
    <slot />
    <small v-if="hint" class="field-hint">{{ hint }}</small>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  hint?: string
}>()
</script>
```

### Component Organization

```
components/
├── display/          # Read-only display components
│   ├── FieldRow.vue
│   ├── StatCard.vue
│   └── DataList.vue
├── form/             # Form input components
│   ├── FormField.vue
│   ├── ChipGroup.vue
│   └── RadioGroup.vue
├── layout/           # Layout components
│   ├── PageHeader.vue
│   └── Section.vue
└── [feature]/        # Feature-specific components
    └── SessionRunner.vue
```

### Refactoring Guidelines

1. **Identify the pattern** - Look for repeated markup/logic
2. **Extract to component** - Create in appropriate directory
3. **Add TypeScript types** - Props and emits interfaces
4. **Add slots for flexibility** - Allow customization where needed
5. **Update all usages** - Replace old pattern with new component
6. **Test thoroughly** - Ensure all instances work correctly

### Example Refactor

**Before:**

```vue
<!-- Repeated in multiple places -->
<div class="profile-field">
  <label>Experience Level</label>
  <div class="field-value">{{ profile.experienceLevel }}</div>
</div>
<Divider />
```

**After:**

```vue
<!-- components/display/FieldRow.vue created -->
<FieldRow label="Experience Level" :value="profile.experienceLevel" />
<Divider />
```

**Benefits:**

- ✅ Update styling in one place
- ✅ Consistent appearance across app
- ✅ Easier to add features (icons, tooltips, etc.)
- ✅ Reduced code duplication

## Styling Standards

### CSS Units and Values

**CRITICAL RULES:**

- ❌ **NO magic numbers** - Never use hardcoded numeric values without context
- ❌ **NO `px` units** - Always use `rem` for scalability and accessibility
- ❌ **NO arbitrary colors** - Only use design token variables

### Design Tokens

All spacing, sizing, and colors MUST use global CSS variables (design tokens):

**Spacing:**

```css
/* ❌ WRONG - Magic numbers and px */
.component {
  padding: 16px;
  margin: 24px;
  gap: 8px;
}

/* ✅ CORRECT - Design tokens with rem */
.component {
  padding: 1rem; /* Base spacing unit */
  margin: 1.5rem; /* 1.5x base unit */
  gap: 0.5rem; /* 0.5x base unit */
}
```

**Colors:**

```css
/* ❌ WRONG - Arbitrary color values */
.component {
  background: #1a1a1a;
  color: #ffffff;
  border: 1px solid #333333;
}

/* ✅ CORRECT - CSS custom properties */
.component {
  background: var(--surface-900);
  color: var(--text-color);
  border: 1px solid var(--surface-border);
}
```

**Sizing:**

```css
/* ❌ WRONG - Hardcoded px values */
.button {
  font-size: 14px;
  height: 40px;
  border-radius: 4px;
}

/* ✅ CORRECT - Relative units and tokens */
.button {
  font-size: 0.875rem;
  height: 2.5rem;
  border-radius: var(--border-radius);
}
```

### Available Design Tokens

**Custom Project Tokens (defined in `assets/css/main.css`):**

- `--primary-color` - Primary brand color
- `--text-color` - Primary text color
- `--surface-border` - Border colors
- `--border-radius` - Standard border radius

**Custom Project Tokens:**
Define project-specific tokens in `assets/css/main.css`:

```css
:root {
  --spacing-xs: 0.25rem; /* 4px */
  --spacing-sm: 0.5rem; /* 8px */
  --spacing-md: 1rem; /* 16px */
  --spacing-lg: 1.5rem; /* 24px */
  --spacing-xl: 2rem; /* 32px */

  --font-size-xs: 0.75rem; /* 12px */
  --font-size-sm: 0.875rem; /* 14px */
  --font-size-md: 1rem; /* 16px */
  --font-size-lg: 1.125rem; /* 18px */
  --font-size-xl: 1.25rem; /* 20px */
}
```

### When to Create New Tokens

**Create a new token when:**

- Value is used 2+ times across components
- Value represents a semantic concept (e.g., "card-padding")
- Value needs to be consistent across the app
- Value might need theme-specific variations

**Example:**

```css
/* In main.css */
:root {
  --card-padding: 1rem;
  --card-gap: 0.75rem;
  --input-height: 2.5rem;
}

/* In component */
.custom-card {
  padding: var(--card-padding);
  gap: var(--card-gap);
}
```

### Rem Conversion Reference

Base font size: 16px (browser default)

| rem  | px  |
| ---- | --- |
| 0.25 | 4   |
| 0.5  | 8   |
| 0.75 | 12  |
| 1    | 16  |
| 1.25 | 20  |
| 1.5  | 24  |
| 2    | 32  |
| 3    | 48  |

### Enforcement

**Code Review Checklist:**

- [ ] No hardcoded pixel values
- [ ] No magic numbers without token variables
- [ ] No arbitrary color hex codes
- [ ] All spacing uses rem units
- [ ] All colors use design tokens

## Best Practices

1. **Single Responsibility** - Each component should do one thing well
2. **Composition over Inheritance** - Use composables to share logic
3. **Type Safety** - Define TypeScript interfaces for all props and emits
4. **Reactive Patterns** - Use Vue's reactivity system, don't fight it
5. **Avoid Deep Nesting** - Keep component trees shallow when possible
6. **Test Boundaries** - Components should be testable in isolation
7. **Reusability First** - Extract repeated patterns into shared components
8. **Flexible Components** - Use slots for customization points
9. **Design Tokens Only** - Use CSS variables for all values, no magic numbers
10. **Rem Units Always** - Use rem for scalability, never px
