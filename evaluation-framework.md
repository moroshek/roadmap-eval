# Evaluation Framework: Roadmap Engine Developer Assessment

## 1. Overview

This framework provides a **consistent, evidence-based methodology** for evaluating candidate submissions to the Roadmap Engine developer assessment. It is designed to minimize evaluator drift across multiple submissions by combining deterministic automated checks with a structured rubric that requires cited evidence for every score.

### Design Principles
- **Every score requires evidence.** No criterion can be scored without citing specific file paths, line numbers, or observable behaviors.
- **Binary sub-checks reduce subjectivity.** Even "polish" criteria are decomposed into observable yes/no items.
- **Categories are independently valuable.** The total score is a useful signal, but individual category scores reveal candidate strengths that a composite number would hide (e.g., exceptional design sense with mediocre code quality).

---

## 2. Evaluation Protocol

To ensure consistency across 10+ submissions evaluated by different agent instances:

### Step 1: Automated Gate (5 minutes)
Run deterministic checks that require no judgment. These produce binary pass/fail results.

### Step 2: Codebase Audit (10 minutes)
Read the full repository. Catalog what exists: routes, components, utilities, data files.

### Step 3: Rubric Scoring (15 minutes)
Score each criterion using the detailed rubric below. For every score, record:
- The **score** (0–4)
- **Evidence**: file paths, line numbers, or behavioral observations
- **Notes**: brief qualitative commentary

### Step 4: Output Generation
Produce the structured JSON evaluation (schema in Section 7).

### Critical Rule for Evaluators
> Do NOT compare this submission to other submissions. Score against the rubric definitions only. Comparative ranking happens after all individual evaluations are complete.

---

## 3. Scoring Scale

All criteria use the same 0–4 scale:

| Score | Label | Definition |
|-------|-------|-----------|
| **0** | **Missing** | Not attempted. No evidence of work in this area. |
| **1** | **Inadequate** | Attempted but fundamentally broken, incorrect, or severely incomplete. Would not pass a basic code review. |
| **2** | **Functional** | Works but is basic or has notable issues. Meets the minimum bar without demonstrating skill. |
| **3** | **Solid** | Well-implemented. Meets expectations with few issues. Demonstrates competence and care. |
| **4** | **Excellent** | Exceeds expectations. Demonstrates mastery, creativity, or exceptional attention to detail. Would impress a senior reviewer. |

---

## 4. Automated Gate Checks

These are deterministic, binary checks. They can be run by script or verified mechanically by the evaluator. No judgment is required.

| ID | Check | Method | Pass/Fail |
|----|-------|--------|-----------|
| G1 | Repository contains a `package.json` | File exists | |
| G2 | `npm install` (or equivalent) completes without errors | Run command | |
| G3 | `npm run build` (or `npm run dev`) succeeds | Run command | |
| G4 | A route exists at `/matrix` | Check `src/app/matrix/` or equivalent routing | |
| G5 | At least 3 project markdown files exist in `_content/projects/` | Count files | |
| G6 | A chart/scatter plot library is installed (e.g., recharts, d3, chart.js, visx, nivo) | Check `package.json` dependencies | |
| G7 | Normalization logic exists (transforms 0–10 scores to 0–100) | Search for multiplication by 10 or equivalent scaling in source | |
| G8 | Quadrant assignment logic exists | Search for conditional logic mapping scores to quadrant labels | |
| G9 | The scatter plot renders data points (not an empty chart) | Check component renders mapped data | |
| G10 | Tooltips are implemented on chart data points | Check for tooltip component/config in chart code | |

### Gate Interpretation
- **G1–G3 all fail**: Candidate did not produce a runnable project. Severe red flag.
- **G4 fails**: The must-have route is missing. Automatic failure per assessment rules.
- **G7 or G8 fail**: Core transformation logic is absent. The chart may render but with wrong data.

---

## 5. Rubric: Detailed Criteria

### Category A: Strategy Matrix — Core Requirement
**Weight: 30%**

This is the must-have. A missing or broken matrix is an automatic failure per assessment rules, but within this category there is significant differentiation between "barely works" and "impressive."

#### A1: Data Population (0–4)
*Did the candidate create or properly use structured project data?*

| Score | Definition |
|-------|-----------|
| 0 | No project files exist, or existing files are unused |
| 1 | Files exist but frontmatter is malformed, missing required fields (scores, dates), or doesn't follow PRD schema |
| 2 | Uses the 4 seeded files correctly; frontmatter is valid and parseable |
| 3 | Uses seeded files AND added 1–2 additional projects with realistic data spanning different quadrants |
| 4 | Created a rich dataset (5+ projects) with realistic, diverse data. Projects span multiple departments, phases, and statuses. Data tells a coherent story |

**Evidence required:** List project files found, note any schema deviations.

#### A2: Score Normalization (0–4)
*Is the 0–10 → 0–100 transformation implemented correctly?*

