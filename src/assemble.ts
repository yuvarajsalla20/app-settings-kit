import type { ReactNode } from 'react';
import { DEFAULT_IDS, DEFAULT_ORDER, hubOrder } from './logic/order';
import type { SettingsStrings } from './strings';
import type { ExtraPage, PageRow } from './types';

interface Section {
  row?: PageRow;
  /** The page itself. */
  content: ReactNode;
}

interface Input {
  dataExport?: Section;
  plan?: Section;
  /** The app's other pages (Connect as Family, say). */
  extraPages?: readonly ExtraPage[];
  order?: readonly string[];
  strings: SettingsStrings;
}

const page = (row: PageRow | undefined, fallback: { id: string; label: string; icon: ExtraPage['icon'] }, content: ReactNode): ExtraPage => ({
  id: row?.id ?? fallback.id,
  label: row?.label ?? fallback.label,
  icon: row?.icon ?? fallback.icon,
  ...(row?.tint ? { tint: row.tint } : {}),
  ...(row?.value !== undefined ? { value: row.value } : {}),
  ...(row?.badge !== undefined ? { badge: row.badge } : {}),
  content,
});

/**
 * The pages and the list order to hand to app-account-kit: the plan page and Data Export (when the app has them) plus the app's own pages.
 * The list is About, Account, Preferences, plan; pages not named in `order` follow. Data Export is a row inside Account.
 */
export function assemblePages({ dataExport, plan, extraPages = [], order = DEFAULT_ORDER, strings }: Input): { extraPages: ExtraPage[]; hubOrder: string[] } {
  const ids = { export: dataExport?.row?.id ?? DEFAULT_IDS.export, plan: plan?.row?.id ?? DEFAULT_IDS.plan };
  const pages: ExtraPage[] = [];
  if (plan) pages.push(page(plan.row, { id: ids.plan, label: strings.plan, icon: 'award' }, plan.content));
  // Data Export is a feature, not a parent: a row straight on Account (with its Premium/VIP pill), and Back returns to Account.
  if (dataExport) pages.push({ ...page(dataExport.row, { id: ids.export, label: strings.dataExport, icon: 'download' }, dataExport.content), under: 'account' });
  return { extraPages: [...pages, ...extraPages], hubOrder: hubOrder(order, ids) };
}
