# Story: Migrate UI from Element Plus to PrimeVue

## User Story

As a **developer**,
I want to **migrate the UI from Element Plus to PrimeVue**,
So that **we have a more modern, lighter, and better-maintained UI component library with superior mobile support and TypeScript integration**.

## Story Context

**Current State:**
- Using Element Plus (`@element-plus/nuxt`, `element-plus`, `@element-plus/icons-vue`)
- 147 Element Plus component instances across 7 files
- Experiencing reactivity issues with complex form patterns
- Bundle size: ~300KB for Element Plus
- dayjs dependency only needed by Element Plus

**Target State:**
- PrimeVue as the UI component library
- Smaller bundle size (~200KB)
- Better mobile support and touch interactions
- Improved TypeScript support
- Modern component API with Composition API
- Better documentation and global community support

**Motivation:**
- Element Plus had reactivity issues with v-model on complex forms
- PrimeVue has better Nuxt 4 integration
- PrimeVue offers better mobile-first design
- PrimeVue has more comprehensive component set
- Better long-term maintenance and updates

**Reference:**
- Current implementation uses Element Plus throughout
- Pinia store already implemented for state management
- All forms use Pinia store pattern (no prop drilling)

## Acceptance Criteria

### Functional Requirements

1. **All Element Plus components replaced with PrimeVue equivalents**
   - Buttons → PrimeVue Button
   - Cards → PrimeVue Card
   - Forms → Native forms with PrimeVue inputs
   - Inputs → PrimeVue InputText, Textarea
   - Radio buttons → PrimeVue RadioButton
   - Checkboxes → PrimeVue Checkbox
   - Select dropdowns → PrimeVue Dropdown
   - Steps indicator → PrimeVue Steps
   - Notifications → PrimeVue Toast (useToast composable)
   - Icons → PrimeVue icons or PrimeIcons

2. **Onboarding flow maintains all functionality**
   - 3-step wizard works correctly
   - Progress indicator shows current step
   - Form validation works (Step 1 required fields)
   - Navigation (Back/Next/Complete) works
   - localStorage progress saving works
   - Success/error notifications display
   - All form inputs are reactive and update correctly

3. **Profile page maintains all functionality**
   - View mode displays all profile data
   - Edit mode allows changing all fields
   - Save/Cancel buttons work correctly
   - Form validation works
   - Success/error notifications display
   - All form inputs are reactive

4. **Login and other pages maintain functionality**
   - All buttons work
   - All layouts render correctly
   - Navigation works

5. **Mobile responsiveness maintained or improved**
   - Touch interactions work smoothly
   - Forms are usable on mobile devices
   - Buttons have adequate tap targets
   - Layout adapts to screen size

### Integration Requirements

6. **PrimeVue properly configured**
   - `@primevue/nuxt-module` installed and configured
   - Theme selected and applied
   - Icons configured (PrimeIcons or custom)
   - Toast service configured globally
   - TypeScript types available

7. **Element Plus completely removed**
   - `@element-plus/nuxt` removed from nuxt.config.ts
   - `element-plus` package uninstalled
   - `@element-plus/icons-vue` package uninstalled
   - `dayjs` package uninstalled (if only used by Element Plus)
   - No Element Plus imports remain in code
   - Element Plus plugin file removed

8. **Styling consistent across application**
   - PrimeVue theme applied consistently
   - Custom styles migrated to PrimeVue patterns
   - CSS variables used for theming
   - Mobile-first responsive design maintained

### Quality Requirements

9. **No regressions in functionality**
   - All existing features work as before
   - Form submissions work correctly
   - Validation works correctly
   - Navigation works correctly
   - Notifications work correctly

10. **Code quality maintained**
    - TypeScript types properly defined
    - No TypeScript errors
    - No console errors or warnings
    - Code follows existing patterns
    - Components remain testable

11. **Performance improved or maintained**
    - Bundle size reduced (target: ~100KB reduction)
    - Page load time maintained or improved
    - Form interactions feel responsive
    - No performance regressions

12. **Documentation updated**
    - Update tech-stack.md to reflect PrimeVue
    - Update frontend-practices.md if needed
    - Add PrimeVue configuration notes
    - Document theme customization approach

## Technical Implementation

