import fs from "node:fs";
import path from "node:path";
import {
  execFileSync,
  spawnSync,
} from "node:child_process";
import {
  fileURLToPath,
} from "node:url";

export const DISCOVERY_SCHEMA_VERSION =
  "performance-scoring-discovery.v1";

export const DEFAULT_SOURCE_REF =
  "activity-foundation-v1";

export const SCAN_ENGINE =
  "git-grep-batch.v1";

export const TERMS = Object.freeze([
  Object.freeze({
    id: "POINT",
    regex:
      /\bpoints?\b|\bpuntos?\b/iu,
  }),
  Object.freeze({
    id: "SCORE",
    regex:
      /\bscore(?:s|d|ing)?\b|\bpuntuaci[oó]n(?:es)?\b/iu,
  }),
  Object.freeze({
    id: "WEIGHT",
    regex:
      /\bweights?\b|\bweighted\b|\bponderaci[oó]n(?:es)?\b|\bpesos?\b/iu,
  }),
  Object.freeze({
    id: "MULTIPLIER",
    regex:
      /\bmultipliers?\b|\bmultiplicador(?:es)?\b/iu,
  }),
  Object.freeze({
    id: "RANKING",
    regex:
      /\brank(?:ing|ed|s)?\b|\bclasificaci[oó]n(?:es)?\b/iu,
  }),
  Object.freeze({
    id: "STREAK",
    regex:
      /\bstreaks?\b|\brachas?\b/iu,
  }),
  Object.freeze({
    id: "TARGET",
    regex:
      /\btargets?\b|\bmetas?\b|\bobjetivos?\b/iu,
  }),
  Object.freeze({
    id: "QUOTA",
    regex:
      /\bquotas?\b|\bcuotas?\b/iu,
  }),
  Object.freeze({
    id: "PERFORMANCE",
    regex:
      /\bperformance\b|\brendimiento\b|\bdesempe[nñ]o\b/iu,
  }),
  Object.freeze({
    id: "PRODUCTIVITY",
    regex:
      /\bproductivity\b|\bproductividad\b/iu,
  }),
  Object.freeze({
    id: "KPI",
    regex:
      /\bkpis?\b|\bindicadores?\s+clave\b/iu,
  }),
  Object.freeze({
    id: "EVALUABLE_DAY",
    regex:
      /\bevaluable(?:\s+days?)?\b|\bd[ií]as?\s+evaluables?\b|\bbusiness\s+days?\b|\bworking\s+days?\b|\bd[ií]as?\s+h[aá]biles?\b/iu,
  }),
  Object.freeze({
    id: "CONVERSION",
    regex:
      /\bconversion\s+rates?\b|\btasas?\s+de\s+conversi[oó]n\b/iu,
  }),
]);

const TEXT_EXTENSIONS =
  new Set([
    ".cjs",
    ".css",
    ".csv",
    ".html",
    ".js",
    ".json",
    ".jsx",
    ".md",
    ".mjs",
    ".sql",
    ".svg",
    ".toml",
    ".ts",
    ".tsx",
    ".txt",
    ".yaml",
    ".yml",
  ]);

const CANDIDATE_STEMS =
  Object.freeze([
    "point",
    "punto",
    "score",
    "puntuaci",
    "weight",
    "ponderaci",
    "peso",
    "multiplier",
    "multiplicador",
    "rank",
    "clasificaci",
    "streak",
    "racha",
    "target",
    "meta",
    "objetivo",
    "quota",
    "cuota",
    "performance",
    "rendimiento",
    "desempe",
    "productivity",
    "productividad",
    "kpi",
    "indicador",
    "evaluable",
    "business day",
    "working day",
    "día",
    "dia",
    "hábil",
    "habil",
    "conversion",
    "conversión",
  ]);

function gitArgs(repository, args) {
  return [
    "-c",
    "safe.directory=*",
    "-C",
    repository,
    ...args,
  ];
}

function gitText(repository, args) {
  return execFileSync(
    "git",
    gitArgs(repository, args),
    {
      encoding: "utf8",
      maxBuffer:
        64 * 1024 * 1024,
    },
  );
}

export function repositoryFromScript() {
  return path.resolve(
    path.dirname(
      fileURLToPath(import.meta.url),
    ),
    "../..",
  );
}

export function classifyPath(value) {
  const lower =
    value
      .replaceAll("\\", "/")
      .toLowerCase();

  if (
    lower.startsWith(
      "advisor-os/activity/",
    ) ||
    lower.includes(
      "activity-foundation-freeze",
    )
  ) {
    return "FROZEN_ACTIVITY_REFERENCE";
  }

  if (
    lower.startsWith(
      "advisor-os/performance/",
    ) ||
    lower.startsWith(
      "performance/",
    )
  ) {
    return "PERFORMANCE_CANDIDATE";
  }

  if (
    lower.startsWith(
      "docs/99-archive/",
    ) ||
    lower.includes("/legacy/")
  ) {
    return "LEGACY_ARCHIVE";
  }

  if (lower.startsWith("tests/")) {
    return "TEST";
  }

  if (
    lower.startsWith(".github/") ||
    lower.startsWith("scripts/ci/")
  ) {
    return "AUTOMATION";
  }

  if (
    lower.startsWith(
      "docs/evidence/",
    )
  ) {
    return "EVIDENCE";
  }

  if (lower.startsWith("docs/")) {
    return "DOCUMENTATION";
  }

  return "RUNTIME_OR_PLATFORM";
}

