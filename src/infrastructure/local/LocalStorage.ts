export class LocalStorage<Schema> {
  constructor(private key: string) {}

  save(data: Schema, ttl: number): void {
    console.log('Current date', new Date().toLocaleString());
    console.log('Expiration date', new Date(Date.now() + ttl).toLocaleString());
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

    console.log('[LocalStorage] Expiration date', new Date(data.expires_at).toLocaleString());

    if (data.expires_at < Date.now()) {
      localStorage.removeItem(this.key);
      console.error('[LocalStorage] Saved data expired');
      return null;
    }

    return JSON.parse(raw).data;
  }
}
