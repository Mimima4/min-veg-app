export function formatDateTime(value: string | null): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("nb-NO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
    hour12: false,
  });
}

export function formatCountdown(target: string | null): string | null {
  if (!target) return null;

  const now = new Date();
  const end = new Date(target);

  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return "expired";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }

  return `${hours}h`;
}
