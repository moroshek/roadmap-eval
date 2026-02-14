# Evaluation Protocol for AI Agents

You are evaluating a developer's submission to the **Roadmap Engine** developer assessment — a 3-hour timed test where candidates must implement a Strategy Matrix scatter plot and optionally build additional features.

This document is your complete operating manual. Follow it step by step.

---

## 1. Inputs You Will Receive

- **This repo** (the evaluation framework) — contains the rubric, schema, reference materials, and output directory.
- **A candidate's repo** (cloned locally) — this is what you are evaluating.
- **A candidate ID** — format `C-` followed by exactly 3 digits (e.g., `C-001`, `C-012`).

## 2. Before You Start

Read these files to understand what the candidate was asked to do:

1. `reference/README.md` — the assessment brief the candidate received.
2. `reference/Roadmap Engine PRD.md` — the product spec they were working from.
3. `reference/_content/projects/` — the 4 seeded project files (one per matrix quadrant).
4. `evaluation-framework.md` — the full rubric with scoring definitions.

## 3. Reference Truth

The seeded project data must map to these quadrants. Any deviation by the candidate is an error.

| Project | Strategic Value | Complexity | Normalized (×10) | Quadrant |
|---------|----------------|------------|-------------------|----------|
| PRJ-001 | 8.6 | 3.2 | Impact 86, Effort 32 | **Quick Wins** (impact ≥ 50, effort < 50) |
| PRJ-002 | 9.1 | 8.2 | Impact 91, Effort 82 | **Big Bets** (impact ≥ 50, effort ≥ 50) |
| PRJ-003 | 3.9 | 2.8 | Impact 39, Effort 28 | **Fillers** (impact < 50, effort < 50) |
| PRJ-004 | 4.1 | 8.7 | Impact 41, Effort 87 | **Time Sinks** (impact < 50, effort ≥ 50) |

**Axis orientation:** X-Axis = Effort/Complexity, Y-Axis = Impact/Strategic Value.

**Tooltip spec note:** The README specifies tooltips must show "Project Title & Quadrant Label." The PRD mentions "title + ROI." Accept either interpretation. Do not penalize a candidate for following one source over the other.

## 4. Evaluation Steps

### Step 1: Automated Gate Checks (~5 minutes)

Run these deterministic checks against the candidate's repo. Record pass/fail for each.

| ID | Check | How to Verify |
|----|-------|--------------|
| G1 | `package.json` exists | File check |
| G2 | `npm install` succeeds | Run command |
| G3 | Project runs: try `npm run build` first; if that fails, try `npm run dev` | Run command(s) — passes if either succeeds |
| G4 | Route exists at `/matrix` | Check `src/app/matrix/` or router config |
| G5 | At least 3 project markdown files in `_content/projects/` | Count files |
| G6 | Chart/scatter library installed | Check `package.json` deps (recharts, d3, chart.js, visx, nivo) |
| G7 | Normalization logic exists (0-10 → 0-100) | Search source for ×10 or equivalent scaling |
| G8 | Quadrant assignment logic exists | Search for conditional logic mapping scores to labels |
| G9 | Scatter plot renders data points | Inspect component code for mapped data rendering |
| G10 | Tooltips implemented on data points | Check for tooltip component/config |

**Automatic failure conditions** (flag regardless of other scores):
- G3 fails (neither `npm run build` nor `npm run dev` succeeds)
- G4 fails (no `/matrix` route)
- G9 fails (no chart renders)
- Quadrant assignments are fundamentally wrong (e.g., Quick Wins placed in bottom-right, axes inverted)

**Special gate fields** (required by schema):
- G5 requires an additional `count` field (integer — number of project files found)
- G6 requires an additional `library` field (string — name of charting library, or `"none"`)

### Step 2: Codebase Audit (~10 minutes)

Read the candidate's full repository. Catalog:
- What routes exist
- What components were built
- What utilities/lib files were created
- What data files exist
- What dependencies were added

### Step 3: Rubric Scoring (~15 minutes)

Score each criterion in `evaluation-framework.md` (Section 5, Categories A through G). For every criterion, record:

