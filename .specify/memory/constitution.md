<!--
Sync Impact Report
Version change: 1.0.0 → 1.1.0 (MINOR)
Modified principles:
- Workflow Standards: Added "Stack Decision Recording (SDR)"
Added sections:
- None (minor addition within Workflow Standards)
Removed sections:
- None
Templates requiring updates:
✅ .specify/templates/plan-template.md (Stack decisions must be explicitly recorded and user-approved)
✅ .specify/templates/tasks-template.md (Path conventions note for nested project roots like app/)
⚠ .specify/templates/spec-template.md (no changes required)
⚠ .specify/templates/commands/*.md (no changes required)
Follow-up TODOs:
- None
-->

# Project Constitution

Version: 1.1.0
Ratification Date: 2025-09-22
Last Amended: 2025-09-27

These rules establish universal standards and preferences that apply across all projects developed with Windsurf AI assistance.

## Core Principles

- **Simplicity First (SF):** Always choose the simplest viable solution. Complex patterns or architectures require explicit justification.
- **Readability Priority (RP):** Code must be immediately understandable by both humans and AI during future modifications.
- **Dependency Minimalism (DM):** No new libraries or frameworks without explicit request or compelling justification.
- **Industry Standards Adherence (ISA):** Follow established conventions for the relevant language and tech stack.
- **Strategic Documentation (SD):** Comment only complex logic or critical functions. Avoid documenting the obvious. Write new docs in English. If docs are found in other languages, rewrite them into English.
- **Test-Driven Thinking (TDT):** Design all code to be easily testable from inception.

## Workflow Standards

- **Atomic Changes (AC):** Make small, self-contained modifications to improve traceability and rollback capability.
- **Commit Discipline (CD):** Recommend regular commits with semantic messages using conventional commit format:

  ```
  type(scope): concise description

  [optional body with details]

  [optional footer with breaking changes/issue references]
  ```

  Types: feat, fix, docs, style, refactor, perf, test, chore

- **Transparent Reasoning (TR):** When generating code, explicitly reference which global rules influenced decisions.
- **Context Window Management (CWM):** Be mindful of AI context limitations. Suggest new sessions when necessary.
- **Preserve Existing Code (PEC):** Windsurf must not overwrite or break functional code unless explicitly instructed otherwise. Propose changes conservatively to maintain codebase integrity.
- **Stack Decision Recording (SDR):** All technology stack decisions (runtime, package manager, framework, UI kit, database, ORM, AI provider, major libs) MUST be explicitly confirmed by the user, recorded in `plan.md` Technical Context, and any changes REQUIRE explicit user approval before implementation.

## Code Quality Guarantees

- **DRY Principle (DRY):** No duplicate code. Reuse or extend existing functionality.
- **Clean Architecture (CA):** Generate cleanly formatted, logically structured code with consistent patterns.
- **Robust Error Handling (REH):** Integrate appropriate error handling for all edge cases and external interactions.
- **Code Smell Detection (CSD):** Proactively identify and suggest refactoring for:
  - Functions exceeding 30 lines
  - Files exceeding 300 lines
  - Nested conditionals beyond 2 levels
  - Classes with more than 5 public methods

## Security & Performance Considerations

- **Input Validation (IV):** All external data must be validated before processing.
- **Resource Management (RM):** Close connections and free resources appropriately.
- **Constants Over Magic Values (CMV):** No magic strings or numbers. Use named constants.
- **Security-First Thinking (SFT):** Implement proper authentication, authorization, and data protection.
- **Performance Awareness (PA):** Consider computational complexity and resource usage.

## AI Communication Guidelines

- **Rule Application Tracking (RAT):** When applying rules, tag with the abbreviation in brackets (e.g., [SF], [DRY]).
- **Explanation Depth Control (EDC):** Scale explanation detail based on complexity, from brief to comprehensive.
- **Alternative Suggestions (AS):** When relevant, offer alternative approaches with pros/cons.
- **Knowledge Boundary Transparency (KBT):** Clearly communicate when a request exceeds AI capabilities or project context.

## Continuous Documentation During Development

- **Documentation Maintenance (DM):** Keep all \*.md files up-to-date for tracking progress, todos, and helping information (e.g., TASK_LIST.md, README.md).
- **Memory Generation (MG):** Generate memories for each new or requested markdown file to help track project context and progress.
- **Documentation Updates (DU):** Update markdown files when tasks are added/completed or todos change, excluding files in doc folder.

## Feature-Based Development Workflow

1. **Create Feature Branch:**

   - For each new feature or task, create a dedicated feature branch from master
   - Use descriptive branch names with conventional format: `feature/feature-name` or `task/task-name`

2. **Development Process:**

   - Complete all development work in the feature branch
   - Ensure all tests pass successfully before considering the task complete
   - Follow clean architecture principles and coding standards

3. **Task Completion in Feature Branch:**

   - Mark tasks as completed in `TASK_LIST.md` within the feature branch
   - Commit these changes to the feature branch
   - Complete this before creating the pull request

4. **Pull Request Process:**

   - Create a pull request to the master branch when feature is complete
   - Include the updated `TASK_LIST.md` in the pull request
   - Wait for reviewer acknowledgment before proceeding

5. **Merge Process:**

   - After approval, merge the feature branch into master
   - Delete the feature branch after successful merge

6. **Task Tracking:**
   - The updated `TASK_LIST.md` is already part of the merged changes
   - No additional updates to `TASK_LIST.md` needed after PR approval

## Governance

This constitution serves as the foundational document for project governance and development standards. Changes to this document must follow these procedures:

1. **Amendment Process:**

   - Proposed changes must be submitted via pull request
   - Changes require review and approval from project maintainers
   - Version number must be updated according to semantic versioning rules

2. **Version Control:**

   - MAJOR version for incompatible governance changes
   - MINOR version for new principles/sections
   - PATCH version for clarifications and refinements

3. **Compliance Review:**
   - Regular audits of codebase against these principles
   - Automated checks where possible
   - Documentation of any approved exceptions
