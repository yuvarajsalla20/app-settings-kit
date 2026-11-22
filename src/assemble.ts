import type { ReactNode } from 'react';
import { DEFAULT_IDS, DEFAULT_ORDER, hubOrder } from './logic/order';
import type { SettingsStrings } from './strings';
import type { AccountExtraPage, DataExportPlace, ExtraPage, PageRow } from './types';

interface Section {
  row?: PageRow;
  /** The page itself. */
  content: ReactNode;
  /** 3.3.0: a pull-down menu on the row instead of a page. */
  menu?: AccountExtraPage['menu'];
  /** 11.0.0: the gold Premium tag after the row's name, and a gold padlock in place of the menu while `locked` (app-account-kit 7.34.0). */
  premium?: boolean;
  locked?: boolean;
  onLocked?: () => void;
  /** 12.0.0: with no `onLocked`, a tap on the lock opens this Settings page (the plan page), app-account-kit 7.35.0. */
  lockedOpens?: string;
}

interface Input {
  dataExport?: Section;
  plan?: Section;
  /** The app's other pages (Connect as Family, say). */
  extraPages?: readonly ExtraPage[];
  order?: readonly string[];
  /** Where the Data Export row lives. Default `'account'`. */
  dataExportIn?: DataExportPlace;
  strings: SettingsStrings;
}

/** This kit says "preferences" where app-account-kit says "app". */
const parentFor = (under: ExtraPage['under']): AccountExtraPage['under'] => (under === 'preferences' ? 'app' : under);

const toAccount = ({ under, ...rest }: ExtraPage): AccountExtraPage => {
  const parent = parentFor(under);
  return parent ? { ...rest, under: parent } : rest;
};

const page = (row: PageRow | undefined, kit: { id: string; label: string; icon: ExtraPage['icon'] }, content: ReactNode): AccountExtraPage => ({
  id: row?.id ?? kit.id,
  label: kit.label,
  icon: kit.icon,
  // Colors are the app's theme (the kit has none of its own), so the tile color is the one thing on the row besides the value the app gives.
  ...(row?.tint ? { tint: row.tint } : {}),
  ...(row?.value !== undefined ? { value: row.value } : {}),
  ...(row?.badge !== undefined ? { badge: row.badge } : {}),
  content,
});

/** 11.0.0: the Premium tag, the lock and what a tap on the lock does, as app-account-kit's page takes them. */
const premiumParts = ({ premium, locked, onLocked, lockedOpens }: Section) => ({
  ...(premium ? { premium } : {}),
  ...(locked ? { locked } : {}),
  ...(onLocked ? { onLocked } : {}),
  ...(lockedOpens ? { lockedOpens } : {}),
});

/**
 * The pages and the list order to hand to app-account-kit: the plan page and Data Export (when the app has them) plus the app's own pages.
 * The list is About, Account, Preferences, plan; pages not named in `order` follow. Data Export is a row inside Account,
 * or inside Preferences with `dataExportIn: 'preferences'`. App pages with `under: 'preferences'` become app-account-kit's `under: 'app'`.
 */
export function assemblePages({ dataExport, plan, extraPages = [], order = DEFAULT_ORDER, dataExportIn = 'account', strings }: Input): { extraPages: AccountExtraPage[]; hubOrder: string[] } {
  const ids = { export: dataExport?.row?.id ?? DEFAULT_IDS.export, plan: plan?.row?.id ?? DEFAULT_IDS.plan };
  const pages: AccountExtraPage[] = [];
  if (plan) pages.push(page(plan.row, { id: ids.plan, label: strings.plan, icon: 'award' }, plan.content));
  // Data Export is a feature, not a parent: a row straight on Account (or Preferences) with its Premium/VIP pill, and Back returns there.
  if (dataExport) pages.push({ ...page(dataExport.row, { id: ids.export, label: strings.dataExport, icon: 'download' }, dataExport.content), under: parentFor(dataExportIn), ...(dataExport.menu ? { menu: dataExport.menu } : {}), ...premiumParts(dataExport) });
  return { extraPages: [...pages, ...extraPages.map(toAccount)], hubOrder: hubOrder(order, ids) };
}
