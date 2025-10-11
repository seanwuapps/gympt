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

## Best Practices

1. **Single Responsibility** - Each component should do one thing well
2. **Composition over Inheritance** - Use composables to share logic
3. **Type Safety** - Define TypeScript interfaces for all props and emits
4. **Reactive Patterns** - Use Vue's reactivity system, don't fight it
5. **Avoid Deep Nesting** - Keep component trees shallow when possible
6. **Test Boundaries** - Components should be testable in isolation
