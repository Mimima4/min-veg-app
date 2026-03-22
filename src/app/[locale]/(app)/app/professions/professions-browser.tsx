"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";

type ProfessionItem = {
  slug: string;
  title_i18n: Record<string, string> | null;
  summary_i18n: Record<string, string> | null;
  avg_salary_nok: number | null;
  demand_level: string;
  education_level: string;
  work_style: string;
  key_skills: unknown;
};

type Props = {
  locale: SupportedLocale;
  professions: ProfessionItem[];
};

function formatSalary(value: number | null) {
  if (!value) return "—";
  return `${new Intl.NumberFormat("nb-NO").format(value)} NOK`;
}

function formatDemandLevel(value: string) {
  switch (value) {
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return value;
  }
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function ProfessionsBrowser({ locale, professions }: Props) {
  const [query, setQuery] = useState("");

  const enhancedProfessions = useMemo(() => {
    return professions.map((profession) => {
      const title = getLocalizedValue(profession.title_i18n, locale);
      const summary = getLocalizedValue(profession.summary_i18n, locale);

      return {
        ...profession,
        title,
        summary,
      };
    });
  }, [professions, locale]);

  const filteredProfessions = useMemo(() => {
    const q = normalize(query);

    if (q.length < 2) {
      return enhancedProfessions;
    }

    return enhancedProfessions.filter((profession) => {
      return (
        normalize(profession.title).includes(q) ||
        normalize(profession.slug).includes(q)
      );
    });
  }, [enhancedProfessions, query]);

  const suggestions = useMemo(() => {
    const q = normalize(query);

    if (q.length < 2) return [];

    return enhancedProfessions
      .filter((profession) => normalize(profession.title).includes(q))
      .slice(0, 6);
  }, [enhancedProfessions, query]);

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-stone-900">
          Search professions
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Start typing a few characters to find matching profession titles quickly.
        </p>

        <div className="relative mt-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by profession title"
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none focus:border-stone-500"
          />

          {suggestions.length > 0 ? (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-10 rounded-2xl border border-stone-200 bg-white p-2 shadow-sm">
              <div className="flex flex-col">
                {suggestions.map((profession) => (
                  <Link
                    key={profession.slug}
                    href={`/${locale}/app/professions/${profession.slug}`}
                    className="rounded-xl px-3 py-2 text-sm text-stone-800 transition hover:bg-stone-50"
                  >
                    {profession.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredProfessions.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              No professions found
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Try another search term.
            </p>
          </div>
        ) : (
          filteredProfessions.map((profession) => {
            const skills = Array.isArray(profession.key_skills)
              ? profession.key_skills.filter(
                  (item): item is string => typeof item === "string"
                )
              : [];

            return (
              <div
                key={profession.slug}
                className="rounded-2xl border border-stone-200 bg-white p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-3xl">
                    <h2 className="text-lg font-semibold text-stone-900">
                      {profession.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">
                      {profession.summary}
                    </p>

                    <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm text-stone-500">Average salary</dt>
                        <dd className="mt-1 text-base text-stone-900">
                          {formatSalary(profession.avg_salary_nok)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm text-stone-500">Demand level</dt>
                        <dd className="mt-1 text-base text-stone-900">
                          {formatDemandLevel(profession.demand_level)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm text-stone-500">Education level</dt>
                        <dd className="mt-1 text-base text-stone-900">
                          {profession.education_level}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm text-stone-500">Work style</dt>
                        <dd className="mt-1 text-base text-stone-900">
                          {profession.work_style}
                        </dd>
                      </div>
                    </dl>

                    {skills.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-sm text-stone-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <Link
                      href={`/${locale}/app/professions/${profession.slug}`}
                      className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
                    >
                      Open profession
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}