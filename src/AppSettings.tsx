import { SettingsScreen, type AboutProps, type AccountStrings } from 'app-account-kit';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { assemblePages } from './assemble';
import { missingAboutParts, titleCaseStrings } from './logic/about';
import { kitList, type KitSource } from './logic/kits';
import { versionLines, type VersionParts } from './logic/version';
import { makeBackButton } from './parts/BackButton';
import { EdgeSwipeBack } from './parts/EdgeSwipeBack';
import { DataExportPage } from './pages/DataExportPage';
import { DEFAULT_SETTINGS_STRINGS, type SettingsStrings } from './strings';
import type { DataExportConfig, ExtraPage, PlanConfig } from './types';

type AccountScreenProps = ComponentProps<typeof SettingsScreen>;

export type AppSettingsProps = Omit<AccountScreenProps, 'app' | 'extraPages' | 'hubOrder' | 'about'> & {
  /** The About page. `version` and `kits` can be left out when `build` and `kitSources` are passed: the kit fills them in. */
  about: Omit<AboutProps, 'version'> & { version?: AboutProps['version'] };
  /** The app's version, build number and build stamp (from `app-settings-kit/build-stamp`). Fills About > Version as "v1.2.0 | Build 12" and the build time. */
  build?: VersionParts;
  /** The kits the app uses and its package.json `dependencies`. Fills About > Kits, with each kit's build read from its pin. */
  kitSources?: { dependencies: Readonly<Record<string, string>>; kits: readonly KitSource[] };
  /** The app's own settings (currency, reminders...), built with SettingsGroup and SettingRow. Leave out to hide Preferences. */
  preferences?: ReactNode;
  /** The Data Export page, a row straight on Account (no heading), called Data Export. Leave out to hide it. To open it from another page (the plan page's perk), use `useSettingsNav().open(DEFAULT_IDS.export)` (or its own id). */
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
 * Data Export (a lock per format) is a feature, so it is a row inside Account, called Data Export.
 * Everything app-account-kit takes (theme, strings, components, profile, about, actions...) passes straight through.
 */
export function AppSettings({ preferences, dataExport, plan, extraPages, order, settingsStrings, strings, about: aboutIn, build, kitSources, components: componentsIn, ...rest }: AppSettingsProps) {
  // Version and Kits filled in from the build and package.json, unless the app passed its own.
  const about = useMemo<AboutProps>(() => {
    const filled = build ? versionLines(build) : undefined;
    const version = aboutIn.version ?? (filled ? { number: build!.version, ...filled } : { number: '', label: '' });
    const kits = aboutIn.kits ?? (kitSources ? kitList(kitSources.dependencies, kitSources.kits) : undefined);
    return { ...aboutIn, version, kits };
  }, [aboutIn, build, kitSources]);
  // The approved round Back button (in the theme's accent) and swipe-from-the-edge to go back, unless the app brings its own.
  const theme = rest.theme;
  const components = useMemo(
    () => ({ BackButton: makeBackButton(theme), EdgeSwipe: EdgeSwipeBack, ...componentsIn }),
    [theme, componentsIn],
  );
  const words = useMemo(() => ({ ...DEFAULT_SETTINGS_STRINGS, ...settingsStrings }), [settingsStrings]);
  // Preferences is app-account-kit's App page under its new name, unless the app already renamed it.
  // The approved Title Case words ("Rate MyApp", "Contact Support"), then this kit's page names, then anything the app rewords.
  const appName = about.appName;
  const accountStrings = useMemo<Partial<AccountStrings>>(
    () => ({ ...titleCaseStrings(appName), app: words.preferences, ...strings }),
    [appName, strings, words.preferences],
  );
  // The approved About page has the app's picture, Features, Rate, Share and Kits. Say in development which ones this app is missing.
  const missing = missingAboutParts(about).join(', ');
  useEffect(() => {
    if (missing && typeof __DEV__ !== 'undefined' && __DEV__) console.warn(`app-settings-kit: About is missing ${missing}. Pass them in "about" to get the full About page.`);
  }, [missing]);
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
  return <SettingsScreen {...rest} about={about} components={components} strings={accountStrings} app={preferences !== undefined ? { content: preferences } : undefined} extraPages={pages.extraPages} hubOrder={pages.hubOrder} />;
}
