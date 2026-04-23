import type { AvailabilityTruthRow } from "./get-availability-truth";

export type PathVariantNode =
  | {
      type: "programme_selection";
      stage: "VG1" | "VG2" | "VG3";
      title: string;
      programSlug?: string | null;
      programTitle?: string | null;
      options?: Array<{
        optionId: string;
        optionTitle: string;
        sourceOutcomeUrl?: string | null;
      }>;
    }
  | {
      type: "apprenticeship_step";
      title: string;
      sourceOutcomeUrl?: string | null;
    };

export type PathVariant = {
  variantId: string;
  label: string;
  nodes: PathVariantNode[];
};

export type VilbliOutcomeProfession = {
  vilbliTitle: string;
  vilbliUrl: string;
  sourceOutcomeUrl: string;
};

export type PathVariantsResult = {
  sourceUrl: string | null;
  yrkerUrl: string | null;
  stages: string[];
  hasApprenticeship: boolean;
  variants: PathVariant[];
  outcomes: VilbliOutcomeProfession[];
};

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function toAbsoluteUrl(href: string, baseUrl: string): string {
  return new URL(href, baseUrl).toString();
}

function parseVilbliStagesFromHtml(html: string): string[] {
  const stages = new Set<string>();
  const regex = /(?:window\.)?vb_map_data_([A-Za-z0-9_]+)\s*=\s*\[/g;
  let match = regex.exec(html);
  while (match) {
    const suffix = String(match[1] ?? "");
    const stageMatch = suffix.match(/vg\d/i);
    if (stageMatch) {
      stages.add(stageMatch[0].toUpperCase());
    }
    match = regex.exec(html);
  }
  return Array.from(stages).sort();
}

function hasVg3OrBedriftBranching(html: string): boolean {
  const plainText = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return /vg3.{0,120}(eller|\/).{0,120}(opplæring i bedrift|opplaering i bedrift|lære|laere)/i.test(
    plainText
  );
}

function stageOrder(stage: string): number {
  const order: Record<string, number> = {
    VG1: 1,
    VG2: 2,
    VG3: 3,
  };
  return order[stage] ?? 999;
}

function verificationPriority(status: string): number {
  if (status === "verified") return 1;
  if (status === "needs_review") return 2;
  return 999;
}

function selectStageRow(
  rows: AvailabilityTruthRow[],
  stage: "VG1" | "VG2" | "VG3"
): AvailabilityTruthRow | null {
  return (
    [...rows]
      .filter((row) => row.stage === stage)
      .sort((a, b) => {
        const verificationDelta =
          verificationPriority(a.verificationStatus) - verificationPriority(b.verificationStatus);
        if (verificationDelta !== 0) return verificationDelta;
        const byInstitution = (a.institutionName ?? "").localeCompare(b.institutionName ?? "");
        if (byInstitution !== 0) return byInstitution;
        return (a.institutionId ?? "").localeCompare(b.institutionId ?? "");
      })[0] ?? null
  );
}

function resolveApprenticeshipLabel(html: string): string | null {
  const hasBedrift = /opplæring i bedrift|opplaering i bedrift/i.test(html);
  const hasLaere = /\blære\b|\blaere\b/i.test(html);

  if (hasBedrift) {
    return "Opplæring i bedrift";
  }
  if (hasLaere) {
    return "Lære";
  }
  return null;
}

function parseYrkerPageUrl(html: string, sourceUrl: string): string | null {
  const match = html.match(/href=['"]([^'"]*\/yrker\/[^'"]*)['"]/i);
  if (!match?.[1]) return null;
  return toAbsoluteUrl(match[1], sourceUrl);
}

function toYrkerUrlFromSkolerUrl(url: string): string {
  return url.replace(/skoler-og-laerebedrifter/gi, "yrker");
}

function parseElektrikerfagetSkolerUrl(html: string, sourceUrl: string): string | null {
  const match = html.match(
    /href=['"]([^'"]*elektrikerfaget-skoler-og-laerebedrifter[^'"]*)['"]/i
  );
  if (!match?.[1]) return null;
  return toAbsoluteUrl(match[1], sourceUrl);
}

function slugify(value: string): string {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseVg3BranchingOptions(params: {
  html: string;
  sourceUrl: string;
}): Array<{ optionTitle: string; sourceOutcomeUrl: string }> {
  const blockMatch = params.html.match(
    /<h4>\s*<span>Vg3\s*[–-]\s*Videregående trinn 3 eller opplæring i bedrift[^<]*<\/span>\s*<\/h4>[\s\S]*?<ul class="kursList">([\s\S]*?)<\/ul>/i
  );
  if (!blockMatch?.[1]) {
    return [];
  }

  const ul = blockMatch[1];
  const branchEntries = Array.from(
    ul.matchAll(
      /<li class="[^"]*\b(?:skole|bedrift)\b[^"]*"[\s\S]*?<a href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/li>/gi
    )
  )
    .map((match) => ({
      href: normalizeWhitespace(match[1] ?? ""),
      title: normalizeWhitespace((match[2] ?? "").replace(/<[^>]+>/g, " ")),
    }))
    .filter((entry) => entry.href && entry.title);

  const withoutPabygging = branchEntries.filter(
    (entry) => !/^påbygging\b/i.test(entry.title) && !/^pabygging\b/i.test(entry.title)
  );

  const options = withoutPabygging.map((entry) => {
    const absoluteSkolerUrl = toAbsoluteUrl(entry.href, params.sourceUrl);
    return {
      optionTitle: entry.title,
      sourceOutcomeUrl: toYrkerUrlFromSkolerUrl(absoluteSkolerUrl),
    };
  });

  const preferred = options
    .filter((option) => /elektrikerfaget/i.test(option.optionTitle))
    .sort((a, b) => a.optionTitle.localeCompare(b.optionTitle));
  const others = options
    .filter((option) => !/elektrikerfaget/i.test(option.optionTitle))
    .sort((a, b) => a.optionTitle.localeCompare(b.optionTitle));
  return [...preferred, ...others];
}

function parseVilbliOutcomeProfessions(html: string, yrkerUrl: string): VilbliOutcomeProfession[] {
  const outcomes = new Map<string, VilbliOutcomeProfession>();
  const pushOutcome = (params: { title: string; href: string }) => {
    const text = normalizeWhitespace(params.title);
    const href = normalizeWhitespace(params.href);
    if (!text || !href) return;
    const key = `${yrkerUrl.toLowerCase()}::${text.toLowerCase()}`;
    if (outcomes.has(key)) return;
    outcomes.set(key, {
      vilbliTitle: text,
      vilbliUrl: toAbsoluteUrl(href, yrkerUrl),
      sourceOutcomeUrl: yrkerUrl,
    });
  };

  // Primary parser: legacy/default yrker pages with explicit /yrke/ links.
  const yrkeLinkRegex = /href=['"]([^'"]*\/yrke\/[^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi;
  let match = yrkeLinkRegex.exec(html);
  while (match) {
    pushOutcome({
      href: match[1] ?? "",
      title: (match[2] ?? "").replace(/<[^>]+>/g, " "),
    });
    match = yrkeLinkRegex.exec(html);
  }

  if (outcomes.size > 0) {
    return Array.from(outcomes.values());
  }

  // Fallback parser: branch-specific pages where outcomes are listed as
  // "bedrift" entries linking to skoler-og-laerebedrifter pages.
  const bedriftRegex =
    /<li class="[^"]*\bbedrift\b[^"]*"[\s\S]*?<a href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/li>/gi;
  match = bedriftRegex.exec(html);
  while (match) {
    pushOutcome({
      href: match[1] ?? "",
      title: (match[2] ?? "").replace(/<[^>]+>/g, " "),
    });
    match = bedriftRegex.exec(html);
  }

  return Array.from(outcomes.values());
}

export async function buildPathVariants(
  truthRows: AvailabilityTruthRow[]
): Promise<PathVariantsResult> {
  const sourceUrl = truthRows.find((row) => row.sourceReferenceUrl)?.sourceReferenceUrl ?? null;
  if (!sourceUrl) {
    return {
      sourceUrl: null,
      yrkerUrl: null,
      stages: [],
      hasApprenticeship: false,
      variants: [],
      outcomes: [],
    };
  }

  const sourceResponse = await fetch(sourceUrl, {
    headers: { "user-agent": "Mozilla/5.0" },
  });
  if (!sourceResponse.ok) {
    return {
      sourceUrl,
      yrkerUrl: null,
      stages: [],
      hasApprenticeship: false,
      variants: [],
      outcomes: [],
    };
  }

  const sourceHtml = await sourceResponse.text();
  const stages = parseVilbliStagesFromHtml(sourceHtml);
  const hasBranchingVg3OrBedrift = hasVg3OrBedriftBranching(sourceHtml);
  const apprenticeshipLabel = resolveApprenticeshipLabel(sourceHtml);
  const hasApprenticeship = Boolean(apprenticeshipLabel);
  const directYrkerUrl = parseYrkerPageUrl(sourceHtml, sourceUrl);
  const vg3SkolerUrl = parseElektrikerfagetSkolerUrl(sourceHtml, sourceUrl);
  const vg3YrkerUrl = vg3SkolerUrl ? toYrkerUrlFromSkolerUrl(vg3SkolerUrl) : null;
  const vg3BranchOptions = parseVg3BranchingOptions({ html: sourceHtml, sourceUrl });

  const orderedStages = stages
    .filter((stage): stage is "VG1" | "VG2" | "VG3" =>
      stage === "VG1" || stage === "VG2" || stage === "VG3"
    )
    .sort((a, b) => stageOrder(a) - stageOrder(b));

  const baseProgrammeNodes: PathVariantNode[] = orderedStages.map((stage) => {
    const stageRow = selectStageRow(truthRows, stage);
    return {
      type: "programme_selection",
      stage,
      title: stageRow?.programTitle ?? stage,
      programSlug: stageRow?.programSlug ?? null,
      programTitle: stageRow?.programTitle ?? null,
    };
  });
  const apprenticeshipNode: PathVariantNode | null = hasApprenticeship
    ? {
        type: "apprenticeship_step",
        title: apprenticeshipLabel!,
        sourceOutcomeUrl: directYrkerUrl,
      }
    : null;

  let variants: PathVariant[] = [];
  if (baseProgrammeNodes.length > 0) {
    if (hasBranchingVg3OrBedrift && apprenticeshipNode) {
      const baseWithoutVg3 = baseProgrammeNodes.filter(
        (node): node is Extract<PathVariantNode, { type: "programme_selection" }> =>
          node.type === "programme_selection" && node.stage !== "VG3"
      );
      const vg3Node: PathVariantNode = {
        type: "programme_selection",
        stage: "VG3",
        title: vg3BranchOptions[0]?.optionTitle ?? "VG3",
        programSlug: null,
        programTitle: null,
        options: vg3BranchOptions.map((option) => ({
          optionId: `vg3-${slugify(option.optionTitle)}`,
          optionTitle: option.optionTitle,
          sourceOutcomeUrl: option.sourceOutcomeUrl,
        })),
      };
      const withVg3Nodes = [
        ...baseWithoutVg3,
        vg3Node,
        {
          ...apprenticeshipNode,
          sourceOutcomeUrl:
            vg3BranchOptions[0]?.sourceOutcomeUrl ?? vg3YrkerUrl ?? directYrkerUrl,
        },
      ];
      const directBedriftNodes = [...baseWithoutVg3, apprenticeshipNode];
      variants = [
        {
          variantId: "vilbli-branch-vg3-then-bedrift",
          label: "VG1 → VG2 → VG3 → opplæring i bedrift",
          nodes: withVg3Nodes,
        },
        {
          variantId: "vilbli-branch-direct-bedrift",
          label: "VG1 → VG2 → opplæring i bedrift",
          nodes: directBedriftNodes,
        },
      ];
    } else {
      const nodes = apprenticeshipNode
        ? [...baseProgrammeNodes, apprenticeshipNode]
        : [...baseProgrammeNodes];
      variants = [
        {
          variantId: `vilbli-${orderedStages.map((stage) => stage.toLowerCase()).join("-")}${hasApprenticeship ? "-laere" : ""}`,
          label: orderedStages.join(" → ") + (hasApprenticeship ? " → lære" : ""),
          nodes,
        },
      ];
    }
  }

  const outcomes: VilbliOutcomeProfession[] = [];
  const outcomeUrls = Array.from(
    new Set(
      variants
        .flatMap((variant) => variant.nodes)
        .filter(
          (node): node is Extract<PathVariantNode, { type: "apprenticeship_step" }> =>
            node.type === "apprenticeship_step"
        )
        .map((node) => node.sourceOutcomeUrl)
        .filter((value): value is string => Boolean(value))
    )
  );
  for (const outcomeUrl of outcomeUrls) {
    const yrkerResponse = await fetch(outcomeUrl, {
      headers: { "user-agent": "Mozilla/5.0" },
    });
    if (!yrkerResponse.ok) continue;
    outcomes.push(...parseVilbliOutcomeProfessions(await yrkerResponse.text(), outcomeUrl));
  }

  return {
    sourceUrl,
    yrkerUrl: directYrkerUrl,
    stages,
    hasApprenticeship,
    variants,
    outcomes,
  };
}
