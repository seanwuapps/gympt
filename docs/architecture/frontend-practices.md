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
      body: data
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

## Best Practices

1. **Single Responsibility** - Each component should do one thing well
2. **Composition over Inheritance** - Use composables to share logic
3. **Type Safety** - Define TypeScript interfaces for all props and emits
4. **Reactive Patterns** - Use Vue's reactivity system, don't fight it
5. **Avoid Deep Nesting** - Keep component trees shallow when possible
6. **Test Boundaries** - Components should be testable in isolation
7. **Reusability First** - Extract repeated patterns into shared components
8. **Flexible Components** - Use slots for customization points
