export type MatchableSubstance = {
  name: string | null;
  casNumber?: string | null;
  ecNumber?: string | null;
};

export type MatchResult<TItem extends MatchableSubstance> = {
  matchedField: "CAS" | "EC" | "NAME" | "NONE";
  item: TItem | null;
  score: number;
};

function normalizeIdentifier(value?: string | null) {
  return value?.trim().toLowerCase() || "";
}

export function normalizeName(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function levenshteinDistance(a: string, b: string) {
  const left = normalizeName(a);
  const right = normalizeName(b);

  if (left === right) return 0;
  if (!left) return right.length;
  if (!right) return left.length;

  const matrix = Array.from({ length: left.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= right.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const substitution = matrix[i - 1][j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1);
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, substitution);
    }
  }

  return matrix[left.length][right.length];
}

export function nameSimilarity(a: string, b: string) {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (!left && !right) return 1;
  if (!left || !right) return 0;
  const distance = levenshteinDistance(left, right);
  return 1 - distance / Math.max(left.length, right.length);
}

export function matchSubstance<TItem extends MatchableSubstance>(
  substance: MatchableSubstance,
  items: TItem[],
  minimumNameScore = 0.82
): MatchResult<TItem> {
  const cas = normalizeIdentifier(substance.casNumber);
  if (cas) {
    const item = items.find((entry) => normalizeIdentifier(entry.casNumber) === cas);
    if (item) return { matchedField: "CAS", item, score: 1 };
  }

  const ec = normalizeIdentifier(substance.ecNumber);
  if (ec) {
    const item = items.find((entry) => normalizeIdentifier(entry.ecNumber) === ec);
    if (item) return { matchedField: "EC", item, score: 1 };
  }

  let best: MatchResult<TItem> = { matchedField: "NONE", item: null, score: 0 };
  for (const item of items) {
    const score = nameSimilarity(substance.name || "", item.name || "");
    if (score > best.score) {
      best = { matchedField: "NAME", item, score };
    }
  }

  return best.score >= minimumNameScore ? best : { matchedField: "NONE", item: null, score: 0 };
}
