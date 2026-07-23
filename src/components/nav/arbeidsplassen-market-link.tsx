import {
  ARBEIDSPLASSEN_LINK_CLASSNAME,
  ARBEIDSPLASSEN_LINK_LABEL,
  resolveArbeidsplassenUrlForProfessionSlug,
} from "@/lib/nav/arbeidsplassen-occupation-url";

type ArbeidsplassenMarketLinkProps = {
  professionSlug: string;
  className?: string;
};

/**
 * Orientering link to NAV vacancy-category filter for a catalogue profession.
 * Label is fixed product copy — do not localize per profession.
 * Style matches in-app external text links (blue + underline on hover), not buttons.
 */
export function ArbeidsplassenMarketLink({
  professionSlug,
  className = ARBEIDSPLASSEN_LINK_CLASSNAME,
}: ArbeidsplassenMarketLinkProps) {
  const href = resolveArbeidsplassenUrlForProfessionSlug(professionSlug);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {ARBEIDSPLASSEN_LINK_LABEL}
    </a>
  );
}
