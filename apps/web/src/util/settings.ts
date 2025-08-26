import { signal, effect, type Signal } from "isum/preactive";

type Store<T extends object> = {
  [K in keyof T]: Signal<T[K]>;
};

const load = (storageKey: string) => {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "{}");
  } catch {
    return {};
  }
};

export function createSettingsStore<T extends object>(key: string, defaults: T): Store<T> {
  const storageKey = `ansi-tools-${key}`;
  const initialState = { ...defaults, ...load(storageKey) };

  const store = Object.fromEntries(
    Object.keys(defaults).map(key => [key, signal(initialState[key as keyof T])])
  ) as unknown as Store<T>;

  effect(() => {
    typeof localStorage !== "undefined" && localStorage.setItem(storageKey, JSON.stringify(store));
  });

  return store;
}
