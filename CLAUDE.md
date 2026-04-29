# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Refactoring

When refactoring, follow this workflow to keep changes small, reviewable, and verifiable.

**Key principle:** One logical unit per change. Instead of refactoring an entire system at once, decompose it into small steps (extract function, update one caller, update next caller, etc.). Each step is a separate commit and PR.

**Workflow:**
1. **Explore dependencies first** — Use the Explore agent to find all places a piece of code is used. Map the dependency graph before touching anything.
2. **Plan before coding** — Use EnterPlanMode to map the refactor as a sequence of small steps. Define success criteria for each step and how you'll verify it.
3. **Work one step at a time** — For each step: write tests (if missing), make the change, verify tests pass, run the dev server and manually test, commit with a clear message.
4. **Request surgical changes** — Be explicit about scope: "Change only this function," "Keep the API the same," "One file at a time."
5. **Review before each commit** — Read the diff, run tests, run dev server, manually test the feature, verify no regressions.

**Do:**
- ✅ Change one function/component at a time
- ✅ Write tests before changing code (TDD)
- ✅ Verify each change before moving to the next
- ✅ Use explicit constraints when requesting changes
- ✅ Keep commits under 100 lines of net change when possible

**Don't:**
- ❌ Refactor across multiple files at once
- ❌ Defer testing/verification until all changes are done
- ❌ Ask for improvements beyond scope
- ❌ Combine multiple concerns in one commit

**Planning template:**
```
I want to refactor [component/module/system] to [improve clarity/reduce duplication/etc].

Constraints:
- Functionality must not change
- All existing tests must pass before and after
- Changes must be reviewable in small commits
- I need to manually verify each step

Can you:
1. Explore the codebase to understand dependencies
2. Map out the refactor as a sequence of small, logical steps
3. For each step, identify what changes, why it's safe, and how to verify it
4. Propose which step to do first
```

Then work through the plan step-by-step with Claude, doing one change at a time.

## Project-Specific Guidelines

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript check without emitting

# Testing
npm test             # Run all Vitest tests (vitest run)
npm run test:watch   # Watch mode — use this during TDD
npm run test:coverage # Coverage report

# Database (requires local Supabase running)
supabase start       # Start local Supabase (Docker required)
supabase stop        # Stop local Supabase
npm run db:push      # Apply migrations to local DB
npm run db:reset     # Reset DB and re-run all migrations
npm run db:setup     # Reset DB and create admin user in one step
npm run db:generate  # Regenerate TypeScript types from local schema -> src/types/database.types.ts

```

## Environment Variables

`.env.local` is required for local development:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key>
SUPABASE_SERVICE_ROLE_KEY=<local service role key>
```

## Conventions

- Use TDD as described in docs/TDD.md
