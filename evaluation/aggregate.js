#!/usr/bin/env node

/**
 * Evaluation Aggregator for Roadmap Engine Developer Assessment
 *
 * Consumes multiple evaluation JSON files (3+ per candidate),
 * validates against schema, and produces:
 *   1. Per-candidate consensus scores (median-based)
 *   2. Inter-evaluator agreement analysis
 *   3. Comparative ranking across all candidates
 *
 * Usage:
 *   node aggregate.js <evals-directory> [--output <output-dir>]
 *
 * Directory structure expected:
 *   evals/
 *     C-001/
 *       eval-agent-opus-1.json
 *       eval-agent-sonnet-2.json
 *       eval-human-1.json
 *     C-002/
 *       eval-agent-opus-1.json
 *       ...
 *
 * Outputs:
 *   output/
 *     consensus-C-001.json    — aggregated scores for each candidate
 *     consensus-C-002.json
 *     comparison.json          — cross-candidate ranking
 *     comparison.md            — human-readable comparison table
 *     agreement-report.json    — inter-evaluator reliability analysis
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, basename } from "node:path";

// ---------------------------------------------------------------------------
// Schema validation (lightweight — checks structure, types, and constraints)
// ---------------------------------------------------------------------------

const CATEGORIES = [
  "A_strategy_matrix",
  "B_technical_foundation",
  "C_ui_ux_quality",
  "D_prd_compliance",
  "E_code_quality",
  "F_bonus_features",
  "G_decision_making",
];

const CRITERIA_MAP = {
  A_strategy_matrix: [
    "A1_data_population",
    "A2_score_normalization",
    "A3_quadrant_assignment",
    "A4_scatter_plot_rendering",
    "A5_tooltip_implementation",
    "A6_logic_ui_separation",
  ],
  B_technical_foundation: [
    "B1_project_setup",
    "B2_routing_navigation",
    "B3_type_safety",
    "B4_data_layer",
  ],
  C_ui_ux_quality: [
    "C1_visual_design",
    "C2_responsive_design",
    "C3_interactivity",
    "C4_empty_error_loading_states",
    "C5_design_token_usage",
  ],
  D_prd_compliance: [
    "D1_schema_adherence",
    "D2_quadrant_logic_accuracy",
    "D3_route_structure",
    "D4_specification_details",
  ],
  E_code_quality: [
    "E1_separation_of_concerns",
    "E2_readability_naming",
    "E3_error_handling",
    "E4_dependency_choices",
  ],
  F_bonus_features: [
    "F1_dashboard",
    "F2_additional_pages",
    "F3_search_filtering",
    "F4_creative_additions",
  ],
  G_decision_making: [
    "G1_prioritization",
    "G2_pr_description",
  ],
};

const WEIGHTS = {
  A_strategy_matrix: 0.30,
  B_technical_foundation: 0.15,
  C_ui_ux_quality: 0.15,
  D_prd_compliance: 0.10,
  E_code_quality: 0.20,
  F_bonus_features: 0.05,
  G_decision_making: 0.05,
};

const GATE_CHECKS = [
  "G1_package_json_exists",
  "G2_install_succeeds",
  "G3_build_succeeds",
  "G4_matrix_route_exists",
  "G5_project_files_exist",
  "G6_chart_library_installed",
  "G7_normalization_logic_exists",
  "G8_quadrant_logic_exists",
  "G9_chart_renders_data",
  "G10_tooltips_implemented",
];

const GIT_BONUS_COMPONENTS = [
  "H1_commit_cadence",
  "H2_message_quality",
  "H3_logical_progression",
];

const AI_BONUS_COMPONENTS = [
  "I1_ai_vision_planning",
  "I2_ai_implementation",
  "I3_ai_integration_quality",
];

const SCORE_BANDS = [
  { min: 90, label: "Exceptional" },
  { min: 75, label: "Strong" },
  { min: 60, label: "Competent" },
  { min: 45, label: "Below Expectations" },
  { min: 0, label: "Insufficient" },
];

const RECOMMENDATION_ORDER = [
  "Strong Hire",
  "Hire",
  "Lean Hire",
  "Lean No Hire",
  "No Hire",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function mean(values) {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function stddev(values) {
  if (values.length <= 1) return 0;
  const avg = mean(values);
  const squareDiffs = values.map((v) => (v - avg) ** 2);
  return Math.sqrt(squareDiffs.reduce((s, v) => s + v, 0) / (values.length - 1));
}

function scoreBand(score) {
  for (const band of SCORE_BANDS) {
    if (score >= band.min) return band.label;
  }
  return "Insufficient";
}

function categoryScore(criteriaScores, criteriaCount) {
  const sum = criteriaScores.reduce((s, v) => s + v, 0);
  return (sum / (criteriaCount * 4)) * 100;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateEvaluation(eval_, filePath) {
  const errors = [];
  const warn = (msg) => errors.push(`${filePath}: ${msg}`);

  if (!eval_.evaluation_metadata?.candidate_id) warn("Missing candidate_id");
  if (!eval_.evaluation_metadata?.evaluator) warn("Missing evaluator");

  // Gate checks
  if (!eval_.automated_gate) {
    warn("Missing automated_gate");
  } else {
    for (const gk of GATE_CHECKS) {
      if (eval_.automated_gate[gk] === undefined) {
        warn(`Missing gate check: ${gk}`);
      }
    }
  }

  // Rubric scores
  if (!eval_.rubric_scores) {
    warn("Missing rubric_scores");
  } else {
    for (const cat of CATEGORIES) {
      if (!eval_.rubric_scores[cat]) {
        warn(`Missing category: ${cat}`);
        continue;
      }
      const criteria = eval_.rubric_scores[cat].criteria;
      if (!criteria) {
        warn(`Missing criteria in ${cat}`);
        continue;
      }
      for (const crit of CRITERIA_MAP[cat]) {
        if (!criteria[crit]) {
          warn(`Missing criterion: ${cat}.${crit}`);
        } else {
          const s = criteria[crit].score;
          if (typeof s !== "number" || s < 0 || s > 4 || !Number.isInteger(s)) {
            warn(`Invalid score for ${crit}: ${s} (must be integer 0-4)`);
          }
        }
      }
    }
  }

  // Git bonus
  if (!eval_.git_history_bonus) {
    warn("Missing git_history_bonus");
  } else {
    const gb = eval_.git_history_bonus;
    if (typeof gb.bonus_total !== "number" || gb.bonus_total < 0 || gb.bonus_total > 5) {
      warn(`Invalid git bonus_total: ${gb.bonus_total}`);
    }
  }

  // AI integration bonus (optional — v1.0 evals may not have this field)
  if (eval_.ai_integration_bonus) {
    const ab = eval_.ai_integration_bonus;
    const aiComponents = {
      I1_ai_vision_planning: 2,
      I2_ai_implementation: 2,
      I3_ai_integration_quality: 1,
    };
    for (const [key, maxPts] of Object.entries(aiComponents)) {
      if (ab[key] !== undefined) {
        const pts = ab[key]?.points;
        if (typeof pts !== "number" || pts < 0 || pts > maxPts || !Number.isInteger(pts)) {
          warn(`Invalid AI bonus points for ${key}: ${pts} (must be integer 0-${maxPts})`);
        }
      }
    }
    if (typeof ab.bonus_total !== "number" || ab.bonus_total < 0 || ab.bonus_total > 5) {
      warn(`Invalid AI bonus_total: ${ab.bonus_total}`);
    }
  }

  // Scoring summary
  if (!eval_.scoring_summary) {
    warn("Missing scoring_summary");
  }

  // Qualitative summary
  if (!eval_.qualitative_summary) {
    warn("Missing qualitative_summary");
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Extraction helpers — pull parallel arrays of scores from multiple evals
// ---------------------------------------------------------------------------

function extractCriterionScores(evals, category, criterion) {
  return evals
    .map((e) => e.rubric_scores?.[category]?.criteria?.[criterion]?.score)
    .filter((s) => typeof s === "number");
}

function extractGateResults(evals, gateKey) {
  return evals
    .map((e) => {
      const g = e.automated_gate?.[gateKey];
      return g ? g.pass : undefined;
    })
    .filter((v) => typeof v === "boolean");
}

function extractGitBonusComponent(evals, key) {
  return evals
    .map((e) => e.git_history_bonus?.[key]?.points)
    .filter((s) => typeof s === "number");
}

function extractAiBonusComponent(evals, key) {
  return evals
    .map((e) => e.ai_integration_bonus?.[key]?.points)
    .filter((s) => typeof s === "number");
}

function extractRecommendations(evals) {
  return evals
    .map((e) => e.qualitative_summary?.recommendation)
    .filter((r) => typeof r === "string" && RECOMMENDATION_ORDER.includes(r));
}

function extractStrengths(evals) {
  const all = [];
  for (const e of evals) {
    if (Array.isArray(e.qualitative_summary?.top_strengths)) {
      all.push(...e.qualitative_summary.top_strengths);
    }
  }
  return all;
}

function extractWeaknesses(evals) {
  const all = [];
  for (const e of evals) {
    if (Array.isArray(e.qualitative_summary?.top_weaknesses)) {
      all.push(...e.qualitative_summary.top_weaknesses);
    }
  }
  return all;
}

function extractStandouts(evals) {
  const all = [];
  for (const e of evals) {
    if (Array.isArray(e.qualitative_summary?.standout_moments)) {
      all.push(...e.qualitative_summary.standout_moments);
    }
  }
  return all;
}

function extractHiringSignals(evals) {
  return evals
    .map((e) => e.qualitative_summary?.hiring_signal)
    .filter((s) => typeof s === "string" && s.length > 0);
}

// ---------------------------------------------------------------------------
// Consensus builder — takes N evals for one candidate, returns consensus
// ---------------------------------------------------------------------------

function buildConsensus(candidateId, evals) {
  const evaluatorIds = evals.map((e) => e.evaluation_metadata?.evaluator || "unknown");
  const divergences = []; // criteria where std dev > 1.0

  // --- Gate consensus: majority pass (>50% of evaluators) ---
  // Unanimous is too conservative for AI evaluators — transient environment
  // issues (npm timeouts, port conflicts) can produce false negatives.
  // Split results are flagged for human review via the agreement field.
  const gateConsensus = {};
  for (const gk of GATE_CHECKS) {
    const results = extractGateResults(evals, gk);
    const passCount = results.filter((r) => r === true).length;
    const failCount = results.filter((r) => r === false).length;
    const majorityPass = results.length > 0 && passCount > failCount;
    const allAgree = results.length > 0 && (passCount === 0 || failCount === 0);
    gateConsensus[gk] = {
      consensus_pass: majorityPass,
      evaluator_results: results,
      pass_count: passCount,
      fail_count: failCount,
      agreement: results.length > 0 ? (allAgree ? "unanimous" : "split") : "no_data",
    };
  }

  // Recompute automatic failure deterministically from consensus gate results
  // (not inherited from individual evaluator opinions)
  const AUTO_FAIL_GATE_MAP = {
    G3_build_succeeds: "Project does not build (npm run build fails)",
    G4_matrix_route_exists: "Matrix route (/matrix) does not exist or renders nothing",
    G9_chart_renders_data: "No scatter plot or chart renders data",
  };
  const autoFailReasons = [];
  for (const [gk, reason] of Object.entries(AUTO_FAIL_GATE_MAP)) {
    const gc = gateConsensus[gk];
    if (gc && gc.agreement !== "no_data" && !gc.consensus_pass) {
      autoFailReasons.push(reason);
    }
  }
  const autoFailTriggered = autoFailReasons.length > 0;

  // --- Rubric consensus: median per criterion ---
  const rubricConsensus = {};
  for (const cat of CATEGORIES) {
    const criteriaConsensus = {};
    for (const crit of CRITERIA_MAP[cat]) {
      const scores = extractCriterionScores(evals, cat, crit);
      const med = median(scores);
      const sd = stddev(scores);
      const mn = mean(scores);

      if (sd > 1.0) {
        divergences.push({
          criterion: crit,
          category: cat,
          scores,
          evaluators: evaluatorIds,
          std_dev: Math.round(sd * 100) / 100,
          note: "High disagreement — flag for human review",
        });
      }

      criteriaConsensus[crit] = {
        consensus_score: med,
        mean: Math.round(mn * 100) / 100,
        std_dev: Math.round(sd * 100) / 100,
        individual_scores: scores,
        agreement: sd <= 0.5 ? "strong" : sd <= 1.0 ? "moderate" : "weak",
      };
    }

    const consensusScores = CRITERIA_MAP[cat].map(
      (crit) => criteriaConsensus[crit].consensus_score
    );
    const catScore = categoryScore(consensusScores, CRITERIA_MAP[cat].length);

    rubricConsensus[cat] = {
      weight: WEIGHTS[cat],
      criteria: criteriaConsensus,
      category_score: Math.round(catScore * 100) / 100,
    };
  }

  // --- Git bonus: take MAX across evaluators ---
  const h1Scores = extractGitBonusComponent(evals, "H1_commit_cadence");
  const h2Scores = extractGitBonusComponent(evals, "H2_message_quality");
  const h3Scores = extractGitBonusComponent(evals, "H3_logical_progression");
  const gitBonus = {
    H1_commit_cadence: { max: Math.max(0, ...h1Scores), individual_scores: h1Scores },
    H2_message_quality: { max: Math.max(0, ...h2Scores), individual_scores: h2Scores },
    H3_logical_progression: { max: Math.max(0, ...h3Scores), individual_scores: h3Scores },
    bonus_total: Math.min(
      5,
      Math.max(0, ...h1Scores) + Math.max(0, ...h2Scores) + Math.max(0, ...h3Scores)
    ),
  };

  // --- AI integration bonus: take MAX across evaluators (backward-compatible) ---
  const i1Scores = extractAiBonusComponent(evals, "I1_ai_vision_planning");
  const i2Scores = extractAiBonusComponent(evals, "I2_ai_implementation");
  const i3Scores = extractAiBonusComponent(evals, "I3_ai_integration_quality");
  const aiBonus = {
    I1_ai_vision_planning: { max: Math.max(0, ...i1Scores.length ? i1Scores : [0]), individual_scores: i1Scores },
    I2_ai_implementation: { max: Math.max(0, ...i2Scores.length ? i2Scores : [0]), individual_scores: i2Scores },
    I3_ai_integration_quality: { max: Math.max(0, ...i3Scores.length ? i3Scores : [0]), individual_scores: i3Scores },
    bonus_total: Math.min(
      5,
      Math.max(0, ...i1Scores.length ? i1Scores : [0]) +
      Math.max(0, ...i2Scores.length ? i2Scores : [0]) +
      Math.max(0, ...i3Scores.length ? i3Scores : [0])
    ),
  };

  // --- Final score ---
  let weightedScore = 0;
  const categoryScores = {};
  for (const cat of CATEGORIES) {
    categoryScores[cat] = rubricConsensus[cat].category_score;
    weightedScore += rubricConsensus[cat].category_score * WEIGHTS[cat];
  }
  weightedScore = Math.round(weightedScore * 100) / 100;
  const finalScore = Math.round((weightedScore + gitBonus.bonus_total + aiBonus.bonus_total) * 100) / 100;

  // --- Recommendation consensus: median by ordinal position ---
  const recs = extractRecommendations(evals);
  const recIndices = recs.map((r) => RECOMMENDATION_ORDER.indexOf(r));
  const medianRecIndex = Math.round(median(recIndices));
  const consensusRecommendation = RECOMMENDATION_ORDER[medianRecIndex] || "No consensus";

  return {
    candidate_id: candidateId,
    evaluator_count: evals.length,
    evaluators: evaluatorIds,
    confidence: evals.length >= 3 ? "full" : "provisional",
    automated_gate: {
      checks: gateConsensus,
      automatic_failure: autoFailTriggered,
      failure_reasons: autoFailReasons,
    },
    rubric_consensus: rubricConsensus,
    git_history_bonus: gitBonus,
    ai_integration_bonus: aiBonus,
    scoring_summary: {
      category_scores: categoryScores,
      weighted_score: weightedScore,
      git_bonus: gitBonus.bonus_total,
      ai_bonus: aiBonus.bonus_total,
      final_score: finalScore,
      score_band: scoreBand(finalScore),
      automatic_failure: autoFailTriggered,
      automatic_failure_reasons: autoFailReasons,
    },
    qualitative_consensus: {
      all_strengths: extractStrengths(evals),
      all_weaknesses: extractWeaknesses(evals),
      all_standout_moments: extractStandouts(evals),
      hiring_signals: extractHiringSignals(evals),
      individual_recommendations: recs,
      consensus_recommendation: consensusRecommendation,
    },
    inter_evaluator_analysis: {
      total_criteria_evaluated: Object.values(CRITERIA_MAP).flat().length,
      high_divergence_criteria: divergences,
      divergence_count: divergences.length,
      overall_agreement: divergences.length === 0
        ? "strong"
        : divergences.length <= 3
          ? "moderate"
          : "weak",
    },
  };
}

// ---------------------------------------------------------------------------
// Comparison builder — takes all consensus results, ranks candidates
// ---------------------------------------------------------------------------

function buildComparison(consensusResults) {
  const ranked = [...consensusResults].sort(
    (a, b) => b.scoring_summary.final_score - a.scoring_summary.final_score
  );

  return {
    generated_at: new Date().toISOString(),
    candidate_count: ranked.length,
    ranking: ranked.map((c, i) => ({
      rank: i + 1,
      candidate_id: c.candidate_id,
      final_score: c.scoring_summary.final_score,
      score_band: c.scoring_summary.score_band,
      weighted_score: c.scoring_summary.weighted_score,
      git_bonus: c.scoring_summary.git_bonus,
      ai_bonus: c.scoring_summary.ai_bonus,
      automatic_failure: c.scoring_summary.automatic_failure,
      category_scores: c.scoring_summary.category_scores,
      consensus_recommendation: c.qualitative_consensus.consensus_recommendation,
      evaluator_count: c.evaluator_count,
      evaluator_agreement: c.inter_evaluator_analysis.overall_agreement,
    })),
  };
}

function buildComparisonMarkdown(comparison) {
  const lines = [];
  lines.push("# Candidate Comparison Report");
  lines.push("");
  lines.push(`Generated: ${comparison.generated_at}`);
  lines.push(`Candidates evaluated: ${comparison.candidate_count}`);
  lines.push("");

  // Summary table
  lines.push("## Rankings");
  lines.push("");
  lines.push(
    "| Rank | Candidate | Score | Band | Matrix | Tech | UI/UX | PRD | Code | Bonus | Decision | AI | Rec | Agreement |"
  );
  lines.push(
    "|------|-----------|-------|------|--------|------|-------|-----|------|-------|----------|----|-----|-----------|"
  );

  for (const r of comparison.ranking) {
    const cs = r.category_scores;
    const fail = r.automatic_failure ? " **FAIL**" : "";
    lines.push(
      `| ${r.rank} ` +
      `| ${r.candidate_id}${fail} ` +
      `| ${r.final_score} ` +
      `| ${r.score_band} ` +
      `| ${cs.A_strategy_matrix} ` +
      `| ${cs.B_technical_foundation} ` +
      `| ${cs.C_ui_ux_quality} ` +
      `| ${cs.D_prd_compliance} ` +
      `| ${cs.E_code_quality} ` +
      `| ${cs.F_bonus_features} ` +
      `| ${cs.G_decision_making} ` +
      `| ${r.ai_bonus} ` +
      `| ${r.consensus_recommendation} ` +
      `| ${r.evaluator_agreement} |`
    );
  }

  lines.push("");
  lines.push("## Category Weights");
  lines.push("");
  lines.push("| Category | Weight |");
  lines.push("|----------|--------|");
  lines.push("| A: Strategy Matrix | 30% |");
  lines.push("| B: Technical Foundation | 15% |");
  lines.push("| C: UI/UX Quality | 15% |");
  lines.push("| D: PRD Compliance | 10% |");
  lines.push("| E: Code Quality | 20% |");
  lines.push("| F: Bonus Features | 5% |");
  lines.push("| G: Decision Making | 5% |");
  lines.push("");
  lines.push("## Score Bands");
  lines.push("");
  lines.push("| Range | Band |");
  lines.push("|-------|------|");
  lines.push("| 90-110 | Exceptional |");
  lines.push("| 75-89 | Strong |");
  lines.push("| 60-74 | Competent |");
  lines.push("| 45-59 | Below Expectations |");
  lines.push("| 0-44 | Insufficient |");
  lines.push("");
  lines.push(
    "> **Note:** Final scores include up to 5 bonus points for git history and up to 5 bonus points for AI integration. " +
    "Automatic failure flags are noted but candidates still receive scores for comparative purposes."
  );

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Agreement report
// ---------------------------------------------------------------------------

function buildAgreementReport(consensusResults) {
  const allDivergences = [];
  for (const c of consensusResults) {
    for (const d of c.inter_evaluator_analysis.high_divergence_criteria) {
      allDivergences.push({
        candidate_id: c.candidate_id,
        ...d,
      });
    }
  }

  // Find criteria that are frequently divergent across candidates
  const critFreq = {};
  for (const d of allDivergences) {
    critFreq[d.criterion] = (critFreq[d.criterion] || 0) + 1;
  }

  const problematicCriteria = Object.entries(critFreq)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .map(([crit, count]) => ({
      criterion: crit,
      divergence_count_across_candidates: count,
      note: "This criterion frequently produces evaluator disagreement. Consider refining its rubric definition.",
    }));

  return {
    generated_at: new Date().toISOString(),
    total_candidates: consensusResults.length,
    total_divergences: allDivergences.length,
    all_divergences: allDivergences,
    frequently_divergent_criteria: problematicCriteria,
    summary:
      allDivergences.length === 0
        ? "Strong inter-evaluator agreement across all candidates and criteria."
        : `${allDivergences.length} high-divergence instances found across ${consensusResults.length} candidates. ` +
          `${problematicCriteria.length} criteria show recurring disagreement and may need rubric refinement.`,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    console.log(`
Roadmap Engine Evaluation Aggregator

Usage:
  node aggregate.js <evals-directory> [--output <output-dir>]

Expected directory structure:
  <evals-directory>/
    C-001/
      eval-agent-opus-1.json
      eval-agent-sonnet-2.json
      eval-human-1.json
    C-002/
      eval-agent-opus-1.json
      ...

Outputs (written to <output-dir>, default: ./output):
  consensus-C-001.json    Per-candidate aggregated scores
  consensus-C-002.json
  comparison.json          Cross-candidate ranking
  comparison.md            Human-readable comparison table
  agreement-report.json    Inter-evaluator reliability analysis
`);
    process.exit(0);
  }

  const evalsDir = args[0];
  const outputIdx = args.indexOf("--output");
  const outputDir = outputIdx >= 0 && args[outputIdx + 1] ? args[outputIdx + 1] : join(evalsDir, "output");

  if (!existsSync(evalsDir)) {
    console.error(`Error: Directory not found: ${evalsDir}`);
    process.exit(1);
  }

  // Discover candidate directories
  const entries = readdirSync(evalsDir).filter((e) => {
    const full = join(evalsDir, e);
    return statSync(full).isDirectory() && e.startsWith("C-");
  });

  if (entries.length === 0) {
    console.error(`Error: No candidate directories (C-XXX) found in ${evalsDir}`);
    process.exit(1);
  }

  console.log(`Found ${entries.length} candidate(s): ${entries.join(", ")}`);

  // Ensure output directory
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const allConsensus = [];
  let totalErrors = 0;

  for (const candidateDir of entries.sort()) {
    const dirPath = join(evalsDir, candidateDir);
    const evalFiles = readdirSync(dirPath).filter((f) => f.endsWith(".json"));

    if (evalFiles.length === 0) {
      console.warn(`  Warning: No JSON files found in ${dirPath}, skipping.`);
      continue;
    }

    console.log(`\n  ${candidateDir}: ${evalFiles.length} evaluation(s)`);

    const evals = [];
    for (const file of evalFiles) {
      const filePath = join(dirPath, file);
      try {
        const raw = readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        const errors = validateEvaluation(parsed, filePath);
        if (errors.length > 0) {
          console.error(`    REJECTED ${file} (${errors.length} validation error(s)):`);
          for (const err of errors) {
            console.error(`      - ${err}`);
          }
          totalErrors += errors.length;
          continue;
        }
        evals.push(parsed);
        console.log(`    Loaded: ${file} (evaluator: ${parsed.evaluation_metadata?.evaluator || "unknown"})`);
      } catch (err) {
        console.error(`    Error reading ${file}: ${err.message}`);
        totalErrors++;
      }
    }

    if (evals.length === 0) {
      console.warn(`  No valid evaluations for ${candidateDir}, skipping.`);
      continue;
    }
    if (evals.length < 3) {
      console.warn(`  Warning: Only ${evals.length} valid evaluation(s) for ${candidateDir}. Methodology requires 3+. Results will be marked provisional.`);
    }

    const consensus = buildConsensus(candidateDir, evals);
    allConsensus.push(consensus);

    const outPath = join(outputDir, `consensus-${candidateDir}.json`);
    writeFileSync(outPath, JSON.stringify(consensus, null, 2));
    console.log(`    Consensus written: ${outPath}`);
    console.log(
      `    Score: ${consensus.scoring_summary.final_score} (${consensus.scoring_summary.score_band})` +
      `${consensus.scoring_summary.automatic_failure ? " **AUTO-FAIL**" : ""}`
    );

    if (consensus.inter_evaluator_analysis.divergence_count > 0) {
      console.log(
        `    Divergences: ${consensus.inter_evaluator_analysis.divergence_count} criteria need human review`
      );
    }
  }

  // --- Cross-candidate comparison ---
  if (allConsensus.length > 0) {
    const comparison = buildComparison(allConsensus);
    writeFileSync(join(outputDir, "comparison.json"), JSON.stringify(comparison, null, 2));

    const comparisonMd = buildComparisonMarkdown(comparison);
    writeFileSync(join(outputDir, "comparison.md"), comparisonMd);

    const agreementReport = buildAgreementReport(allConsensus);
    writeFileSync(join(outputDir, "agreement-report.json"), JSON.stringify(agreementReport, null, 2));

    console.log("\n--- Summary ---");
    console.log(`Candidates processed: ${allConsensus.length}`);
    console.log(`Validation issues: ${totalErrors}`);
    console.log(`\nOutputs written to: ${outputDir}/`);
    console.log("  - consensus-C-XXX.json  (per-candidate)");
    console.log("  - comparison.json        (ranking)");
    console.log("  - comparison.md          (readable table)");
    console.log("  - agreement-report.json  (evaluator reliability)");

    console.log("\n--- Rankings ---");
    for (const r of comparison.ranking) {
      const fail = r.automatic_failure ? " [AUTO-FAIL]" : "";
      console.log(
        `  #${r.rank}  ${r.candidate_id}  ${r.final_score} pts  ${r.score_band}  ${r.consensus_recommendation}${fail}`
      );
    }
  }
}

main();
