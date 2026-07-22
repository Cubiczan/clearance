export function money(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function statusTone(
  status: string,
): "ok" | "warn" | "bad" | "neutral" {
  if (status === "approved" || status === "LOCKED" || status === "intact") return "ok";
  if (status === "pending_human" || status === "PROVISIONAL" || status === "open")
    return "warn";
  if (status === "denied" || status === "rejected" || status === "REJECTED") return "bad";
  return "neutral";
}