export function matchLine(line) {
  return Object.freeze(
    TERMS
      .filter(
        (term) =>
          term.regex.test(line),
      )
      .map((term) => term.id)
      .sort(),
  );
}

function snippet(value) {
  return value
    .replaceAll("\t", " ")
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, 300)
    .trimEnd();
}

function stableCounts(map) {
  return Object.fromEntries(
    [...map.entries()].sort(
      ([left], [right]) =>
        left.localeCompare(right),
    ),
  );
}

function trackedFiles(
  repository,
  sourceRef,
) {
  return gitText(
    repository,
    [
      "ls-tree",
      "-r",
      "--name-only",
      sourceRef,
    ],
  )
    .split(/\r?\n/u)
    .map((value) => value.trim())
    .filter(Boolean)
    .sort();
}

function batchCandidateLines(
  repository,
  sourceRef,
) {
  const patternArguments =
    CANDIDATE_STEMS.flatMap(
      (stem) => [
        "-e",
        stem,
      ],
    );

  const result =
    spawnSync(
      "git",
      gitArgs(
        repository,
        [
          "grep",
          "-n",
          "-I",
          "-i",
          ...patternArguments,
          sourceRef,
        ],
      ),
      {
        encoding: "utf8",
        maxBuffer:
          128 * 1024 * 1024,
      },
    );

  if (result.error) {
    throw result.error;
  }

  if (
    result.status !== 0 &&
    result.status !== 1
  ) {
    throw new Error(
      "PerformanceScoringDiscovery: " +
      (
        result.stderr?.trim() ||
        `git grep failed with ${result.status}`
      ),
    );
  }

  return (
    result.stdout ?? ""
  )
    .split(/\r?\n/u)
    .filter(Boolean);
}

function parseGrepLine(
  value,
  sourceRef,
) {
  const match =
    value.match(
      /^(.*):([0-9]+):(.*)$/u,
    );

  if (!match) {
    return null;
  }

  const prefix =
    `${sourceRef}:`;
  const rawPath =
    match[1];
  const relative =
    rawPath.startsWith(prefix)
      ? rawPath.slice(prefix.length)
      : rawPath;

  return {
    path: relative,
    line: Number(match[2]),
    text: match[3],
  };
}