### Package Changes

**Remove:**
```json
"@element-plus/icons-vue": "^2.3.2",
"@element-plus/nuxt": "^1.1.4",
"element-plus": "^2.11.4",
"dayjs": "^1.11.18"
```

**Add:**
```json
"primevue": "^4.2.0",
"@primevue/nuxt-module": "^0.2.0",
"primeicons": "^7.0.0"
```

### Configuration

**File:** `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  modules: [
    "@nuxtjs/supabase",
    "@nuxt/fonts",
    "@primevue/nuxt-module",
    "@pinia/nuxt"
  ],
  primevue: {
    options: {
      theme: {
        preset: 'Aura', // or 'Lara', 'Material', etc.
      },
      ripple: true,
    },
    components: {
      include: '*', // Auto-import all components
    },
    directives: {
      include: ['Tooltip', 'Ripple'],
    },
  },
  css: [
    'primeicons/primeicons.css',
    '~/assets/css/main.css'
  ],
})
```

### Component Migration Map

#### Onboarding Page (`app/pages/onboarding.vue`)

**Before (Element Plus):**
```vue
<el-card>
  <el-steps :active="currentStep">
    <el-step title="Basics" />
  </el-steps>
  <el-button @click="handleNext">Next</el-button>
</el-card>

<script>
import { ElNotification } from 'element-plus'
ElNotification({ title: 'Success', type: 'success' })
</script>
```

**After (PrimeVue):**
```vue
<Card>
  <template #header>
    <Steps :model="stepItems" :activeStep="currentStep" />
  </template>
  <template #content>
    <!-- Step content -->
  </template>
  <template #footer>
    <Button label="Next" @click="handleNext" />
  </template>
</Card>

<script setup>
const toast = useToast()
toast.add({ 
  severity: 'success', 
  summary: 'Success', 
  life: 3000 
})
</script>
```

#### Step 1 Component (`app/components/onboarding/OnboardingStep1.vue`)

**Before (Element Plus):**
```vue
<el-form>
  <el-form-item label="Experience Level">
    <el-radio-group v-model="experienceLevel">
      <el-radio value="beginner" border>Beginner</el-radio>
    </el-radio-group>
  </el-form-item>
  
  <el-form-item label="Training Days">
    <el-checkbox-group v-model="preferredDays">
      <el-checkbox-button value="Mon">M</el-checkbox-button>
    </el-checkbox-group>
  </el-form-item>
</el-form>
```

**After (PrimeVue):**
```vue
<form>
  <div class="field">
    <label>Experience Level</label>
    <div class="flex flex-column gap-2">
      <div class="flex align-items-center">
        <RadioButton 
          v-model="experienceLevel" 
          inputId="beginner" 
          value="beginner" 
        />
        <label for="beginner" class="ml-2">Beginner</label>
      </div>
    </div>
  </div>
  
  <div class="field">
    <label>Training Days</label>
    <div class="flex gap-2">
      <Checkbox 
        v-model="preferredDays" 
        inputId="mon" 
        value="Mon" 
      />
      <label for="mon">M</label>
    </div>
  </div>
</form>
```

#### Step 2 Component (`app/components/onboarding/OnboardingStep2.vue`)

**Before (Element Plus):**
```vue
<el-input 
  v-model="goals" 
  type="textarea" 
  :rows="3" 
  :maxlength="500"
  show-word-limit
/>

<el-select v-model="aggressiveness">
  <el-option value="moderate" label="Moderate" />
</el-select>
```

**After (PrimeVue):**
```vue
<Textarea 
  v-model="goals" 
  :rows="3" 
  :maxlength="500"
  placeholder="Enter your goals..."
/>
<small>{{ goals.length }}/500</small>

<Dropdown 
  v-model="aggressiveness" 
  :options="aggressivenessOptions"
  optionLabel="label"
  optionValue="value"
  placeholder="Select pace"
/>
```

#### Step 3 Component (`app/components/onboarding/OnboardingStep3.vue`)

**Before (Element Plus):**
```vue
<el-input 
  v-model="injuryFlags" 
  type="textarea"
>
  <template #prepend>
    <el-icon><WarningFilled /></el-icon>
  </template>
</el-input>
```

