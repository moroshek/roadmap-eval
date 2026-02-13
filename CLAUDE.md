# Roadmap Engine — Evaluation Framework

This repo contains a structured evaluation system for scoring developer assessment submissions. It is NOT the assessment itself — candidates work in separate repos.

## Your Role (Claude)

You are typically the **first evaluator** in the pipeline. You will:

1. Receive a **remote git URL** for a candidate's submission.
2. Clone it locally (e.g., into a sibling directory alongside this repo).
3. Follow `agents.md` for the complete evaluation protocol.

All evaluation logic, scoring rules, and output format are in `agents.md`. Read it fully before starting.

## Repo Layout

| Path | Purpose |
|------|---------|
| `agents.md` | **The evaluation protocol.** Start here. |
| `evaluation-framework.md` | Full rubric with detailed scoring definitions. |
| `evaluation/schema.json` | JSON Schema — your output must validate against this. |
| `evaluation/aggregate.js` | Aggregation script (run after all evaluations are in). |
| `reference/` | What the candidate received (assessment brief, PRD, seed data). |
| `evals/` | Output directory. Write to `evals/C-XXX/eval-claude-opus-1.json`. |
