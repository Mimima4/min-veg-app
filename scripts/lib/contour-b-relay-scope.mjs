/**
 * Production Contour B relay must always process the full profession × county matrix.
 * Scoped --profession / --county is smoke-only (--dry-run).
 */
export function assertContourBRelayProductionScope(args, scriptLabel) {
  const isDryRun = String(args["dry-run"] ?? "").toLowerCase() === "true";
  const profession = String(args.profession ?? "").trim();
  const county = String(args.county ?? "").trim();
  if (!isDryRun && (profession || county)) {
    throw new Error(
      `${scriptLabel}: --profession/--county are smoke-only (--dry-run). ` +
        `Production Contour B relay must run the full matrix — never a single profession or county.`
    );
  }
}