| Score | Definition |
|-------|-----------|
| 0 | No normalization exists; raw scores used directly or hardcoded |
| 1 | Normalization attempted but mathematically incorrect (e.g., wrong scale, off-by-one in boundaries) |
| 2 | Correct multiplication (×10) exists but is inline/co-located with UI code |
| 3 | Correct normalization in a dedicated utility/transform function, clearly separated from rendering |
| 4 | Normalization is part of a well-designed data pipeline (e.g., a transform layer that processes all project data, with the normalization as one step). Handles edge cases (missing scores, out-of-range values) |

**Evidence required:** Cite the file:line where normalization occurs. Verify math: PRJ-001 strategic_value 8.6 → 86, complexity 3.2 → 32.

#### A3: Quadrant Assignment — Implementation Quality (0–4)
*How well is the quadrant assignment logic structured and engineered?*

> **Note:** Correctness of quadrant assignments (right labels, right boundaries) is scored in **D2**. This criterion focuses on the quality of the implementation — how the logic is structured, not whether it produces the right output.

| Score | Definition |
|-------|-----------|
| 0 | No quadrant assignment logic exists |
| 1 | Logic exists but is hardcoded per-project (e.g., manual mapping of project IDs to quadrant names) or embedded directly in JSX/template code |
| 2 | Logic is implemented as conditional code (if/else or switch on score thresholds) but co-located with UI rendering code |
| 3 | Quadrant assignment in a dedicated function or utility, clearly separated from rendering; handles boundary values (exactly 50); clean, readable implementation |
| 4 | Well-structured reusable utility: quadrant thresholds are configurable or documented as constants, logic is tested or self-documenting, could be reused for different threshold configurations without modification |

**Evidence required:** Cite the file:line of the assignment logic. Describe the code structure, separation from UI, and reusability characteristics.

#### A4: Scatter Plot Rendering (0–4)
*Is the chart rendered correctly with proper axes, labels, and data points?*

| Score | Definition |
|-------|-----------|
| 0 | No chart rendered |
| 1 | A chart component exists but doesn't render, crashes, or shows no data |
| 2 | Chart renders with data points on correct axes (X=Effort, Y=Impact). Basic but functional |
| 3 | Well-rendered chart with labeled axes, quadrant background zones/labels visible, appropriate scaling (0–100 on both axes) |
| 4 | Premium chart: quadrant zones with distinct colors/shading, clear axis labels with units, data points sized or colored by a meaningful dimension (e.g., department, cost, confidence). Visually impressive |

**Evidence required:** Describe what renders. Note axis labels, data point count, quadrant visualization.

#### A5: Tooltip Implementation (0–4)
*Do tooltips show required information on hover?*

| Score | Definition |
|-------|-----------|
| 0 | No tooltips |
| 1 | Tooltips exist but show wrong data, are broken, or show only raw values |
| 2 | Tooltips show Project Title AND Quadrant Label (minimum requirement per README) |
| 3 | Tooltips show Title, Quadrant Label, plus additional useful info (e.g., ROI, department, scores) |
| 4 | Tooltips are polished: styled consistently with the design system, show rich info, have smooth enter/exit transitions, and don't clip at chart edges |

**Evidence required:** List what fields appear in the tooltip. Note styling quality.

#### A6: Logic/UI Separation (0–4)
*Is transformation logic cleanly separated from the UI rendering component?*

| Score | Definition |
|-------|-----------|
| 0 | Everything is in one monolithic file |
| 1 | Attempt at separation but logic is still heavily interleaved with JSX |
| 2 | Data fetching/parsing in one file, rendering in another, but transformation (normalization, quadrant assignment) is mixed into either |
| 3 | Clear separation: data loading → transformation/normalization → quadrant assignment → chart component. Each concern in its own file or function |
| 4 | Exemplary architecture: a data pipeline (parse → validate → transform → enrich) that feeds a pure presentation component. The chart component receives fully prepared data and only handles rendering |

**Evidence required:** List the files involved in the **matrix data pipeline specifically** (markdown parsing → normalization → quadrant assignment → chart props) and what each is responsible for. Note any transformation logic in the chart component file that should live elsewhere. *(Evidence scope: matrix-related files only. Whole-codebase architecture is scored in E1.)*

---

### Category B: Technical Foundation
**Weight: 15%**

#### B1: Project Setup & Build (0–4)
*Did the candidate scaffold a working project with appropriate tooling?*

| Score | Definition |
|-------|-----------|
| 0 | No package.json or project structure |
| 1 | Project exists but doesn't build or has critical configuration errors |
| 2 | Standard Next.js setup, builds successfully, minimal configuration |
| 3 | Well-configured project: TypeScript, Tailwind CSS, sensible tsconfig, linting configured |
| 4 | Professional setup: TypeScript strict mode, path aliases, proper .gitignore, environment-appropriate configs, clear scripts in package.json |

#### B2: Routing & Navigation (0–4)
*Does the app have proper routing matching the PRD structure?*

