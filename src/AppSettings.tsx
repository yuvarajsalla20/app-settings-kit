import { SettingsScreen, type AboutProps, type AccountStrings, type ExitMenuProps } from 'app-account-kit';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { assemblePages } from './assemble';
import { cardHeadings, missingAboutParts, titleCaseStrings } from './logic/about';
import { kitList, type KitSource } from './logic/kits';
import { versionLines, type VersionParts } from './logic/version';
import { makeBackButton } from './parts/BackButton';
import { EdgeSwipeBack } from './parts/EdgeSwipeBack';
import { DataExportPage, exportMenu } from './pages/DataExportPage';
import { createOneAtATime } from './logic/oneAtATime';
import { DEFAULT_SETTINGS_STRINGS, type SettingsStrings } from './strings';
import type { DataExportConfig, DataExportPlace, ExtraPage, PlanConfig } from './types';

type AccountScreenProps = ComponentProps<typeof SettingsScreen>;

export type AppSettingsProps = Omit<AccountScreenProps, 'app' | 'extraPages' | 'hubOrder' | 'about' | 'exitMenu'> & {
  /**
   * Sign out and Delete account behind a ⋯ menu on Account, each on its own page (since 3.0.0, ON by default).
   * Pass app-account-kit's `ExitMenuProps` to add the optional unlock step or the "You will lose" lines; pass `false` to keep both on the main list as in 2.x.
   * Since 3.2.0, `{ place: 'page' }` swaps the ⋯ for an Access row at the bottom of Account that opens a page with Log Out and a red Close Account.
   */
  exitMenu?: ExitMenuProps | false;
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
  /**
   * Where the Data Export row lives (since 2.2.0): `'account'` (the default, as in 2.1) or `'preferences'`, a row on Preferences under the app's own settings.
   * Back from Data Export returns to that parent.
   */
  dataExportIn?: DataExportPlace;
  /** More pages of the app's own (Connect as Family, say). Add `under: 'preferences'` to make one a row on Preferences, or `under: 'account'` for Account. */
  extraPages?: readonly ExtraPage[];
  /** The list order. Default About, Account, Preferences, plan (`DEFAULT_ORDER`); use "plan" for the plan page and an extra page's id for the app's. Data Export is never on the list. */
  order?: readonly string[];
  /** This kit's words. Define once, outside the component. */
  settingsStrings?: Partial<SettingsStrings>;
};

/** The ⋯ menu with no extras: no unlock step, no "You will lose" lines. One object, so the screen does not see a new value on every render. */
const DEFAULT_EXIT_MENU: ExitMenuProps = Object.freeze({});

/**
 * The standard Settings screen in one config: four parents, About, Account, Preferences and the plan page. Sign out and Delete account sit behind a ⋯ on Account (`exitMenu={false}` puts them back on the list).
 * Data Export (a lock per format) is a feature, so it is a row inside Account, called Data Export, or inside Preferences with `dataExportIn: 'preferences'`.
 * Everything app-account-kit takes (theme, strings, components, profile, about, actions...) passes straight through.
 */
export function AppSettings({ preferences, dataExport, dataExportIn, plan, extraPages, order, settingsStrings, strings, about: aboutIn, build, kitSources, components: componentsIn, exitMenu = DEFAULT_EXIT_MENU, ...rest }: AppSettingsProps) {
  // Version and Kits filled in from the build and package.json, unless the app passed its own.
  const about = useMemo<AboutProps>(() => {
    const filled = build ? versionLines(build) : undefined;
    const version = aboutIn.version ?? (filled ? { number: build!.version, ...filled } : { number: '', label: '' });
    const kits = aboutIn.kits ?? (kitSources ? kitList(kitSources.dependencies, kitSources.kits) : undefined);
    return { ...aboutIn, version, kits };
  }, [aboutIn, build, kitSources]);
  // The approved round Back button (in the theme's accent) and swipe-from-the-edge to go back, unless the app brings its own.
  // Made again only when a color it uses changes, so an app that writes its theme inline does not remount the button on every render.
  const { accent, ink, text } = rest.theme;
  const shadow = (rest.theme as { shadow?: string }).shadow;
  const BackButton = useMemo(() => makeBackButton({ accent, ink, text, shadow }), [accent, ink, text, shadow]);
  const components = useMemo(() => ({ BackButton, EdgeSwipe: EdgeSwipeBack, ...componentsIn }), [BackButton, componentsIn]);
  const words = useMemo(() => ({ ...DEFAULT_SETTINGS_STRINGS, ...settingsStrings }), [settingsStrings]);
  // Preferences is app-account-kit's App page under its new name, unless the app already renamed it.
  // The approved Title Case words ("Rate MyApp", "Contact Support"), then this kit's page names, then anything the app rewords.
  const appName = about.appName;
  const accountStrings = useMemo<Partial<AccountStrings>>(
    () => ({
      ...titleCaseStrings(appName),
      ...cardHeadings(appName),
      // 3.4.0: with Log Out as its own row, the row under it holds only Close Account, so it reads "Deactivate" in every app.
      ...(exitMenu && exitMenu.signOutOnAccount ? { access: 'Deactivate' } : {}),
      app: words.preferences,
      ...(words.account !== undefined ? { account: words.account } : {}),
      ...strings,
    }),
    [appName, strings, words.preferences, words.account, exitMenu],
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
  // 3.3.0 dataExport.menu: the row opens a pull-down menu, one line per format, one file at a time.
  const report = useRef({ onError: dataExport?.onError ?? rest.onError, onProblem: dataExport?.onProblem, text: words.exportFailed });
  report.current = { onError: dataExport?.onError ?? rest.onError, onProblem: dataExport?.onProblem, text: words.exportFailed };
  const runner = useRef<ReturnType<typeof createOneAtATime> | null>(null);
  runner.current ??= createOneAtATime((error) => {
    report.current.onError?.('data-export', error);
    report.current.onProblem?.(report.current.text);
  });
  const menu = dataExport?.menu ? exportMenu(dataExport, (job) => runner.current?.run(job)) : undefined;
  const pages = assemblePages({
    dataExport: dataExport ? { row: dataExport, content: menu ? null : exportPage, menu } : undefined,
    plan: plan ? { row: plan, content: plan.content } : undefined,
    extraPages,
    order,
    dataExportIn,
    strings: words,
  });
  return <SettingsScreen {...rest} exitMenu={exitMenu === false ? undefined : exitMenu} about={about} components={components} strings={accountStrings} app={preferences !== undefined ? { content: preferences } : undefined} extraPages={pages.extraPages} hubOrder={pages.hubOrder} />;
}
