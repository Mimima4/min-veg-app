import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FamilyPartnerSettings } from "@/server/family/partner/get-family-partner-settings";

function formatDateTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("nb-NO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
    hour12: false,
  });
}

export default function FamilyPartnerSettingsSection({
  locale,
  settings,
  action,
}: {
  locale: string;
  settings: FamilyPartnerSettings;
  action: (formData: FormData) => Promise<void>;
}) {
  const titleValue =
    settings.partnerDisplayName?.trim() ||
    settings.partnerEmail ||
    (settings.viewerRole === "family_partner"
      ? "Primary parent not available yet"
      : "No second parent yet");

  const statusBadge = (() => {
    switch (settings.status) {
      case "linked":
        return (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
            linked
          </span>
        );
      case "pending_link":
        return (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-900">
            pending
          </span>
        );
      case "none":
      default:
        return (
          <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-stone-600">
            not linked
          </span>
        );
    }
  })();

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-stone-900">
          {settings.heading}
        </h2>
        <p className="text-sm leading-relaxed text-stone-600">
          {settings.description}
        </p>
      </div>

      {settings.viewerRole === "family_partner" ? (
        <div className="mt-5 space-y-4 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
          <div className="leading-relaxed">
            You are linked to this family as the second parent.
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">
                Display name
              </dt>
              <dd className="mt-1 break-all text-sm font-medium text-stone-900">
                {settings.partnerDisplayName ??
                  settings.partnerEmail ??
                  "Primary parent not available yet"}
              </dd>
            </div>

            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">
                Email
              </dt>
              <dd className="mt-1 break-all text-sm font-medium text-stone-900">
                {settings.partnerEmail ?? "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">
                Status
              </dt>
              <dd className="mt-1">{statusBadge}</dd>
            </div>

            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">
                Invited at
              </dt>
              <dd className="mt-1 text-sm text-stone-900">
                {formatDateTime(settings.invitedAt)}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-stone-500">
                Linked at
              </dt>
              <dd className="mt-1 text-sm text-stone-900">
                {formatDateTime(settings.linkedAt)}
              </dd>
            </div>
          </dl>
        </div>
      ) : settings.teaserOnly ? (
        <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
          Available on paid plan.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {settings.status === "pending_link" && settings.partnerEmail ? (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
              Invitation sent to the second parent.
            </div>
          ) : null}

          {settings.status === "linked" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              The second parent is linked to this family.
            </div>
          ) : null}

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="text-xs uppercase tracking-wide text-stone-500">
              Current status
            </div>
            <div className="mt-2 text-base font-medium text-stone-900">
              {titleValue}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-600">
              {statusBadge}
              {settings.replaceUsed ? (
                <span className="rounded-full border border-stone-300 bg-white px-3 py-1">
                  replacement used
                </span>
              ) : null}
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">
                  Email
                </dt>
                <dd className="mt-1 break-all text-sm text-stone-900">
                  {settings.partnerEmail ?? "—"}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">
                  Display name
                </dt>
                <dd className="mt-1 text-sm text-stone-900">
                  {settings.partnerDisplayName ?? "—"}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">
                  Invited at
                </dt>
                <dd className="mt-1 text-sm text-stone-900">
                  {formatDateTime(settings.invitedAt)}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">
                  Linked at
                </dt>
                <dd className="mt-1 text-sm text-stone-900">
                  {formatDateTime(settings.linkedAt)}
                </dd>
              </div>
            </dl>
          </div>

          {settings.readonly ? (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
              This account is currently read-only. Second parent changes are
              unavailable.
            </div>
          ) : null}

          <form
            action={action}
            className="space-y-4 rounded-xl border border-stone-200 bg-white p-4"
          >
            <div>
              <label
                htmlFor="family-partner-email"
                className="block text-sm font-medium text-stone-900"
              >
                Second parent email
              </label>
              <input
                id="family-partner-email"
                name="partnerEmail"
                type="email"
                defaultValue={settings.partnerEmail ?? ""}
                disabled={!settings.canManage}
                className="mt-2 block w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500"
                placeholder="name@example.com"
              />
            </div>

            {settings.replaceUsed ? (
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
                The one-time second parent replacement has already been used.
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p>You can change the second parent once.</p>
                {settings.hasLinkedPartner ? (
                  <p className="mt-1">
                    If you replace them now, the current second parent will lose
                    access to this family.
                  </p>
                ) : null}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={!settings.canManage}
                className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-200 disabled:text-stone-500"
              >
                {settings.partnerEmail ? "Save second parent" : "Add second parent"}
              </button>

              {settings.partnerEmail && settings.canReplace ? (
                <span className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700">
                  One replacement still available
                </span>
              ) : null}

              {settings.partnerEmail && !settings.canReplace ? (
                <span className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-stone-100 px-4 py-2 text-sm text-stone-600">
                  Replacement unavailable
                </span>
              ) : null}
            </div>

            {settings.partnerEmail ? (
              <p className="text-xs leading-relaxed text-stone-500">
                The currently saved email is the only valid second parent
                target. If it changes later, only the latest saved email
                remains valid.
              </p>
            ) : null}
          </form>
        </div>
      )}
    </div>
  );
}