| Score | Definition |
|-------|-----------|
| 0 | Only a single page or no routing |
| 1 | `/matrix` route exists but navigation between pages is broken or nonexistent |
| 2 | `/matrix` works with basic navigation (links between 2–3 pages) |
| 3 | Multiple PRD routes implemented (dashboard, matrix, projects). Sidebar or navigation component present |
| 4 | Full navigation system matching PRD spec: sidebar with all primary links, breadcrumbs, active state indicators. Layout is consistent across routes |

#### B3: Type Safety (0–4)
*How well does the candidate use TypeScript (or equivalent type safety)?*

| Score | Definition |
|-------|-----------|
| 0 | Plain JavaScript with no type annotations |
| 1 | TypeScript files exist but heavy use of `any`, type errors suppressed |
| 2 | Basic TypeScript: interfaces for project data, typed component props |
| 3 | Strong typing throughout: Zod schemas or equivalent for frontmatter validation, typed utility functions, generic types where appropriate |
| 4 | Exemplary type safety: Zod schemas that match the PRD spec exactly, inferred types from schemas, discriminated unions for status/phase, no `any` usage |

#### B4: Data Layer Architecture (0–4)
*How does data flow from markdown files to the UI?*

| Score | Definition |
|-------|-----------|
| 0 | Hardcoded data in components |
| 1 | Data is read from files but parsing is ad-hoc or fragile |
| 2 | Uses a markdown parsing library (gray-matter, next-mdx-remote, etc.) to read frontmatter. Basic but functional pipeline |
| 3 | Well-structured data layer: dedicated loader functions, parsed and validated data, clear data flow from files → loader → transform → component |
| 4 | Production-quality data layer: centralized content loader, schema validation on load, error handling for malformed files, possibility of the `master_data.json` build output mentioned in the PRD |

---

### Category C: UI/UX Quality
**Weight: 15%**

#### C1: Visual Design & Polish (0–4)
*Does the application look like a product or a homework assignment?*

Sub-checks (observable):
- [ ] Consistent color palette used throughout
- [ ] Typography hierarchy (headings vs. body text differentiated)
- [ ] Adequate whitespace/padding (nothing feels cramped)
- [ ] No default browser styling visible (unstyled links, default buttons)
- [ ] Professional look: would not embarrass if shown to a client

| Score | Definition |
|-------|-----------|
| 0 | Unstyled or default browser appearance |
| 1 | Some CSS applied but inconsistent, cluttered, or amateurish |
| 2 | Clean and functional. Tailwind or similar utility classes used. Passes 2–3 sub-checks |
| 3 | Polished: cohesive design language, good spacing, passes 4+ sub-checks. Looks intentional |
| 4 | Premium: feels like a real SaaS product. Thoughtful color usage, subtle shadows/borders, excellent information hierarchy. Would impress a design-conscious stakeholder |

#### C2: Responsive Design (0–4)
| Score | Definition |
|-------|-----------|
| 0 | No responsive considerations; breaks on resize |
| 1 | Some responsive classes but layout breaks at common breakpoints |
| 2 | Usable at desktop and tablet widths; chart resizes acceptably |
| 3 | Fully responsive: sidebar collapses, chart reflows, cards stack. Works at 320px–1920px |
| 4 | Responsive with adaptive UX: mobile navigation pattern, touch-friendly chart interactions, different layouts optimized per breakpoint |

#### C3: Interactivity & Micro-interactions (0–4)
| Score | Definition |
|-------|-----------|
| 0 | Static page with no interactive elements beyond basic links |
| 1 | Click handlers exist but feel janky or have no visual feedback |
| 2 | Basic interactivity: hover states on buttons/links, chart tooltips work |
| 3 | Smooth interactions: transitions on state changes, animated chart entry, hover effects on data points, filter controls that update the view |
| 4 | Delightful: subtle animations (Framer Motion or CSS transitions), smooth tooltip transitions, brush-to-zoom on chart, skeleton → content transitions, micro-interactions that feel intentional |

#### C4: Empty, Error, and Loading States (0–4)
| Score | Definition |
|-------|-----------|
| 0 | No consideration for non-happy-path states |
| 1 | App crashes or shows blank screen when data is missing |
| 2 | Basic handling: shows a message if no data, doesn't crash on empty states |
| 3 | Thoughtful states: loading skeletons (per PRD requirement), empty state messaging, graceful degradation if a project file is malformed |
| 4 | Production-quality: skeleton loaders for all widgets, contextual empty states with guidance ("No projects found matching 'XYZ'. Try adjusting your filters."), error boundaries, no raw error messages exposed to users |

#### C5: Design Token Usage (0–4)
*Did the candidate use the tenant's branding from config.json?*

| Score | Definition |
|-------|-----------|
| 0 | Hardcoded colors unrelated to the config |
| 1 | Some config colors used but inconsistently applied |
| 2 | Primary/secondary colors from config.json used in key places (header, buttons) |
| 3 | Full design token integration: colors, typography (Inter/Roboto), consistent with the AutoNova branding throughout |
| 4 | Dynamic theming: design tokens consumed from config in a way that would work for any tenant. CSS variables or theme provider pattern that makes the app truly white-label |

