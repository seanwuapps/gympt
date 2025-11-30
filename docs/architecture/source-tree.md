# Source Tree

```
/ (project root)
  .bmad-core/
  docs/
    architecture/
      coding-standards.md
      tech-stack.md
      source-tree.md
      frontend-practices.md
    components/
      bottom-nav.md
    prd.md
    prd/
    stories/
    qa/
      assessments/
      gates/
  app/
    assets/
      css/
        main.css              # Global design tokens
        grid.css              # Grid utilities
        accessibility.css     # A11y overrides
    components/
      base/                   # Vanilla UI components
        BaseButton.vue
        BaseCard.vue
        BaseDialog.vue
        BaseSelect.vue
        BaseTabs.vue
        BaseTabList.vue
        BaseTab.vue
        BaseMessage.vue
        BasePageMessages.vue
        BaseBadge.vue
        BaseDivider.vue
        BaseProgressSpinner.vue
      display/                # Read-only display components
        DetailsList.vue
        FieldRow.vue
      form/                   # Form input components
        CheckboxCard.vue
        CheckboxGroup.vue
        CheckboxButtonGroup.vue
        ChipGroup.vue
        RadioGroup.vue
      layout/                 # Layout components
        BottomNav.vue
      onboarding/             # Onboarding step components
        OnboardingStep1.vue
        OnboardingStep2.vue
        OnboardingStep3.vue
        OnboardingStep4.vue
      plans/                  # Training plan components
        PlanGenerator.vue
        PlanCard.vue
        PlanWeekView.vue
        PlanWeekViewCards.vue
      profile/                # Profile components
        ProfileEditForm.vue
        ProfileFormGoals.vue
        ProfileFormHealthSafety.vue
        ProfileFormTrainingPreferences.vue
    composables/
      useToast.ts             # Toast notification composable
    layouts/
      default.vue
    pages/
      index.vue               # Home page
      login.vue
      confirm.vue             # Auth callback
      onboarding.vue
      progress.vue
      plans/
        index.vue             # Active plan view
        library.vue           # Plan library
      profile/
        index.vue             # Profile view
        edit.vue              # Profile edit
      session/
        index.vue             # Active session runner
        preview.vue           # Session preview with exercise swap
    stores/
      plans.ts                # Plans Pinia store
      session.ts              # Session Pinia store
      profile.store.ts        # Profile Pinia store
      onboarding.ts           # Onboarding Pinia store
    app.vue
  db/
    schema/
      index.ts
      profiles.ts
      training-plans.ts
      sessions.ts
    migrations/
  server/
    api/
      profile.get.ts
      profile.post.ts
      plans/                  # Plan endpoints
        generate.post.ts
        [id].patch.ts
        [id]/suggest-day.post.ts
      ai/
        session.generate.post.ts
      sessions/
        index.get.ts
        index.post.ts
        [id]/
          swap-exercise.post.ts
      adapt/
        next-session.post.ts
    shared/
      schemas/                # Zod schemas
      prompts/                # AI prompt templates
    utils/
      ai.ts                   # AI client utilities
```
