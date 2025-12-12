export function maskKey(key: string): string {
  if (!key) return "";
  if (key.length <= 10) return "*".repeat(key.length);

  const start = key.slice(0, 4);
  const end = key.slice(-4);
  return `${start}****${end}`;
}