---

### Category D: PRD Compliance
**Weight: 10%**

#### D1: Schema Adherence (0–4)
*Do project files and data structures match the PRD's data model (Section 3.2)?*

| Score | Definition |
|-------|-----------|
| 0 | Invented their own schema unrelated to the PRD |
| 1 | Some PRD fields present but key fields missing or renamed |
| 2 | Core fields present (id, title, scores, status) matching PRD naming |
| 3 | Full schema compliance: all frontmatter fields from PRD Section 3.2 present and correctly typed |
| 4 | Schema is enforced programmatically (Zod/Yup validation) matching the PRD's "Build-Time Validation Rules" (Section 3.4) |

#### D2: Quadrant Logic Accuracy (0–4)
*Are the quadrant boundaries and labels exactly as specified in PRD Section 2.1?*

| Score | Definition |
|-------|-----------|
| 0 | No quadrant logic |
| 1 | Quadrant names wrong, boundaries inverted, or axes swapped |
| 2 | Correct labels and boundaries for the obvious cases; might have boundary-condition errors (what happens at exactly 50?) |
| 3 | Exact match to PRD: Quick Wins (≥50 impact, <50 effort), Big Bets (≥50/≥50), Fillers (<50/<50), Time Sinks (<50/≥50). Boundary at 50 handled consistently |
| 4 | Perfect compliance plus the quadrant labels are visually rendered on the chart as background zones (per PRD 4.3: "Background zones labeled") |

#### D3: Route Structure (0–4)
*Do implemented routes match the PRD's page specifications (Section 4)?*

| Score | Definition |
|-------|-----------|
| 0 | Only `/matrix` or a single route |
| 1 | 2 routes exist but don't match PRD naming |
| 2 | `/matrix` plus 1–2 other PRD routes (/, /projects, /roadmap) |
| 3 | 3+ PRD routes with correct paths and basic content matching their intended purpose |
| 4 | All primary routes from PRD Section 4 present (/, /matrix, /roadmap, /projects, /projects/[slug]) with content matching specifications |

#### D4: Specification Detail Compliance (0–4)
*Did the candidate attend to specific details called out in the PRD?*

Check against these PRD-specified details:
- [ ] X-Axis is Effort/Complexity, Y-Axis is Impact/Strategic Value (not swapped)
- [ ] Scatter plot (not bar chart, pie chart, or other visualization)
- [ ] Strategic value field used for Y-axis (not a different field)
- [ ] Complexity field used for X-axis (not a different field)
- [ ] "Quick Wins" is top-left (high impact, low effort) — not misplaced

| Score | Definition |
|-------|-----------|
| 0 | Major spec violations (wrong chart type, axes swapped) |
| 1 | 1–2 detail violations |
| 2 | No violations but only minimum details implemented |
| 3 | All checked details correct; candidate clearly read the PRD carefully |
| 4 | All details correct plus adherence to additional PRD details (e.g., sidebar navigation structure, search trigger cmd+k, print styles) |

---

### Category E: Code Quality
**Weight: 20%**

#### E1: Separation of Concerns (0–4)

> **Evidence scope:** Evaluate the **overall codebase architecture**, not just the matrix pipeline. Cite files/patterns beyond what was cited for A6. If the candidate only built the matrix, score based on how that code is organized holistically (file structure, module boundaries, dependency direction).

| Score | Definition |
|-------|-----------|
| 0 | Single file or tangled concerns |
| 1 | Multiple files but responsibilities are muddled |
| 2 | Basic separation: pages in app/, some utilities in lib/ |
| 3 | Clear architecture: data loading, transformation, and presentation in distinct layers. Components are focused on rendering; logic lives in utilities |
| 4 | Exemplary: each file has a single clear responsibility, dependencies flow in one direction, a new developer could understand the architecture in minutes |

#### E2: Readability & Naming (0–4)
| Score | Definition |
|-------|-----------|
| 0 | Unreadable: single-letter variables, no structure |
| 1 | Partially readable but inconsistent naming, confusing function signatures |
| 2 | Readable: descriptive variable names, consistent conventions (camelCase or snake_case throughout) |
| 3 | Clean: functions are well-named and focused, files are well-organized, code is self-documenting |
| 4 | Exemplary: code reads like prose, naming is precise and domain-appropriate (e.g., `normalizeScore` not `convert`), consistent patterns throughout |

#### E3: Error Handling & Robustness (0–4)
| Score | Definition |
|-------|-----------|
| 0 | No error handling; any bad data crashes the app |
| 1 | Try/catch blocks exist but errors are swallowed or produce cryptic failures |
| 2 | Basic handling: app doesn't crash on missing files or malformed frontmatter |
| 3 | Thoughtful handling: validation before processing, meaningful error messages, graceful degradation |
| 4 | Production-quality: comprehensive input validation, error boundaries in React, fallback UI for partial failures, never exposes raw errors to users |

#### E4: Dependency Choices (0–4)
*Are library choices appropriate and well-justified?*

