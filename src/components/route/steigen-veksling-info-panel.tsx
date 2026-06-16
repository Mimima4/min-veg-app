import type { SteigenCarpenterVekslingInfoCopy } from "@/lib/regional-delivery/steigen-carpenter-veksling-pilot";

type Props = {
  copy: SteigenCarpenterVekslingInfoCopy;
};

/** Expandable body only — badge lives in SteigenVekslingBadgeWithInfo. */
export default function SteigenVekslingInfoPanel({ copy }: Props) {
  return (
    <div
      className="rounded-2xl border border-sky-200 bg-sky-50 p-5"
      data-testid="steigen-veksling-info-panel"
    >
      <h3 className="text-base font-semibold text-stone-900">{copy.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-stone-700">{copy.body}</p>

      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-stone-700">
        {copy.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>

      {copy.campusNote ? (
        <p className="mt-4 rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-stone-700">
          {copy.campusNote}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {copy.sources.map((source) => (
          <a
            key={source.href}
            href={source.href}
            target="_blank"
            rel="noreferrer"
            className="text-sky-900 underline underline-offset-4 hover:text-sky-700"
          >
            {source.label}
          </a>
        ))}
      </div>
    </div>
  );
}
