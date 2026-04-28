## TDD Workflow

All changes must follow Red/Green/Refactor:

1. **Red** — Write a failing test that describes the desired behavior. Run it and confirm it fails for the right reason.
2. **Green** — Write the minimum production code needed to make the test pass. No more.
3. **Refactor** — Clean up code while keeping tests green.

**Rules:**
- Never write production code without a failing test first.
- Run `npm run test:watch` during development for tight feedback.
- Tests live colocated with the code they test: `foo.ts` → `foo.test.ts` in the same directory.
- For React components, use `@testing-library/react` — test behavior, not implementation details.
- For pure functions (utils, sorting, validation), use plain `describe`/`it` with `expect`.
- Global mocks for Supabase clients and Next.js router are pre-configured in `src/test/setup.ts`.