| Score | Definition |
|-------|-----------|
| 0 | No dependencies managed (or everything hand-rolled unnecessarily) |
| 1 | Inappropriate or excessive dependencies (e.g., jQuery, entire UI kit for one chart) |
| 2 | Reasonable choices: a charting library (Recharts, Chart.js, etc.) and markdown parser (gray-matter) |
| 3 | Well-chosen stack: charting lib that supports scatter plots natively, appropriate Tailwind plugins, markdown processing. Nothing unnecessary |
| 4 | Expert-level choices: dependencies align with PRD recommendations (Recharts or D3 per Section 4.3, Fuse.js per Section 7.1), minimal dependency footprint, versions are current |

---

### Category F: Bonus Features & Ambition
**Weight: 5%**

#### F1: Executive Dashboard (0–4)
*Did the candidate implement dashboard metrics (PRD Section 4.2)?*

| Score | Definition |
|-------|-----------|
| 0 | No dashboard or empty `/` route |
| 1 | Dashboard route exists but shows placeholder text only |
| 2 | 1–2 metric cards (e.g., Total Investment or Active Projects Count) with real calculated data |
| 3 | Multiple dashboard widgets: metric cards, phase indicator, recent activity. Data derived from project files |
| 4 | Full dashboard: all PRD-specified widgets, real calculations (Total Investment summed from projects, ROI multiplier, active count), visually polished |

#### F2: Additional Pages (0–4)
*Beyond the matrix, what else was implemented?*

| Score | Definition |
|-------|-----------|
| 0 | Only `/matrix` |
| 1 | One additional route with minimal content |
| 2 | 2 additional routes with functional content (e.g., project library + project detail) |
| 3 | 3+ routes with meaningful content matching PRD specs |
| 4 | Near-complete page coverage: dashboard, matrix, project library, project detail, updates feed. Each page has purpose-built content |

#### F3: Search & Filtering (0–4)
| Score | Definition |
|-------|-----------|
| 0 | No search or filtering |
| 1 | Basic text filter (exact match) on one page |
| 2 | Functional filtering by one dimension (e.g., department dropdown on matrix) |
| 3 | Multi-faceted filtering: 2+ filter dimensions, fuzzy search (Fuse.js), filters update views in real-time |
| 4 | Full search experience: cmd+k trigger, Fuse.js with PRD-specified key weighting (Section 7.1), cross-page search, filter state persists |

#### F4: Creative Additions (0–4)
*Did the candidate add anything impressive beyond the PRD?*

| Score | Definition |
|-------|-----------|
| 0 | Nothing beyond explicit requirements |
| 1 | Minor additions (e.g., a footer, about page) |
| 2 | Useful additions: dark mode toggle, print stylesheet, data export |
| 3 | Impressive additions: Gantt chart, AI ingestion prototype, animated transitions, PDF generation |
| 4 | Exceptional: features that demonstrate deep product thinking or technical creativity. Something that makes the evaluator say "I didn't expect that" |

---

### Category G: Decision Making & Communication
**Weight: 5%**

#### G1: Prioritization Quality (0–4)
*Did the candidate spend their time wisely?*

| Score | Definition |
|-------|-----------|
| 0 | Must-have is missing; time was spent on irrelevant features |
| 1 | Must-have is broken; polish was prioritized over correctness |
| 2 | Must-have works; remaining time spent on reasonable bonus items |
| 3 | Must-have is solid; bonus work shows strategic prioritization (chose high-impact items) |
| 4 | Must-have is excellent; bonus work demonstrates clear product thinking — they chose features that make the portfolio coherent (e.g., dashboard + matrix = a usable tool, not just a chart) |

#### G2: PR Description & Documentation (0–4)
*How well did the candidate communicate their work?*

| Score | Definition |
|-------|-----------|
| 0 | No PR description or submission summary |
| 1 | One-line PR description with no substance |
| 2 | Brief PR description explaining what was built |
| 3 | Structured PR description: what was built, what was skipped and why, known limitations, how to test |
| 4 | Exceptional communication: clear summary, architectural decisions explained, trade-offs documented, screenshots or GIFs included, demonstrates self-awareness about their work |

---

### Category H: Git History (Bonus)
**Weight: Additive bonus, 0–5 points on top of the 100-point scale**

> **Important:** Candidates are NOT penalized for sparse git history. Some developers commit at the end. This category can only ADD points, never subtract.

#### H1: Commit Cadence (0–2 bonus points)
| Points | Definition |
|--------|-----------|
| 0 | Single commit, or commits only at the end |
| 1 | 3–5 commits showing incremental progress |
| 2 | 6+ logical commits showing clear work progression (scaffold → data layer → chart → polish) |

#### H2: Commit Message Quality (0–2 bonus points)
| Points | Definition |
|--------|-----------|
| 0 | Generic messages ("update", "fix", "wip") or auto-generated |
| 1 | Descriptive messages that explain what changed |
| 2 | Professional messages: imperative mood, concise, explain the "why" not just the "what" |

