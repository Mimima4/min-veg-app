/**
 * Maps product profession slugs to canonical `larebedrift_truth.larefag_code` values.
 * Extend when adding fag (P5 / mechanic Kolonne3 branches).
 */

type LarefagMapping = {
  code: string;
  label: string;
};

const PROFESSION_TO_LAREFAG: Readonly<Record<string, LarefagMapping>> = {
  carpenter: { code: "TOMRERFAGET", label: "Tømrerfaget" },
  electrician: { code: "ELEKTRIKERFAGET", label: "Elektrikerfaget" },
};

export function resolveLarefagForProfession(
  professionSlug: string | null | undefined
): LarefagMapping | null {
  const slug = String(professionSlug ?? "").trim();
  if (!slug) return null;
  return PROFESSION_TO_LAREFAG[slug] ?? null;
}

export function resolveLarefagCodeForProfession(
  professionSlug: string | null | undefined
): string | null {
  return resolveLarefagForProfession(professionSlug)?.code ?? null;
}

export function resolveLarefagLabelForProfession(
  professionSlug: string | null | undefined
): string | null {
  return resolveLarefagForProfession(professionSlug)?.label ?? null;
}
