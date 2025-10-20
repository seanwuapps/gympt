# Story: Complete PrimeVue Migration Cleanup - Brownfield Addition

## User Story

As a **developer**,
I want to **complete the final cleanup of the PrimeVue migration by removing all Element Plus dependencies**,
So that **the application has a smaller bundle size, no unused dependencies, and a clean codebase ready for new feature development**.

## Story Context

**Existing System Integration:**

- Integrates with: Existing Nuxt 4 application with PrimeVue already configured and working
- Technology: Nuxt 4, PrimeVue 4.4.1, pnpm package manager
- Follows pattern: All pages already migrated to PrimeVue components
- Touch points: package.json, pnpm-lock.yaml, documentation files

**Current State:**
- ✅ All Vue pages migrated to PrimeVue (login, index, confirm, onboarding, profile)
- ✅ PrimeVue configured with custom "Energy Boost Dark" theme
- ✅ No Element Plus imports found in codebase
- ✅ nuxt.config.ts already cleaned (no Element Plus references)
- ⚠️ Element Plus packages still in package.json (not removed yet)
- ⚠️ Documentation not updated to reflect PrimeVue

**Target State:**
- Element Plus packages completely removed from package.json
- pnpm lockfile updated
- Documentation updated (tech-stack.md, frontend-practices.md)
- Bundle size verified to be reduced
- All pages tested to ensure no regressions

## Acceptance Criteria

### Functional Requirements

1. **All pages continue to work correctly after cleanup**
   - Login page: Google OAuth and email OTP work
   - Index page: User info displays, navigation works
   - Onboarding: 3-step wizard completes successfully
   - Profile: View and edit modes work
   - Confirm: Auth callback redirects properly

2. **No console errors or warnings**
   - No missing dependency errors
   - No TypeScript errors
   - No runtime errors in browser console

3. **Application builds successfully**
   - `pnpm build` completes without errors
   - `pnpm dev` starts without warnings
   - No peer dependency warnings

### Integration Requirements

4. **Existing PrimeVue functionality continues to work unchanged**
   - All PrimeVue components render correctly
   - Theme (Energy Boost Dark) applies properly
   - Toast notifications work
   - Form components are reactive

5. **Package management follows existing pattern**
   - Uses pnpm (not npm or yarn)
   - Lockfile updated via `pnpm install`
   - No breaking changes to other dependencies

6. **Documentation maintains current structure**
   - Updates follow existing markdown format
   - Tech stack documented in docs/architecture/tech-stack.md
   - Frontend practices in docs/architecture/frontend-practices.md

### Quality Requirements

7. **Change is covered by appropriate tests**
   - Manual testing: All pages tested on desktop
   - Manual testing: All pages tested on mobile viewport
   - Verification: No console errors
   - Verification: Bundle size reduction confirmed

8. **Documentation is updated**
   - tech-stack.md reflects PrimeVue (not Element Plus)
   - frontend-practices.md updated with PrimeVue patterns if needed
   - Migration noted in story completion log

9. **No regression in existing functionality verified**
   - All auth flows work (Google OAuth, email OTP, sign out)
   - All navigation works
   - All forms submit correctly
   - All notifications display

## Technical Implementation

### Package Removal

**Packages to Remove:**
```bash
pnpm remove @element-plus/nuxt element-plus @element-plus/icons-vue dayjs
```

**Verification:**
- Check package.json - no Element Plus packages listed
- Run `pnpm install` to update lockfile
- Run `pnpm dev` to verify app starts
- Run `pnpm build` to verify production build works

### Documentation Updates

**File: `docs/architecture/tech-stack.md`**

Update UI framework section:
- Remove: Element Plus references
- Add: PrimeVue 4.4.1 with custom Energy Boost Dark theme
- Add: PrimeIcons for iconography

**File: `docs/architecture/frontend-practices.md` (if exists)**

Update component patterns:
- Remove: Element Plus component examples
- Add: PrimeVue component patterns (Button, Card, InputText, Dropdown, etc.)
- Add: Toast notification pattern using `useToast()`
- Add: Form validation patterns with PrimeVue

### Bundle Size Verification

**Before Cleanup (Expected):**
- Element Plus: ~300KB
- dayjs: ~20KB
- Total overhead: ~320KB