export function discover({
  repository,
  sourceRef =
    DEFAULT_SOURCE_REF,
}) {
  console.log(
    "SCAN_ENGINE=git-grep-batch.v1",
  );
  console.log(
    "SCAN_STAGE=TRACKED_FILE_INDEX",
  );

  const files =
    trackedFiles(
      repository,
      sourceRef,
    );

  console.log(
    `TRACKED_FILES=${files.length}`,
  );
  console.log(
    "SCAN_STAGE=BATCH_CANDIDATE_SEARCH",
  );

  const rawLines =
    batchCandidateLines(
      repository,
      sourceRef,
    );

  console.log(
    `RAW_CANDIDATE_LINES=${rawLines.length}`,
  );
  console.log(
    "SCAN_STAGE=CLASSIFICATION",
  );

  const matches = [];
  const classifications =
    new Map();
  const keywords =
    new Map();
  const matchedFiles =
    new Set();
  const candidates =
    new Set();
  const perFile =
    new Map();

  for (const rawLine of rawLines) {
    const parsed =
      parseGrepLine(
        rawLine,
        sourceRef,
      );

    if (!parsed) {
      continue;
    }

    if (
      !TEXT_EXTENSIONS.has(
        path
          .extname(parsed.path)
          .toLowerCase(),
      )
    ) {
      continue;
    }

    const found =
      matchLine(parsed.text);

    if (found.length === 0) {
      continue;
    }

    const count =
      perFile.get(parsed.path) ?? 0;

    if (count >= 40) {
      continue;
    }

    perFile.set(
      parsed.path,
      count + 1,
    );

    const classification =
      classifyPath(parsed.path);

    matches.push({
      path: parsed.path,
      line: parsed.line,
      classification,
      keywords: [...found],
      snippet:
        snippet(parsed.text),
    });

    matchedFiles.add(parsed.path);

    classifications.set(
      classification,
      (
        classifications.get(
          classification,
        ) ?? 0
      ) + 1,
    );

    for (const key of found) {
      keywords.set(
        key,
        (
          keywords.get(key) ??
          0
        ) + 1,
      );
    }

    if (
      classification ===
        "PERFORMANCE_CANDIDATE" ||
      classification ===
        "RUNTIME_OR_PLATFORM"
    ) {
      candidates.add(parsed.path);
    }

    if (matches.length >= 10000) {
      throw new Error(
        "PerformanceScoringDiscovery: " +
        "match cap reached",
      );
    }
  }

  matches.sort(
    (left, right) =>
      left.path.localeCompare(
        right.path,
      ) ||
      left.line - right.line ||
      left.keywords
        .join(",")
        .localeCompare(
          right.keywords.join(","),
        ),
  );

  const manifest =
    JSON.parse(
      fs.readFileSync(
        path.join(
          repository,
          "advisor-os/activity/foundation/" +
            "activity-foundation-freeze.v1.json",
        ),
        "utf8",
      ),
    );

  if (
    manifest?.boundaries
      ?.scoringAuthority !== false
  ) {
    throw new Error(
      "PerformanceScoringDiscovery: " +
      "Activity scoring boundary invalid",
    );
  }

  console.log(
    "SCAN_STAGE=EVIDENCE_BUILD",
  );

  return Object.freeze({
    schemaVersion:
      DISCOVERY_SCHEMA_VERSION,
    scanEngine:
      SCAN_ENGINE,
    sourceRef,
    sourceCommit:
      gitText(
        repository,
        [
          "rev-parse",
          `${sourceRef}^{commit}`,
        ],
      ).trim(),
    activityFoundation: {
      freezeId:
        manifest.freezeId,
      scoringAuthority: false,
      frozenFiles:
        manifest.frozenFiles.length,
    },
    scan: {
      trackedFiles:
        files.length,
      rawCandidateLines:
        rawLines.length,
      matchedFiles:
        matchedFiles.size,
      matchedLines:
        matches.length,
      authorityCandidateFiles:
        candidates.size,
    },
    classificationCounts:
      stableCounts(classifications),
    keywordCounts:
      stableCounts(keywords),
    authorityCandidates:
      [...candidates].sort(),
    unresolvedPolicyQuestions: [
      "SCORING_PERIOD",
      "WEIGHT_VERSIONING",
      "EVALUABLE_DAY_POLICY",
      "CORRECTION_AND_REVERSAL_EFFECT",
      "CAPS_AND_FLOORS",
      "GOAL_VS_ACTUAL_SEMANTICS",
      "MANAGER_OVERRIDE_AUTHORITY",
      "TIME_ZONE_BOUNDARY",
      "RANKING_VISIBILITY",
      "HISTORICAL_RECOMPUTATION",
    ],
    matches,
  });
}

export function inventoryTsv(value) {
  const rows = [
    "path\tline\tclassification\tkeywords\tsnippet",
  ];

  for (const item of value.matches) {
    rows.push(
      [
        item.path,
        item.line,
        item.classification,
        item.keywords.join(","),
        item.snippet,
      ]
        .map(
          (part) =>
            String(part)
              .replaceAll("\t", " ")
              .replaceAll("\r", " ")
              .replaceAll("\n", " ")
              .trimEnd(),
        )
        .join("\t"),
    );
  }

  return `${rows.join("\n")}\n`;
}

export function summaryJson(value) {
  const {
    matches,
    ...summary
  } = value;

  return `${
    JSON.stringify(
      summary,
      null,
      2,
    )
  }\n`;
}

function argValue(
  args,
  name,
) {
  const index =
    args.indexOf(name);

  if (
    index < 0 ||
    !args[index + 1]
  ) {
    throw new Error(
      `PerformanceScoringDiscovery: ${name} is required`,
    );
  }

  return args[index + 1];
}

const currentFile =
  fileURLToPath(import.meta.url);

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(currentFile)
) {
  const args =
    process.argv.slice(2);
  const repository =
    argValue(
      args,
      "--repository",
    );
  const sourceRef =
    argValue(
      args,
      "--source-ref",
    );
  const inventory =
    argValue(
      args,
      "--inventory",
    );
  const summary =
    argValue(
      args,
      "--summary",
    );

  const value =
    discover({
      repository,
      sourceRef,
    });

  fs.mkdirSync(
    path.dirname(
      path.resolve(inventory),
    ),
    {
      recursive: true,
    },
  );
  fs.mkdirSync(
    path.dirname(
      path.resolve(summary),
    ),
    {
      recursive: true,
    },
  );

  fs.writeFileSync(
    inventory,
    inventoryTsv(value),
    "utf8",
  );
  fs.writeFileSync(
    summary,
    summaryJson(value),
    "utf8",
  );

  console.log(
    "SCAN_STAGE=COMPLETE",
  );
  console.log(
    "PERFORMANCE_SCORING_DISCOVERY=PASS",
  );
  console.log(
    `SOURCE_COMMIT=${value.sourceCommit}`,
  );
  console.log(
    `MATCHED_FILES=${value.scan.matchedFiles}`,
  );
  console.log(
    `MATCHED_LINES=${value.scan.matchedLines}`,
  );
  console.log(
    `AUTHORITY_CANDIDATE_FILES=${value.scan.authorityCandidateFiles}`,
  );
  console.log(
    "ACTIVITY_SCORING_AUTHORITY=NO",
  );
}