- **Score** (integer, 0-4): Use ONLY the definitions in the rubric. See the scale:
  - 0 = Missing (not attempted)
  - 1 = Inadequate (broken or severely incomplete)
  - 2 = Functional (basic, meets minimum bar)
  - 3 = Solid (well-implemented, demonstrates competence)
  - 4 = Excellent (exceeds expectations, demonstrates mastery)

- **Evidence** (required, non-empty): Cite specific `file:line` references or observable behaviors from the candidate's repo. For scores of 0, write "Not attempted" or "No evidence found."

- **Notes**: Brief qualitative commentary explaining your reasoning.

**Scoring rules:**
- Score against the rubric definitions ONLY. Do NOT compare to other submissions.
- Score what EXISTS, not what was attempted. Do not infer intent.
- When in doubt between two scores, lean conservative but document the uncertainty in notes (e.g., "Borderline 2/3 — chose 2").
- **A3 scores implementation quality** (code structure, reusability), NOT correctness. Correctness is D2.
- **A6 evidence** must cite matrix pipeline files only. **E1 evidence** must cite overall codebase architecture (non-overlapping).

### Step 4: Git History Bonus

Check the candidate's git log. This is **bonus only** — absence of history is NOT penalized.

- H1: Commit cadence (0-2 points)
- H2: Message quality (0-2 points)
- H3: Logical progression (0-1 point)
- Maximum bonus: 5 points

### Step 5: Calculate Scores

**Category score** = (sum of criteria scores / (number of criteria × 4)) × 100

Criteria counts per category: A=6, B=4, C=5, D=4, E=4, F=4, G=2.

**Weighted score** using these weights:

| Category | Weight |
|----------|--------|
| A: Strategy Matrix | 30% |
| B: Technical Foundation | 15% |
| C: UI/UX Quality | 15% |
| D: PRD Compliance | 10% |
| E: Code Quality | 20% |
| F: Bonus Features | 5% |
| G: Decision Making | 5% |

**Final score** = Weighted score + Git bonus (0-5)

**Score bands:**
| Range | Band |
|-------|------|
| 90-105 | Exceptional |
| 75-89 | Strong |
| 60-74 | Competent |
| 45-59 | Below Expectations |
| 0-44 | Insufficient |

### Step 6: Qualitative Summary

Write:
- **Top strengths** (1-5 items with evidence — at least 1 required)
- **Top weaknesses** (1-5 items with evidence — at least 1 required)
- **Standout moments** (anything surprising or notable — can be empty array if nothing stands out)
- **Hiring signal** (2-3 sentences: what kind of developer is this?)
- **Recommendation**: one of `Strong Hire`, `Hire`, `Lean Hire`, `Lean No Hire`, `No Hire`

### Step 7: Output

Produce a single JSON file that validates against `evaluation/schema.json`.

**Output path:** `evals/{candidate-id}/eval-{your-identifier}.json`

Example: `evals/C-001/eval-claude-opus-1.json`

Your JSON must validate against `evaluation/schema.json`. Here is the required structure:

