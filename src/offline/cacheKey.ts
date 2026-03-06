function getUserScope(): string {
  const userId = localStorage.getItem('userId');
  return `u:${userId ?? 'anonymous'}`;
}

export function buildCacheKey(namespace: string, parts: Array<string | number | null | undefined> = []): string {
  const normalizedParts = parts
    .filter((part) => part !== null && part !== undefined)
    .map((part) => encodeURIComponent(String(part)));

  return [getUserScope(), namespace, ...normalizedParts].join(':');
}