#### H3: Logical Progression (0–1 bonus point)
| Points | Definition |
|--------|-----------|
| 0 | No discernible order to the work |
| 1 | Commits show a logical build-up: foundation → core feature → enhancements → polish. Demonstrates structured thinking |

---

## 6. Scoring Methodology

### 6.1 Category Score Calculation

Each category's score is the **arithmetic mean** of its criteria, scaled to 0–100:

```
Category Score = (sum of criteria scores / (number of criteria × 4)) × 100
```

Example: Category A (6 criteria), scores of [3, 3, 4, 3, 2, 3] = 18/24 = 75.0

### 6.2 Weighted Total Score

| Category | Weight |
|----------|--------|
| A: Strategy Matrix (Core) | 30% |
| B: Technical Foundation | 15% |
| C: UI/UX Quality | 15% |
| D: PRD Compliance | 10% |
| E: Code Quality | 20% |
| F: Bonus Features | 5% |
| G: Decision Making | 5% |
| **Total** | **100%** |

```
Weighted Score = Σ(Category Score × Category Weight)
```

### 6.3 Final Score

```
Final Score = Weighted Score + Git History Bonus (0–5)
```

Maximum possible: **105 points** (100 base + 5 bonus)

### 6.4 Score Interpretation Bands

| Range | Band | Interpretation |
|-------|------|---------------|
| 90–105 | **Exceptional** | Top-tier candidate. Recommend hire with high confidence. |
| 75–89 | **Strong** | Solid developer. Clear hire signal with minor gaps. |
| 60–74 | **Competent** | Meets baseline expectations. Hire depends on team needs and other signals. |
| 45–59 | **Below Expectations** | Significant gaps. Proceed only if other factors (interview, portfolio) compensate. |
| 0–44 | **Insufficient** | Core requirements not met or major quality issues. Do not advance. |

### 6.5 Automatic Failure Conditions

Regardless of total score, the following trigger an **automatic failure flag** (the candidate may still receive a score for comparative purposes, but the flag must be noted):

1. **Matrix route (`/matrix`) does not exist or renders nothing**
2. **No scatter plot or chart of any kind is rendered**
3. **Project does not build (`npm run build` fails)**
4. **Quadrant assignments are fundamentally wrong** (e.g., Quick Wins placed in bottom-right)

---

## 7. Evaluation Output Schema

Every evaluation produces a JSON object with this structure. This ensures machine-comparable results across all submissions.

