import { SettingsScreen, type AccountStrings } from 'app-account-kit';
import type { ComponentProps, ReactNode } from 'react';
import { useMemo } from 'react';
import { assemblePages } from './assemble';
import { DataExportPage } from './pages/DataExportPage';
import { DEFAULT_SETTINGS_STRINGS, type SettingsStrings } from './strings';
import type { DataExportConfig, ExtraPage, PlanConfig } from './types';

type AccountScreenProps = ComponentProps<typeof SettingsScreen>;

export type AppSettingsProps = Omit<AccountScreenProps, 'app' | 'extraPages' | 'hubOrder'> & {
  /** The app's own settings (currency, reminders...), built with SettingsGroup and SettingRow. Leave out to hide Preferences. */
  preferences?: ReactNode;
  /** The Data Export page, a row on Account under Your Data. Leave out to hide it. To open it from another page (the plan page's perk), use `useSettingsNav().open(DEFAULT_IDS.export)` (or its own id). */
  dataExport?: DataExportConfig;
  /** The plan page (VIP, Premium). Leave out for an app with no plans. */
  plan?: PlanConfig;
  /** More pages of the app's own (Connect as Family, say). */
  extraPages?: readonly ExtraPage[];
  /** The list order. Default About, Account, Preferences, plan (`DEFAULT_ORDER`); use "plan" for the plan page and an extra page's id for the app's. Data Export is never on the list. */
  order?: readonly string[];
  /** This kit's words. Define once, outside the component. */
  settingsStrings?: Partial<SettingsStrings>;
};

/**
 * The standard Settings screen in one config: four parents, About, Account, Preferences and the plan page, then Sign out and Delete account.
 * Data Export (a lock per format) is a feature, so it lives inside Account under Your Data.
 * Everything app-account-kit takes (theme, strings, components, profile, about, actions...) passes straight through.
 */
export function AppSettings({ preferences, dataExport, plan, extraPages, order, settingsStrings, strings, ...rest }: AppSettingsProps) {
  const words = useMemo(() => ({ ...DEFAULT_SETTINGS_STRINGS, ...settingsStrings }), [settingsStrings]);
  // Preferences is app-account-kit's App page under its new name, unless the app already renamed it.
  const accountStrings = useMemo<Partial<AccountStrings>>(() => ({ app: words.preferences, yourData: words.yourData, ...strings }), [strings, words.preferences, words.yourData]);
  const exportPage = dataExport ? (
    <DataExportPage
      formats={dataExport.formats}
      onLocked={dataExport.onLocked}
      onError={dataExport.onError ?? rest.onError}
      onProblem={dataExport.onProblem}
      renderProblem={dataExport.renderProblem}
      Row={dataExport.Row}
      problemText={words.exportFailed}
    />
  ) : null;
  const pages = assemblePages({
    dataExport: dataExport ? { row: dataExport, content: exportPage } : undefined,
    plan: plan ? { row: plan, content: plan.content } : undefined,
    extraPages,
    order,
    strings: words,
  });
  return <SettingsScreen {...rest} strings={accountStrings} app={preferences !== undefined ? { content: preferences } : undefined} extraPages={pages.extraPages} hubOrder={pages.hubOrder} />;
}
