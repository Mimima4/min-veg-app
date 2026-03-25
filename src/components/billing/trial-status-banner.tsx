import Link from "next/link";

type Props = {
  tone?: "neutral" | "amber";
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export default function TrialStatusBanner({
  tone = "neutral",
  title,
  body,
  ctaHref,
  ctaLabel,
}: Props) {
  const wrapperClass =
    tone === "amber"
      ? "rounded-2xl border border-amber-200 bg-amber-50 p-5"
      : "rounded-2xl border border-stone-200 bg-white p-5";

  const titleClass =
    tone === "amber"
      ? "text-base font-semibold text-stone-900"
      : "text-base font-semibold text-stone-900";

  const bodyClass =
    tone === "amber"
      ? "mt-2 text-sm leading-relaxed text-amber-900"
      : "mt-2 text-sm leading-relaxed text-stone-600";

  return (
    <div className={wrapperClass}>
      <h2 className={titleClass}>{title}</h2>
      <p className={bodyClass}>{body}</p>

      {ctaHref && ctaLabel ? (
        <div className="mt-4">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
          >
            {ctaLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}