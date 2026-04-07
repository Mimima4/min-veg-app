import { createAdminClient } from "@/lib/supabase/admin";

export async function consolidateDuplicateFamilyAccount(params: {
  canonicalFamilyAccountId: string;
  partnerUserId: string;
}) {
  const supabase = createAdminClient();

  const { canonicalFamilyAccountId, partnerUserId } = params;

  // 1. Найти все family accounts партнёра
  const { data: partnerFamilies, error: partnerFamiliesError } = await supabase
    .from("family_accounts")
    .select("*")
    .eq("primary_user_id", partnerUserId);

  if (partnerFamiliesError) {
    throw partnerFamiliesError;
  }

  if (!partnerFamilies || partnerFamilies.length === 0) {
    return;
  }

  // 2. Найти duplicate (не canonical)
  const duplicate = partnerFamilies.find(
    (f) => f.id !== canonicalFamilyAccountId
  );

  if (!duplicate) {
    return;
  }

  // 3. Проверка: уже был consolidation?
  if (
    duplicate.billing_superseded_by_family_account_id ||
    duplicate.billing_consolidated_at
  ) {
    return;
  }

  // 4. Eligibility check
  if (
    duplicate.last_payment_status !== "paid" ||
    !duplicate.current_period_ends_at
  ) {
    return;
  }

  const now = new Date();
  const duplicateEnd = new Date(duplicate.current_period_ends_at);

  if (duplicateEnd <= now) {
    return;
  }

  const remainingMs = duplicateEnd.getTime() - now.getTime();

  if (remainingMs <= 0) {
    return;
  }

  // 5. Получаем canonical
  const { data: canonical, error: canonicalError } = await supabase
    .from("family_accounts")
    .select("*")
    .eq("id", canonicalFamilyAccountId)
    .single();

  if (canonicalError || !canonical) {
    throw canonicalError || new Error("Canonical family not found");
  }

  const canonicalEnd = canonical.current_period_ends_at
    ? new Date(canonical.current_period_ends_at)
    : now;

  const newEnd = new Date(canonicalEnd.getTime() + remainingMs);

  // 6. Обновляем canonical (extension)
  const { error: updateCanonicalError } = await supabase
    .from("family_accounts")
    .update({
      current_period_ends_at: newEnd.toISOString(),
    })
    .eq("id", canonicalFamilyAccountId);

  if (updateCanonicalError) {
    throw updateCanonicalError;
  }

  // 7. Помечаем duplicate как superseded
  const { error: markDuplicateError } = await supabase
    .from("family_accounts")
    .update({
      billing_superseded_by_family_account_id: canonicalFamilyAccountId,
      billing_consolidated_at: new Date().toISOString(),
      billing_consolidation_note:
        "Remaining paid period transferred to canonical family account",
    })
    .eq("id", duplicate.id);

  if (markDuplicateError) {
    throw markDuplicateError;
  }
}