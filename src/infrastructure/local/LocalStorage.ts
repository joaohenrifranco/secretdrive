export class LocalStorage<Schema> {
  constructor(private key: string) {}

  save(data: Schema, ttl: number): void {
    localStorage.setItem(
      this.key,
      JSON.stringify({
        data,
        expires_at: Date.now() + ttl,
      }),
    );
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }

  load(): Schema | null {
    const raw = localStorage.getItem(this.key);
    if (!raw) {
      return null;
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      console.error("[LocalStorage] Couldn't parse data", error);
      localStorage.removeItem(this.key);
      return null;
    }

    if (data.expires_at < Date.now()) {
      localStorage.removeItem(this.key);
      console.error('[LocalStorage] Saved data expired');
      return null;
    }

    return JSON.parse(raw).data;
  }
}
