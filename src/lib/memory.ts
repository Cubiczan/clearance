import type { MemoryDoc } from "./types";

/**
 * Lightweight retrieval over org/agent memory.
 * Swappable for Backboard persistent memory / vector RAG in production.
 */
export function retrieveMemory(
  docs: MemoryDoc[],
  namespace: string,
  query: string,
  limit = 3,
): MemoryDoc[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9.]+/)
    .filter((t) => t.length > 2);

  const scoped = docs.filter(
    (d) => d.namespace === namespace || d.namespace.startsWith("org/"),
  );

  const scored = scoped
    .map((doc) => {
      const hay = `${doc.text} ${doc.tags.join(" ")}`.toLowerCase();
      const score = terms.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
      return { doc, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return scoped.slice(0, limit);
  }
  return scored.slice(0, limit).map((x) => x.doc);
}

export function rememberDecision(
  docs: MemoryDoc[],
  namespace: string,
  text: string,
  tags: string[],
): MemoryDoc {
  const doc: MemoryDoc = {
    id: `mem_${Date.now().toString(36)}`,
    namespace,
    text,
    tags,
    createdAt: new Date().toISOString(),
  };
  docs.push(doc);
  return doc;
}

export function backboardConfig() {
  return {
    enabled: Boolean(process.env.BACKBOARD_API_KEY),
    baseUrl: process.env.BACKBOARD_API_BASE || "https://api.backboard.io",
    note: process.env.BACKBOARD_API_KEY
      ? "Live Backboard memory endpoint configured"
      : "Demo memory active — set BACKBOARD_API_KEY for production RAG hosting",
  };
}
