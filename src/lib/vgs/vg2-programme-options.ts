import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import { resolveProfessionSlugFromProgramSlug } from "@/lib/vgs/vg2-cross-profession";

export type Vg2ProgrammeOption = {
  program_slug: string;
  program_title: string;
  /** Catalogue profession that owns this VG2 programme (defaults to route profession). */
  profession_slug?: string;
};

export function buildVg2ProgrammeOptionId(programSlug: string): string {
  return `vg2-programme-${programSlug}`;
}

export function parseVg2ProgrammeOptionId(optionId: string): string | null {
  const match = String(optionId).match(/^vg2-programme-(.+)$/);
  return match?.[1]?.trim() || null;
}

export function resolveVg2ProgrammeOptionsFromStep(
  step: Extract<StudyRouteSnapshotStep, { type: "programme_selection" }>
): Vg2ProgrammeOption[] {
  const fromPayload = (step as { programme_options?: Vg2ProgrammeOption[] }).programme_options;
  if (Array.isArray(fromPayload) && fromPayload.length > 0) {
    return fromPayload;
  }

  const bySlug = new Map<string, Vg2ProgrammeOption>();
  for (const option of step.options ?? []) {
    const slug = String(
      (option as { program_slug?: string | null }).program_slug ?? step.program_slug ?? ""
    ).trim();
    if (!slug) continue;
    if (bySlug.has(slug)) continue;
    const title =
      (option as { program_title?: string | null }).program_title ??
      step.program_title ??
      step.title ??
      slug;
    bySlug.set(slug, { program_slug: slug, program_title: String(title) });
  }

  const stepSlug = String(step.program_slug ?? "").trim();
  if (stepSlug && !bySlug.has(stepSlug)) {
    bySlug.set(stepSlug, {
      program_slug: stepSlug,
      program_title: String(step.program_title ?? step.title ?? stepSlug),
    });
  }

  return Array.from(bySlug.values()).sort((a, b) =>
    a.program_title.localeCompare(b.program_title, "nb")
  );
}

export function pickDefaultVg2ProgramSlugForProfession(
  options: Vg2ProgrammeOption[] | null | undefined,
  professionSlug: string | null | undefined
): string | null {
  const profession = String(professionSlug ?? "").trim();
  if (!profession || !options?.length) {
    return null;
  }

  const match = options.find((option) => {
    const optionProfession =
      option.profession_slug ?? resolveProfessionSlugFromProgramSlug(option.program_slug);
    return optionProfession === profession;
  });

  return match?.program_slug?.trim() || null;
}

export function pickDefaultVg2ProgrammeOptionForProfession(
  options: Vg2ProgrammeOption[] | null | undefined,
  professionSlug: string | null | undefined
): Vg2ProgrammeOption | null {
  const profession = String(professionSlug ?? "").trim();
  if (!profession || !options?.length) {
    return null;
  }

  return (
    options.find((option) => {
      const optionProfession =
        option.profession_slug ?? resolveProfessionSlugFromProgramSlug(option.program_slug);
      return optionProfession === profession;
    }) ?? null
  );
}

export function buildVg2ProgrammeOptionsFromTruthRows(
  rows: Array<{ stage: string; programSlug: string; programTitle: string | null }>
): Vg2ProgrammeOption[] {
  const seen = new Set<string>();
  const options: Vg2ProgrammeOption[] = [];

  for (const row of rows) {
    if (row.stage !== "VG2") continue;
    const slug = String(row.programSlug ?? "").trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    options.push({
      program_slug: slug,
      program_title: String(row.programTitle ?? slug).trim(),
    });
  }

  return options.sort((a, b) => a.program_title.localeCompare(b.program_title, "nb"));
}