**After Cleanup (Expected):**
- PrimeVue: ~200KB
- Net reduction: ~120KB

**Verification Command:**
```bash
pnpm build
# Check .nuxt/dist/client for bundle sizes
```

## Tasks

- [ ] **Package Cleanup**
  - [ ] Run `pnpm remove @element-plus/nuxt element-plus @element-plus/icons-vue dayjs`
  - [ ] Run `pnpm install` to update lockfile
  - [ ] Verify package.json has no Element Plus packages
  - [ ] Verify pnpm-lock.yaml updated

- [ ] **Build Verification**
  - [ ] Run `pnpm dev` and verify app starts without errors
  - [ ] Run `pnpm build` and verify production build succeeds
  - [ ] Check for any peer dependency warnings
  - [ ] Verify no TypeScript errors (`pnpm type-check` if available)

- [ ] **Functional Testing**
  - [ ] Test login page (Google OAuth + email OTP)
  - [ ] Test index page (user display, navigation, sign out)
  - [ ] Test onboarding wizard (all 3 steps, navigation, submission)
  - [ ] Test profile page (view mode, edit mode, save/cancel)
  - [ ] Test confirm page (auth callback redirect)
  - [ ] Test on mobile viewport (responsive design)

- [ ] **Documentation Updates**
  - [ ] Update `docs/architecture/tech-stack.md`
    - [ ] Replace Element Plus with PrimeVue 4.4.1
    - [ ] Document custom Energy Boost Dark theme
    - [ ] Document PrimeIcons usage
  - [ ] Check if `docs/architecture/frontend-practices.md` exists
    - [ ] If exists, update with PrimeVue patterns
    - [ ] If not, create basic frontend practices doc
  - [ ] Update migration story with completion notes

- [ ] **Bundle Size Analysis**
  - [ ] Run production build
  - [ ] Check bundle sizes in build output
  - [ ] Document bundle size reduction
  - [ ] Verify ~100KB+ reduction achieved

## Definition of Done

- [ ] Element Plus packages completely removed from package.json
- [ ] pnpm lockfile updated (no Element Plus references)
- [ ] Application builds successfully (`pnpm build` passes)
- [ ] All pages tested and working (login, index, onboarding, profile, confirm)
- [ ] No console errors or TypeScript errors
- [ ] Documentation updated (tech-stack.md at minimum)
- [ ] Bundle size reduction verified (~100KB+)
- [ ] Mobile responsiveness verified
- [ ] Story completion notes added to migrate-to-primevue.md

## Risk and Compatibility Check

**Primary Risk:** Accidentally removing a package that PrimeVue depends on

**Mitigation:**
- Only remove Element Plus specific packages
- dayjs is safe to remove (only used by Element Plus, not by PrimeVue)
- Test thoroughly after removal
- Git commit before removal for easy rollback

**Rollback:**
```bash
# If issues occur, rollback is simple:
git checkout package.json pnpm-lock.yaml
pnpm install
```

**Compatibility Verification:**

- [x] No breaking changes to existing APIs (only removing unused packages)
- [x] Database changes: None (frontend only)
- [x] UI changes: None (already migrated)
- [x] Performance impact: Positive (smaller bundle)

## Dev Notes

**Integration Approach:**
- This is pure cleanup work - no code changes needed
- All migration work already complete
- Just removing unused dependencies and updating docs

**Existing Pattern Reference:**
- Package management: Use pnpm (project standard)
- Documentation: Follow existing markdown structure in docs/architecture/

**Key Constraints:**
- Must not break existing functionality
- Must verify bundle size reduction
- Must update documentation for future developers

**Estimated Effort:** 1-2 hours

**Priority:** High (blocks new feature development with clean foundation)

## Success Criteria

The cleanup is successful when:

1. ✅ Element Plus packages removed from package.json
2. ✅ Application builds and runs without errors
3. ✅ All pages tested and working correctly
4. ✅ Documentation updated to reflect PrimeVue
5. ✅ Bundle size reduction verified
6. ✅ No console errors or warnings
7. ✅ Ready to start new feature development

---

**Story Status:** Ready for Implementation
**Estimated Effort:** 1-2 hours
**Priority:** High (cleanup before new features)
**Dependencies:** PrimeVue migration (complete)
