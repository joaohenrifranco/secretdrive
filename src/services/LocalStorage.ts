export class LocalStorage<Schema> {
  constructor(private key: string) {}

  save(tokenResponse: Schema): void {
    localStorage.setItem(this.key, JSON.stringify(tokenResponse));
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }

  load(): Schema | null {
    const token = localStorage.getItem(this.key);
    if (!token) {
      return null;
    }
    return JSON.parse(token);
  }
}
