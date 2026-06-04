import type { VilbliFaithfulAvailabilityPayload } from "@/lib/vgs/vilbli-faithful-types";

const DISPLAY_TYPE_LABELS: Record<string, string> = {
  ordinary: "Matched in NSR (not published as PSA truth)",
  losa_external_delivery: "LOSA / external delivery (Vilbli listing)",
  identity_unresolved: "In Vilbli — NSR identity not resolved",
};

const DISPLAY_TYPE_STYLES: Record<string, string> = {
  ordinary: "border-emerald-200 bg-emerald-50 text-emerald-900",
  losa_external_delivery: "border-amber-200 bg-amber-50 text-amber-900",
  identity_unresolved: "border-stone-300 bg-stone-50 text-stone-800",
};

type Props = {
  payload: VilbliFaithfulAvailabilityPayload;
};

export default function VilbliFaithfulAvailabilityPanel({ payload }: Props) {
  const stages = Array.from(new Set(payload.entries.map((entry) => entry.stage))).sort();

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="max-w-3xl">
        <h2 className="text-lg font-semibold text-stone-900">Vilbli schools (Finnmark)</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">{payload.disclaimer}</p>
        <p className="mt-2 text-xs text-stone-500">
          Source:{" "}
          <a
            href={payload.sourceUrl}
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            vilbli.no
          </a>
          {" · "}
          refreshed {new Date(payload.extractedAt).toLocaleString("nb-NO")}
        </p>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-stone-500">Total</dt>
          <dd className="mt-1 text-sm font-medium text-stone-900">{payload.summary.total}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-stone-500">Matched</dt>
          <dd className="mt-1 text-sm font-medium text-stone-900">{payload.summary.ordinary}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-stone-500">LOSA</dt>
          <dd className="mt-1 text-sm font-medium text-stone-900">
            {payload.summary.losa_external_delivery}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-stone-500">Unresolved</dt>
          <dd className="mt-1 text-sm font-medium text-stone-900">
            {payload.summary.identity_unresolved}
          </dd>
        </div>
      </dl>

      <div className="mt-6 space-y-6">
        {stages.map((stage) => (
          <div key={stage}>
            <h3 className="text-sm font-semibold text-stone-800">{stage}</h3>
            <ul className="mt-3 space-y-2">
              {payload.entries
                .filter((entry) => entry.stage === stage)
                .map((entry) => (
                  <li
                    key={`${entry.stage}-${entry.schoolCode}-${entry.schoolName}`}
                    className="rounded-lg border border-stone-200 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-stone-900">{entry.schoolName}</p>
                        {entry.institutionName ? (
                          <p className="mt-1 text-xs text-stone-600">
                            NSR: {entry.institutionName}
                          </p>
                        ) : null}
                      </div>
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                          DISPLAY_TYPE_STYLES[entry.displayType] ??
                          "border-stone-200 bg-stone-50 text-stone-700"
                        }`}
                      >
                        {DISPLAY_TYPE_LABELS[entry.displayType] ?? entry.displayType}
                      </span>
                    </div>
                    {entry.vilbliUrl ? (
                      <p className="mt-2 text-xs">
                        <a
                          href={entry.vilbliUrl}
                          className="text-stone-700 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open on Vilbli
                        </a>
                      </p>
                    ) : null}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      {payload.enrichmentLabels.length > 0 ? (
        <div className="mt-6 rounded-lg border border-stone-100 bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Planning evidence (labels only — not runtime fetch)
          </p>
          <ul className="mt-2 space-y-1 text-sm text-stone-700">
            {payload.enrichmentLabels.map((item) => (
              <li key={item.label}>
                Tier {item.tier}: {item.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
