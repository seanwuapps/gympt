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
    components/
      display/                # Read-only display components
      form/                   # Form input components
        CheckboxCard.vue
        FormChipGroup.vue
      layout/                 # Layout components
        BottomNav.vue
      plans/                  # Training plan components
        PlanGenerator.vue
        PlanCard.vue
        PlanWeekView.vue
      session/                # Session runner components
      feedback/               # Feedback components
    composables/
      useProfile.ts
    layouts/
      default.vue
    pages/
      index.vue               # Home page
      login.vue
      onboarding.vue
      profile.vue
      plans/
        index.vue             # Plan management page
      sessions/
      reports/
    stores/
      plans.ts                # Plans Pinia store
    app.vue
  db/
    schema/
      index.ts
      profiles.ts
      training-plans.ts       # Training plans schema (to be created)
    migrations/
  server/
    api/
      plans/                  # Plan generation & management endpoints
      ai/
        session.generate.post.ts
        exercise.substitute.post.ts
      adapt/
        next-session.post.ts
```
