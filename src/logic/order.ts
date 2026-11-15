/** The names of the rows on the Settings list. `about`, `account` and `app` (Preferences) are app-account-kit's own pages. */
export type SectionName = 'about' | 'account' | 'app' | 'export' | 'plan';

/**
 * The standard list, the same four parents in every app: About (the app), Account (you and your data), Preferences (how the app works), then the plan page (activate it).
 * Other pages follow, then anything the app left out. Features are never on this list: Data Export is a row inside Account.
 */
export const DEFAULT_ORDER: readonly SectionName[] = ['about', 'account', 'app', 'plan'];

/** The page ids this kit uses unless the app picks its own. */
export const DEFAULT_IDS = { export: 'export', plan: 'plan' } as const;

/**
 * The hub order to hand to app-account-kit: the section names with the app's own page id put in for `plan`.
 * `export` (and the app's Data Export id) is left out: Data Export lives inside Account, not on the list.
 * Names the app does not use are left in; app-account-kit hides pages that do not exist.
 */
export function hubOrder(order: readonly string[] = DEFAULT_ORDER, ids: { export?: string; plan?: string } = {}): string[] {
  const exportId = ids.export ?? DEFAULT_IDS.export;
  const swap: Record<string, string> = { plan: ids.plan ?? DEFAULT_IDS.plan };
  const out: string[] = [];
  for (const name of order) {
    if (name === 'export' || name === exportId) continue;
    const id = swap[name] ?? name;
    if (!out.includes(id)) out.push(id);
  }
  return out;
}