```json
{
  "evaluation_metadata": {
    "candidate_id": "C-001",
    "repo_url": "https://github.com/...",
    "evaluated_at": "2026-02-13T12:00:00Z",
    "evaluator": "claude-opus-1",
    "framework_version": "1.0"
  },
  "automated_gate": {
    "G1_package_json_exists":       { "pass": true, "notes": "" },
    "G2_install_succeeds":          { "pass": true, "notes": "" },
    "G3_build_succeeds":            { "pass": true, "notes": "" },
    "G4_matrix_route_exists":       { "pass": true, "notes": "" },
    "G5_project_files_exist":       { "pass": true, "count": 4, "notes": "" },
    "G6_chart_library_installed":   { "pass": true, "library": "recharts", "notes": "" },
    "G7_normalization_logic_exists": { "pass": true, "notes": "" },
    "G8_quadrant_logic_exists":     { "pass": true, "notes": "" },
    "G9_chart_renders_data":        { "pass": true, "notes": "" },
    "G10_tooltips_implemented":     { "pass": true, "notes": "" },
    "gate_summary": {
      "total_passed": 10,
      "total_failed": 0,
      "automatic_failure_triggered": false,
      "failure_reasons": []
    }
  },
  "rubric_scores": {
    "A_strategy_matrix": {
      "weight": 0.30,
      "criteria": {
        "A1_data_population":      { "score": 0, "evidence": "...", "notes": "..." },
        "A2_score_normalization":   { "score": 0, "evidence": "...", "notes": "..." },
        "A3_quadrant_assignment":   { "score": 0, "evidence": "...", "notes": "..." },
        "A4_scatter_plot_rendering": { "score": 0, "evidence": "...", "notes": "..." },
        "A5_tooltip_implementation": { "score": 0, "evidence": "...", "notes": "..." },
        "A6_logic_ui_separation":   { "score": 0, "evidence": "...", "notes": "..." }
      },
      "category_score": 0.0,
      "category_commentary": "..."
    },
    "B_technical_foundation": {
      "weight": 0.15,
      "criteria": {
        "B1_project_setup":      { "score": 0, "evidence": "...", "notes": "..." },
        "B2_routing_navigation": { "score": 0, "evidence": "...", "notes": "..." },
        "B3_type_safety":        { "score": 0, "evidence": "...", "notes": "..." },
        "B4_data_layer":         { "score": 0, "evidence": "...", "notes": "..." }
      },
      "category_score": 0.0,
      "category_commentary": "..."
    },
    "C_ui_ux_quality": {
      "weight": 0.15,
      "criteria": {
        "C1_visual_design":            { "score": 0, "evidence": "...", "notes": "..." },
        "C2_responsive_design":        { "score": 0, "evidence": "...", "notes": "..." },
        "C3_interactivity":            { "score": 0, "evidence": "...", "notes": "..." },
        "C4_empty_error_loading_states": { "score": 0, "evidence": "...", "notes": "..." },
        "C5_design_token_usage":       { "score": 0, "evidence": "...", "notes": "..." }
      },
      "category_score": 0.0,
      "category_commentary": "..."
    },
    "D_prd_compliance": {
      "weight": 0.10,
      "criteria": {
        "D1_schema_adherence":       { "score": 0, "evidence": "...", "notes": "..." },
        "D2_quadrant_logic_accuracy": { "score": 0, "evidence": "...", "notes": "..." },
        "D3_route_structure":        { "score": 0, "evidence": "...", "notes": "..." },
        "D4_specification_details":  { "score": 0, "evidence": "...", "notes": "..." }
      },
      "category_score": 0.0,
      "category_commentary": "..."
    },
    "E_code_quality": {
      "weight": 0.20,
      "criteria": {
        "E1_separation_of_concerns": { "score": 0, "evidence": "...", "notes": "..." },
        "E2_readability_naming":     { "score": 0, "evidence": "...", "notes": "..." },
        "E3_error_handling":         { "score": 0, "evidence": "...", "notes": "..." },
        "E4_dependency_choices":     { "score": 0, "evidence": "...", "notes": "..." }
      },
      "category_score": 0.0,
      "category_commentary": "..."
    },
    "F_bonus_features": {
      "weight": 0.05,
      "criteria": {
        "F1_dashboard":          { "score": 0, "evidence": "...", "notes": "..." },
        "F2_additional_pages":   { "score": 0, "evidence": "...", "notes": "..." },
        "F3_search_filtering":   { "score": 0, "evidence": "...", "notes": "..." },
        "F4_creative_additions": { "score": 0, "evidence": "...", "notes": "..." }
      },
      "category_score": 0.0,
      "category_commentary": "..."
    },
    "G_decision_making": {
      "weight": 0.05,
      "criteria": {
        "G1_prioritization":  { "score": 0, "evidence": "...", "notes": "..." },
        "G2_pr_description":  { "score": 0, "evidence": "...", "notes": "..." }
      },
      "category_score": 0.0,
      "category_commentary": "..."
    }
  },
  "git_history_bonus": {
    "H1_commit_cadence":      { "points": 0, "evidence": "...", "notes": "..." },
    "H2_message_quality":     { "points": 0, "evidence": "...", "notes": "..." },
    "H3_logical_progression": { "points": 0, "evidence": "...", "notes": "..." },
    "bonus_total": 0
  },
  "scoring_summary": {
    "category_scores": {
      "A_strategy_matrix": 0.0,
      "B_technical_foundation": 0.0,
      "C_ui_ux_quality": 0.0,
      "D_prd_compliance": 0.0,
      "E_code_quality": 0.0,
      "F_bonus_features": 0.0,
      "G_decision_making": 0.0
    },
    "weighted_score": 0.0,
    "git_bonus": 0,
    "final_score": 0.0,
    "score_band": "Insufficient",
    "automatic_failure": false,
    "automatic_failure_reasons": []
  },
  "qualitative_summary": {
    "top_strengths": ["..."],
    "top_weaknesses": ["..."],
    "standout_moments": [],
    "hiring_signal": "...",
    "recommendation": "No Hire"
  }
}
```