**After (PrimeVue):**
```vue
<div class="p-inputgroup">
  <span class="p-inputgroup-addon">
    <i class="pi pi-exclamation-triangle"></i>
  </span>
  <Textarea 
    v-model="injuryFlags" 
    :rows="3"
    placeholder="Any injuries or limitations..."
  />
</div>
```

#### Profile Page (`app/pages/profile.vue`)

**Before (Element Plus):**
```vue
<el-form :model="editForm">
  <el-form-item label="Goals">
    <el-input v-model="editForm.goals" />
  </el-form-item>
  <el-button @click="saveChanges">Save</el-button>
</el-form>
```

**After (PrimeVue):**
```vue
<form>
  <div class="field">
    <label for="goals">Goals</label>
    <InputText id="goals" v-model="editForm.goals" />
  </div>
  <Button label="Save" @click="saveChanges" />
</form>
```

### Toast Service Setup

**File:** `app/app.vue` or layout

```vue
<template>
  <div>
    <Toast />
    <NuxtPage />
  </div>
</template>
```

**Usage in components:**
```typescript
const toast = useToast()

// Success
toast.add({
  severity: 'success',
  summary: 'Profile Created!',
  detail: 'Your training profile has been saved successfully.',
  life: 3000
})

// Error
toast.add({
  severity: 'error',
  summary: 'Error',
  detail: error.message || 'Failed to save profile.',
  life: 5000
})
```

### Theme Customization (Optional)

**File:** `assets/css/main.css`

```css
/* Override PrimeVue theme variables */
:root {
  --primary-color: #your-brand-color;
  --surface-ground: #f8f9fa;
  --text-color: #333333;
  /* Add more customizations */
}
```

## Tasks

- [ ] **Setup & Configuration**
  - [ ] Install PrimeVue packages (`primevue`, `@primevue/nuxt-module`, `primeicons`)
  - [ ] Configure `@primevue/nuxt-module` in `nuxt.config.ts`
  - [ ] Select and configure PrimeVue theme (Aura recommended)
  - [ ] Add Toast component to app layout
  - [ ] Test PrimeVue is working (create test button)

- [ ] **Onboarding Flow Migration**
  - [ ] Migrate `app/pages/onboarding.vue`
    - [ ] Replace `el-card` with `Card`
    - [ ] Replace `el-steps` with `Steps`
    - [ ] Replace `el-button` with `Button`
    - [ ] Replace `ElNotification` with `useToast()`
  - [ ] Migrate `app/components/onboarding/OnboardingStep1.vue`
    - [ ] Replace `el-form` with native `<form>`
    - [ ] Replace `el-radio-group` and `el-radio` with `RadioButton`
    - [ ] Replace `el-checkbox-group` and `el-checkbox-button` with `Checkbox`
    - [ ] Update styling to match PrimeVue patterns
  - [ ] Migrate `app/components/onboarding/OnboardingStep2.vue`
    - [ ] Replace `el-input` (textarea) with `Textarea`
    - [ ] Replace `el-select` with `Dropdown`
    - [ ] Implement character counter for textarea
    - [ ] Update styling
  - [ ] Migrate `app/components/onboarding/OnboardingStep3.vue`
    - [ ] Replace `el-input` (textarea) with `Textarea`
    - [ ] Replace `el-icon` with PrimeIcons
    - [ ] Update styling
  - [ ] Test complete onboarding flow
    - [ ] Test step navigation (Next/Back)
    - [ ] Test form validation
    - [ ] Test localStorage persistence
    - [ ] Test profile creation
    - [ ] Test notifications
    - [ ] Test on mobile device/emulator

- [ ] **Profile Page Migration**
  - [ ] Migrate `app/pages/profile.vue`
    - [ ] Replace all `el-form` with native `<form>`
    - [ ] Replace all `el-input` with `InputText` or `Textarea`
    - [ ] Replace all `el-select` with `Dropdown`
    - [ ] Replace all `el-checkbox` with `Checkbox`
    - [ ] Replace all `el-button` with `Button`
    - [ ] Replace all `el-card` with `Card`
    - [ ] Replace `ElNotification` with `useToast()`
    - [ ] Update styling
  - [ ] Test profile page
    - [ ] Test view mode
    - [ ] Test edit mode
    - [ ] Test save functionality
    - [ ] Test cancel functionality
    - [ ] Test validation
    - [ ] Test notifications

