# C-007 Evaluation Prep (codex-gpt5)

## Candidate Repo
- Path: `../roadmap-DenysDemchenkoPlaneks`
- Branch: `main`
- Recent commits:
  - `a831ed0` Implement full-stack Roadmap Engine with Docker support
  - `023a42c` Initial commit

## Framework + Schema Read
- Protocol source: `agents.md`
- Rubric source: `evaluation-framework.md`
- JSON schema: `evaluation/schema.json`
- Framework version required in output: `1.1`

## Output Target
- Final evaluation file: `evals/C-007/eval-codex-gpt5.json`

## Gate Check Preflight (already run)
- G1 likely pass: `package.json` exists
- G2 pass: `npm install` completed successfully
- G3 partial:
  - `npm run build` failed with `Bus error (core dumped)`
  - `npm run dev` started successfully on `http://localhost:3000` (counts as pass per protocol fallback)
- G4 likely pass: `src/app/matrix/page.tsx`
- G5 likely pass: `_content/projects/PRJ-001..004.md` found (4 files)
- G6 likely pass: `recharts` present in `package.json`
- G7/G8 likely pass candidates in backend service:
  - `backend/api/services/matrix.py`
- G9/G10 candidate chart+tooltip implementation:
  - `src/components/matrix/StrategyMatrix.tsx`

## High-Value Evidence Hotspots
- Matrix page entry: `src/app/matrix/page.tsx`
- Matrix chart UI: `src/components/matrix/StrategyMatrix.tsx`
- Matrix transform logic: `backend/api/services/matrix.py`
- API endpoint: `backend/api/views.py`
- Type contracts: `src/lib/types.ts`
- Project data: `_content/projects/*.md`
- Tests for normalization/quadrants: `backend/api/tests.py`
- Design tokens/colors: `src/app/globals.css`

## Next Execution Sequence
1. Re-run deterministic gate checks and capture exact evidence lines.
2. Audit route coverage (`/`, `/matrix`, `/projects`, `/roadmap`, `/updates`, dynamic `/projects/[slug]`).
3. Score rubric A-G with file:line evidence for each criterion.
4. Evaluate git-history bonus from `git log`.
5. Evaluate AI-integration bonus only for product-embedded AI (if any).
6. Calculate category scores, weighted score, final score, and score band.
7. Write `evals/C-007/eval-codex-gpt5.json` and validate with schema.
