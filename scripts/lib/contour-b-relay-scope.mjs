/**
 * Production Contour B relay scope (owner 2026-07-22):
 * - Default / contour code changes: full profession × county matrix (no filters).
 * - Profession addition without contour code changes: `--profession <slug>` allowed
 *   (all pipeline counties for that profession only).
 * - `--county` alone remains smoke-only with `--dry-run` (never production).
 */
export function assertContourBRelayProductionScope(args, scriptLabel) {
  const isDryRun = String(args["dry-run"] ?? "").toLowerCase() === "true";
  const profession = String(args.profession ?? "").trim();
  const county = String(args.county ?? "").trim();
  if (isDryRun) {
    return;
  }
  if (county) {
    throw new Error(
      `${scriptLabel}: --county is smoke-only (--dry-run). ` +
        `Production Contour B must not scope to a single county. ` +
        `Use full matrix, or --profession <slug> for a profession-local matrix.`
    );
  }
  // --profession alone is allowed (profession-local nationwide matrix).
  void profession;
}
