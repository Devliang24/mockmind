export function unixSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
