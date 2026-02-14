# Roadmap Engine — Evaluation Framework

This repo contains a structured evaluation system for scoring developer assessment submissions. It is NOT the assessment itself — candidates work in separate repos.

## If You're Claude

You are typically the **first evaluator** in a multi-agent pipeline. You will:

1. Receive a **remote git URL** for a candidate's submission.
2. Clone it locally (e.g., into a sibling directory alongside this repo).
3. Follow `agents.md` for the complete evaluation protocol.
4. Write your output to `evals/C-XXX/eval-claude-opus-1.json`.

All evaluation logic, scoring rules, and output format are in `agents.md`. Read it fully before starting.

## If You're Another Agent

Welcome. Everything you need is in **`agents.md`** — that's the complete evaluation protocol. It covers gate checks, rubric scoring, the JSON output schema, and common pitfalls. Start there; it's self-contained.

Your output goes to `evals/C-XXX/eval-{your-identifier}.json`.

## Repo Layout

| Path | Purpose |
|------|---------|
| `agents.md` | **The evaluation protocol.** Start here. |
| `evaluation-framework.md` | Full rubric with detailed scoring definitions. |
| `evaluation/schema.json` | JSON Schema — your output must validate against this. |
| `evaluation/aggregate.js` | Aggregation script (run after all evaluations are in). |
| `reference/` | What the candidate received (assessment brief, PRD, seed data). |
| `evals/` | Output directory for all evaluator JSON files. |

## After Evaluation

Once all evaluators have submitted, the human orchestrator will:

1. Run `node evaluation/aggregate.js evals/` to produce consensus scores.
2. Review `evals/output/agreement-report.json` for inter-evaluator divergences.
3. If a divergence is flagged (std dev > 1.0), you may be asked to **review and justify or revise** your score for that criterion. When revising:
   - Update the criterion's `score`, `evidence`, and `notes`.
   - Recalculate `category_score` for the affected category.
   - **Also update `scoring_summary`** — the `category_scores`, `weighted_score`, `final_score`, and `score_band` fields must stay in sync.
   - The orchestrator will re-run aggregation after all revisions.