```json
{
  "evaluation_metadata": {
    "candidate_id": "string — anonymized identifier",
    "repo_url": "string — repository URL",
    "evaluated_at": "ISO 8601 timestamp",
    "evaluator": "string — agent instance or human identifier",
    "framework_version": "1.0"
  },
  "automated_gate": {
    "G1_package_json_exists": { "pass": true, "notes": "" },
    "G2_install_succeeds": { "pass": true, "notes": "" },
    "G3_build_succeeds": { "pass": true, "notes": "" },
    "G4_matrix_route_exists": { "pass": true, "notes": "" },
    "G5_project_files_exist": { "pass": true, "count": 4, "notes": "" },
    "G6_chart_library_installed": { "pass": true, "library": "recharts", "notes": "" },
    "G7_normalization_logic_exists": { "pass": true, "notes": "" },
    "G8_quadrant_logic_exists": { "pass": true, "notes": "" },
    "G9_chart_renders_data": { "pass": true, "notes": "" },
    "G10_tooltips_implemented": { "pass": true, "notes": "" },
    "gate_summary": {
      "total_passed": 10,
      "total_failed": 0,
      "automatic_failure_triggered": false,
      "failure_reasons": []
    }
  },
  "rubric_scores": {
    "A_strategy_matrix": {
      "weight": 0.25,
      "criteria": {
        "A1_data_population": { "score": 0, "evidence": "", "notes": "" },
        "A2_score_normalization": { "score": 0, "evidence": "", "notes": "" },
        "A3_quadrant_assignment": { "score": 0, "evidence": "", "notes": "" },
        "A4_scatter_plot_rendering": { "score": 0, "evidence": "", "notes": "" },
        "A5_tooltip_implementation": { "score": 0, "evidence": "", "notes": "" },
        "A6_logic_ui_separation": { "score": 0, "evidence": "", "notes": "" }
      },
      "category_score": 0.0,
      "category_commentary": ""
    },
    "B_technical_foundation": {
      "weight": 0.15,
      "criteria": {
        "B1_project_setup": { "score": 0, "evidence": "", "notes": "" },
        "B2_routing_navigation": { "score": 0, "evidence": "", "notes": "" },
        "B3_type_safety": { "score": 0, "evidence": "", "notes": "" },
        "B4_data_layer": { "score": 0, "evidence": "", "notes": "" }
      },
      "category_score": 0.0,
      "category_commentary": ""
    },
    "C_ui_ux_quality": {
      "weight": 0.20,
      "criteria": {
        "C1_visual_design": { "score": 0, "evidence": "", "notes": "" },
        "C2_responsive_design": { "score": 0, "evidence": "", "notes": "" },
        "C3_interactivity": { "score": 0, "evidence": "", "notes": "" },
        "C4_empty_error_loading_states": { "score": 0, "evidence": "", "notes": "" },
        "C5_design_token_usage": { "score": 0, "evidence": "", "notes": "" }
      },
      "category_score": 0.0,
      "category_commentary": ""
    },
    "D_prd_compliance": {
      "weight": 0.10,
      "criteria": {
        "D1_schema_adherence": { "score": 0, "evidence": "", "notes": "" },
        "D2_quadrant_logic_accuracy": { "score": 0, "evidence": "", "notes": "" },
        "D3_route_structure": { "score": 0, "evidence": "", "notes": "" },
        "D4_specification_details": { "score": 0, "evidence": "", "notes": "" }
      },
      "category_score": 0.0,
      "category_commentary": ""
    },
    "E_code_quality": {
      "weight": 0.15,
      "criteria": {
        "E1_separation_of_concerns": { "score": 0, "evidence": "", "notes": "" },
        "E2_readability_naming": { "score": 0, "evidence": "", "notes": "" },
        "E3_error_handling": { "score": 0, "evidence": "", "notes": "" },
        "E4_dependency_choices": { "score": 0, "evidence": "", "notes": "" }
      },
      "category_score": 0.0,
      "category_commentary": ""
    },
    "F_bonus_features": {
      "weight": 0.10,
      "criteria": {
        "F1_dashboard": { "score": 0, "evidence": "", "notes": "" },
        "F2_additional_pages": { "score": 0, "evidence": "", "notes": "" },
        "F3_search_filtering": { "score": 0, "evidence": "", "notes": "" },
        "F4_creative_additions": { "score": 0, "evidence": "", "notes": "" }
      },
      "category_score": 0.0,
      "category_commentary": ""
    },
    "G_decision_making": {
      "weight": 0.05,
      "criteria": {
        "G1_prioritization": { "score": 0, "evidence": "", "notes": "" },
        "G2_pr_description": { "score": 0, "evidence": "", "notes": "" }
      },
      "category_score": 0.0,
      "category_commentary": ""
    }
  },
  "git_history_bonus": {
    "H1_commit_cadence": { "points": 0, "evidence": "", "notes": "" },
    "H2_message_quality": { "points": 0, "evidence": "", "notes": "" },
    "H3_logical_progression": { "points": 0, "evidence": "", "notes": "" },
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
    "score_band": "Insufficient | Below Expectations | Competent | Strong | Exceptional",
    "automatic_failure": false,
    "automatic_failure_reasons": []
  },
  "qualitative_summary": {
    "top_strengths": [
      "string — most notable strength with evidence"
    ],
    "top_weaknesses": [
      "string — most notable weakness with evidence"
    ],
    "standout_moments": [
      "string — anything surprising, impressive, or concerning"
    ],
    "hiring_signal": "string — 2-3 sentence synthesis: what kind of developer is this person? What role would they thrive in? What are the risks?",
    "recommendation": "Strong Hire | Hire | Lean Hire | Lean No Hire | No Hire"
  }
}
```

---

## 8. Evaluator Prompt Template

When running this evaluation via an AI agent, use the following system prompt to ensure consistency:

```
You are evaluating a developer assessment submission for the Roadmap Engine project.

INSTRUCTIONS:
1. Read the evaluation framework document in its entirety.
2. Clone/read the candidate's repository.
3. Execute the Automated Gate Checks (Section 4). Record pass/fail for each.
4. For each rubric criterion (Sections 5A–5G):
   a. Read the relevant code/files
   b. Assign a score (0–4) using ONLY the definitions provided
   c. Cite specific file:line evidence for your score
   d. Add brief notes explaining your reasoning
5. Check git history for bonus points (Section 5H). Remember: absence of history is NOT penalized.
6. Calculate all scores per Section 6.
7. Write the qualitative summary with specific evidence.
8. Output the complete JSON evaluation per Section 7.

RULES:
- Do NOT compare to other submissions. Score against the rubric only.
- Do NOT infer intent. Score what exists, not what was attempted.
- Every score MUST have evidence. If you cannot find evidence, the score is 0.
- Use the EXACT quadrant reference truth:
  - PRJ-001 (8.6 value, 3.2 complexity) → 86/32 → Quick Wins
  - PRJ-002 (9.1 value, 8.2 complexity) → 91/82 → Big Bets
  - PRJ-003 (3.9 value, 2.8 complexity) → 39/28 → Fillers
  - PRJ-004 (4.1 value, 8.7 complexity) → 41/87 → Time Sinks
- TOOLTIP SPEC NOTE: The README specifies tooltips must show "Project Title & Quadrant Label." The PRD mentions "title + ROI" in its scatter-plot description. Accept either interpretation — score based on whether the tooltip contains meaningful, relevant project information. Do not penalize a candidate for following one source over the other.
- When in doubt between two scores, lean conservative but document the uncertainty in your notes field (e.g., "Borderline 2/3 — chose 2"). Multi-evaluator median aggregation will surface and reconcile disagreements.
```