- [ ] **Other Pages Migration**
  - [ ] Migrate `app/pages/login.vue`
    - [ ] Replace Element Plus components
    - [ ] Test login flow
  - [ ] Migrate `app/pages/index.vue`
    - [ ] Replace Element Plus components
    - [ ] Test home page
  - [ ] Migrate `app/pages/confirm.vue` (if using Element Plus)
    - [ ] Replace Element Plus components
    - [ ] Test confirmation flow

- [ ] **Cleanup**
  - [ ] Remove all Element Plus imports from components
  - [ ] Remove `@element-plus/nuxt` from `nuxt.config.ts`
  - [ ] Remove Element Plus plugin file if exists
  - [ ] Uninstall Element Plus packages
    - [ ] `pnpm remove @element-plus/nuxt element-plus @element-plus/icons-vue`
    - [ ] `pnpm remove dayjs` (if only used by Element Plus)
  - [ ] Remove Element Plus CSS imports
  - [ ] Clean up unused CSS classes
  - [ ] Run `pnpm install` to update lockfile

- [ ] **Testing & Validation**
  - [ ] Test all pages on desktop
  - [ ] Test all pages on mobile/tablet
  - [ ] Test all forms and inputs
  - [ ] Test all notifications
  - [ ] Test all navigation flows
  - [ ] Verify no console errors
  - [ ] Verify no TypeScript errors
  - [ ] Check bundle size reduction

- [ ] **Documentation**
  - [ ] Update `docs/architecture/tech-stack.md`
    - [ ] Replace Element Plus with PrimeVue
    - [ ] Document PrimeVue version and theme
  - [ ] Update `docs/architecture/frontend-practices.md` if needed
    - [ ] Add PrimeVue-specific patterns
    - [ ] Document Toast usage pattern
  - [ ] Add migration notes to changelog

## Definition of Done

- [ ] All Element Plus components replaced with PrimeVue equivalents
- [ ] All pages render correctly with PrimeVue
- [ ] All forms work correctly (validation, submission, reactivity)
- [ ] All notifications work correctly (success, error, info)
- [ ] Mobile responsiveness maintained or improved
- [ ] Element Plus packages completely removed
- [ ] No Element Plus imports remain in codebase
- [ ] No console errors or TypeScript errors
- [ ] Bundle size reduced by ~100KB or more
- [ ] All functionality tested on desktop and mobile
- [ ] Documentation updated
- [ ] Code committed and pushed

## Risk and Compatibility Check

**Primary Risk:** Breaking existing functionality during migration

**Mitigation:**
- Migrate one page/component at a time
- Test thoroughly after each migration
- Keep Element Plus installed until all components migrated
- Can run both libraries temporarily during migration
- Use git branches for safe rollback

**Secondary Risk:** PrimeVue API differences causing unexpected behavior

**Mitigation:**
- Review PrimeVue documentation for each component
- Test edge cases (validation, empty states, error states)
- Pay special attention to v-model bindings
- Test form submissions thoroughly

**Compatibility:**
- PrimeVue fully compatible with Nuxt 4
- PrimeVue fully compatible with Vue 3 Composition API
- PrimeVue fully compatible with TypeScript
- PrimeVue fully compatible with Pinia
- No conflicts with existing dependencies

## Notes

**Why PrimeVue?**
- Better Nuxt 4 integration than Element Plus
- Smaller bundle size (~100KB reduction)
- Better mobile support and touch interactions
- More comprehensive component library
- Better TypeScript support
- Active development and maintenance
- Better documentation
- Global community support

**Migration Strategy:**
1. Install PrimeVue alongside Element Plus
2. Migrate onboarding flow first (current pain point)
3. Test thoroughly
4. Migrate profile page
5. Migrate remaining pages
6. Remove Element Plus
7. Test entire application
8. Update documentation

**Estimated Effort:** 6-8 hours

**Priority:** Medium (improves developer experience and bundle size, but not blocking features)

---

**Story Status:** Draft
**Estimated Effort:** 6-8 hours
**Priority:** Medium
**Dependencies:** Pinia store implementation (complete)
