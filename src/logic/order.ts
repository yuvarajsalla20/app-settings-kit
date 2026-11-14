/** The names of the rows on the Settings list. `about`, `account` and `app` (Preferences) are app-account-kit's own pages. */
export type SectionName = 'about' | 'account' | 'app' | 'export' | 'plan';

/** The standard order: About, Account, Preferences, Data Export, then the plan page. Other pages follow, then anything the app left out. */
export const DEFAULT_ORDER: readonly SectionName[] = ['about', 'account', 'app', 'export', 'plan'];

/** The page ids this kit uses unless the app picks its own. */
export const DEFAULT_IDS = { export: 'export', plan: 'plan' } as const;

/**
 * The hub order to hand to app-account-kit: the section names with the app's own page ids put in for `export` and `plan`.
 * Names the app does not use are left in; app-account-kit hides pages that do not exist.
 */
export function hubOrder(order: readonly string[] = DEFAULT_ORDER, ids: { export?: string; plan?: string } = {}): string[] {
  const swap: Record<string, string> = { export: ids.export ?? DEFAULT_IDS.export, plan: ids.plan ?? DEFAULT_IDS.plan };
  const out: string[] = [];
  for (const name of order) {
    const id = swap[name] ?? name;
    if (!out.includes(id)) out.push(id);
  }
  return out;
}