---

## 9. Multi-Evaluator Methodology

Each candidate submission is evaluated by **3 or more independent evaluators** (AI agents and/or humans). This reduces individual evaluator bias and surfaces areas where the rubric may be ambiguous.

### 9.1 Directory Structure

```
evals/
  C-001/
    eval-agent-opus-1.json
    eval-agent-sonnet-2.json
    eval-human-1.json
  C-002/
    eval-agent-opus-1.json
    eval-agent-sonnet-2.json
    eval-human-1.json
```

Each JSON file validates against `evaluation/schema.json` (JSON Schema 2020-12).

### 9.2 Aggregation Rules

| Data Type | Aggregation Method | Rationale |
|-----------|-------------------|-----------|
| **Rubric scores (0–4)** | **Median** per criterion | Robust to one outlier evaluator. A single harsh or generous agent doesn't skew results. |
| **Automated gate checks** | **Unanimous pass required** | If ANY evaluator flags a gate failure, it's flagged in consensus. Conservative — a broken build is a broken build. |
| **Git history bonus** | **Max** across evaluators | If one evaluator noticed good commit practices, credit it. Bonus should not be lost because one agent didn't inspect git. |
| **Recommendation** | **Median by ordinal position** | Maps recommendations to ordinal (Strong Hire=0 ... No Hire=4), takes median, maps back. |
| **Qualitative notes** | **Collected, not merged** | All strengths, weaknesses, and standout moments from all evaluators are preserved. Human reviewer sees the full picture. |

### 9.3 Inter-Evaluator Agreement Analysis

For every criterion, we compute the **standard deviation** across evaluator scores:

| Std Dev | Agreement Level | Action |
|---------|----------------|--------|
| ≤ 0.5 | **Strong** | Scores are reliable. No action needed. |
| 0.5–1.0 | **Moderate** | Minor disagreement. Consensus score is still reliable. |
| > 1.0 | **Weak** | **Flag for human review.** Evaluators meaningfully disagree on this criterion. |

Additionally, if a specific criterion shows **weak agreement across 2+ candidates**, it's flagged as a "frequently divergent criterion" — a signal that the rubric definition for that criterion may need refinement.

### 9.4 Running the Aggregation

```bash
# From the evaluation/ directory:
node aggregate.js ../evals/ --output ../evals/output/

# Outputs:
#   evals/output/consensus-C-001.json   — per-candidate aggregated scores
#   evals/output/consensus-C-002.json
#   evals/output/comparison.json         — cross-candidate ranking
#   evals/output/comparison.md           — human-readable comparison table
#   evals/output/agreement-report.json   — inter-evaluator reliability
```

### 9.5 Consensus Output Structure

Each `consensus-C-XXX.json` file contains:

- **Per-criterion consensus scores** (median) with individual evaluator scores, mean, std dev, and agreement level
- **Per-category scores** calculated from consensus criterion scores
- **Gate check consensus** with per-evaluator results and unanimous/split indicator
- **Git bonus** (max-based)
- **Final score, band, and automatic failure status**
- **All qualitative notes** collected from every evaluator
- **Consensus recommendation** (ordinal median)
- **Inter-evaluator analysis**: divergence count, flagged criteria, overall agreement level

---

## 10. Post-Evaluation: Comparative Analysis

After all submissions are individually evaluated and aggregated, the comparison table is generated automatically by `evaluation/aggregate.js`:

```
| Rank | Candidate | Score | Band       | Matrix | Tech | UI/UX | PRD | Code | Bonus | Decision | Rec         | Agreement |
|------|-----------|-------|------------|--------|------|-------|-----|------|-------|----------|-------------|-----------|
| 1    | C-003     | 82.5  | Strong     | 87.5   | 81.3 | 85.0  | 75  | 81.3 | 56.3  | 75.0     | Hire        | strong    |
| 2    | C-001     | 71.2  | Competent  | 79.2   | 68.8 | 70.0  | 62  | 68.8 | 43.8  | 62.5     | Lean Hire   | moderate  |
| 3    | C-002     | 48.0  | Below Exp. | 54.2   | 50.0 | 45.0  | 50  | 50.0 | 25.0  | 37.5     | Lean No     | weak      |
```

This table enables rapid comparison while preserving the per-category visibility needed for nuanced hiring decisions. A candidate who scores 95 on UI/UX but 50 on Code Quality is a different profile than one who scores 70/70 — and you can see that immediately.

The **Agreement** column is critical: a "weak" agreement means evaluators disagreed significantly on that candidate, and the scores deserve closer human inspection before making a decision.

---

## 11. File Inventory

| File | Purpose |
|------|---------|
| `evaluation-framework.md` | This document. The rubric, methodology, and protocol. |
| `evaluation/schema.json` | JSON Schema (2020-12) for validating individual evaluation files. |
| `evaluation/aggregate.js` | Node.js script that consumes evaluation JSONs, validates, aggregates, and produces comparison outputs. |
