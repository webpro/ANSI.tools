export class Settings<T extends object> {
  #key: string;
  #defaults: T;
  #state: T;

  constructor(key: string, defaults: T) {
    this.#key = `ansi-tools-${key}`;
    this.#defaults = defaults;
    this.#state = { ...defaults, ...this.#load() };
  }

  #load(): Partial<T> {
    try {
      const raw = localStorage.getItem(this.#key);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  get<K extends keyof T>(k: K): T[K] {
    return this.#state[k];
  }

  set<K extends keyof T>(k: K, v: T[K]) {
    this.#state[k] = v;
    localStorage.setItem(this.#key, JSON.stringify(this.#state));
  }
}