**Schema-enforced constraints** (validation will reject your file if violated):
- `candidate_id`: must match `C-` + exactly 3 digits (regex: `^C-\d{3}$`)
- `framework_version`: must be exactly `"1.0"`
- `weight` values: must match the table above exactly (const-locked in schema)
- Rubric scores: integers 0-4
- Git bonus: H1/H2 are 0-2, H3 is 0-1, `bonus_total` is 0-5
- `evidence`: non-empty string for ALL scores (including 0)
- `top_strengths` / `top_weaknesses`: 1-5 items each (cannot be empty)
- `standout_moments`: can be empty
- `score_band`: one of `Exceptional`, `Strong`, `Competent`, `Below Expectations`, `Insufficient`
- `recommendation`: one of `Strong Hire`, `Hire`, `Lean Hire`, `Lean No Hire`, `No Hire`
- G5 requires `count` field, G6 requires `library` field (see gate table above)

**Computed constraints** (not schema-enforced — you must calculate these correctly):
- `bonus_total` must equal H1 + H2 + H3
- `category_score` must equal `(sum of criteria / (count × 4)) × 100`
- `weighted_score` must equal the sum of `(category_score × weight)` across all categories
- `final_score` must equal `weighted_score + git_bonus`
- `score_band` must match the band table for your `final_score`

> **Note:** This JSON skeleton reflects schema v1.0. If `framework_version` changes in the future, re-derive the exact field structure from `evaluation/schema.json`.

---

## 5. Common Pitfalls

- **Don't confuse this repo with the candidate's repo.** The `reference/` folder here is what they received. Evaluate their repo, but verify correctness against the reference truth in Section 3 above.
- **Don't skip evidence.** Every score needs a citation. "Looks good" is not evidence. For score 0, write "Not attempted."
- **Don't swap axes.** X = Effort, Y = Impact. Quick Wins are top-left (high impact, low effort).
- **Don't double-count.** A3 and D2 are different criteria (implementation quality vs correctness). A6 and E1 are different scopes (matrix pipeline vs whole codebase). Cite distinct evidence for each.
- **Don't penalize missing git history.** It's bonus-only.
- **Don't penalize tooltip interpretation.** README and PRD differ slightly. Accept either.
- **G2 has a PR cap rule.** If no Pull Request was created, G2_pr_description is capped at 1 regardless of other documentation. A PR is an explicit assessment deliverable. See `evaluation-framework.md` Category G for the full rubric.
- **Don't forget metadata fields.** `repo_url`, `evaluated_at`, `evaluator`, and `framework_version` are all required. So is `category_commentary` on every category.
- **Don't forget `gate_summary`.** After the 10 gate checks, include the summary object with `total_passed`, `total_failed`, `automatic_failure_triggered`, and `failure_reasons`.
- **Don't forget special gate fields.** G5 needs `count`, G6 needs `library` — in addition to `pass` and `notes`.
- **Ensure `category_score` is computed, not estimated.** Use the formula: `(sum / (count × 4)) × 100`. Verify your arithmetic.
- **Keep `scoring_summary` in sync.** Category scores appear in TWO places: under each `rubric_scores.X.category_score` AND in `scoring_summary.category_scores`. If you revise any criterion score, recalculate and update BOTH locations, plus `weighted_score`, `final_score`, and `score_band`.
- **Only score what's in the repo.** Evaluate based on the candidate's repository contents. Do not factor in out-of-band information (messages, emails, verbal instructions) unless explicitly directed by the orchestrator. If a candidate provides instructions outside the repo, note it but score the repo as-is.
