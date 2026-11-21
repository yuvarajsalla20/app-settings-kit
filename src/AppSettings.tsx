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
  /** 4.0.0: only the plan's name (Premium, VIP). Every other word is the kit's and the same in every app. */
  settingsStrings?: Pick<Partial<SettingsStrings>, 'plan'>;
};

/**
 * 4.0.0: the approved exit layout is the default in every app. Log Out is its own row on Profile and opens a small menu;
 * the row under it opens the Delete steps at once. One object, so the screen does not see a new value on every render.
 * Pass `{}` for the 3.x ⋯ menu, or `false` to put both back on the main list.
 */
export const DEFAULT_EXIT_MENU: ExitMenuProps = Object.freeze({ place: 'page', signOutOnAccount: true, signOutMenu: true, deleteOnAccess: true });

/**
 * The standard Settings screen in one config: four parents, About, Account, Preferences and the plan page. Sign out and Delete account sit behind a ⋯ on Account (`exitMenu={false}` puts them back on the list).
 * Data Export (a lock per format) is a feature, so it is a row inside Account, called Data Export, or inside Preferences with `dataExportIn: 'preferences'`.
 * Everything app-account-kit takes (theme, strings, components, profile, about, actions...) passes straight through.
 */
export function AppSettings({ preferences, dataExport, dataExportIn, plan, extraPages, order, settingsStrings, strings, about: aboutIn, build, kitSources, components: componentsIn, exitMenu = DEFAULT_EXIT_MENU, plainHeaders = true, pickers = 'pullDown', profile: profileIn, ...rest }: AppSettingsProps) {
  // 4.0.0: the approved look is the default, so an app passes nothing to get it: plain page headers (no logo), pull-down pickers,
  // the profile photo centered, and no logo and name at the top of About. Each still turns off with its own value.
  const profile = useMemo(() => (profileIn ? { centered: true, ...profileIn } : profileIn), [profileIn]);
  // Version and Kits filled in from the build and package.json, unless the app passed its own.
  const about = useMemo<AboutProps>(() => {
    const filled = build ? versionLines(build) : undefined;
    const version = aboutIn.version ?? (filled ? { number: build!.version, ...filled } : { number: '', label: '' });
    const kits = aboutIn.kits ?? (kitSources ? kitList(kitSources.dependencies, kitSources.kits) : undefined);
    return { showHeader: false, ...aboutIn, version, kits };
  }, [aboutIn, build, kitSources]);
  // The approved round Back button (in the theme's accent) and swipe-from-the-edge to go back, unless the app brings its own.
  // Made again only when a color it uses changes, so an app that writes its theme inline does not remount the button on every render.
  const { accent, ink, text } = rest.theme;
  const shadow = (rest.theme as { shadow?: string }).shadow;
  const BackButton = useMemo(() => makeBackButton({ accent, ink, text, shadow }), [accent, ink, text, shadow]);
  const components = useMemo(() => ({ BackButton, EdgeSwipe: EdgeSwipeBack, ...componentsIn }), [BackButton, componentsIn]);
  // 4.0.0: the kit's words are enforced, so every app reads the same. Only the plan's name (Premium, VIP) is the app's.
  const words = useMemo(() => ({ ...DEFAULT_SETTINGS_STRINGS, ...(settingsStrings?.plan !== undefined ? { plan: settingsStrings.plan } : {}) }), [settingsStrings?.plan]);
  const appName = about.appName;
  const locked = useMemo(
    () => ({
      ...titleCaseStrings(appName),
      ...cardHeadings(appName),
      // With Log Out as its own row, the row under it holds only the delete steps, so it reads "Erase Account" in every app (4.0.0; was "Deactivate").
      ...(exitMenu && exitMenu.signOutOnAccount ? { access: 'Erase Account' } : {}),
      app: words.preferences,
      account: words.account,
    }),
    [appName, words.preferences, words.account, exitMenu],
  );
  // The app's own sentences (deleteWarning, describeError text...) still come from `strings`; the kit's words always win.
  const accountStrings = useMemo<Partial<AccountStrings>>(() => ({ ...strings, ...locked }), [strings, locked]);
  const ignored = [
    ...Object.keys(strings ?? {}).filter((k) => k in locked && (strings as Record<string, unknown>)[k] !== (locked as Record<string, unknown>)[k]),
    ...Object.keys(settingsStrings ?? {}).filter((k) => k !== 'plan'),
  ].join(', ');
  useEffect(() => {
    if (ignored && typeof __DEV__ !== 'undefined' && __DEV__) console.warn(`app-settings-kit: ${ignored} are the kit's words and the same in every app, so the app's version is not used. Change them in the kit.`);
  }, [ignored]);
  // The approved About page has the app's picture, Features, Rate, Share and Kits. Say in development which ones this app is missing.
  const missing = missingAboutParts(about).join(', ');
  useEffect(() => {
    if (missing && typeof __DEV__ !== 'undefined' && __DEV__) console.warn(`app-settings-kit: About is missing ${missing}. Pass them in "about" to get the full About page.`);
  }, [missing]);
  // The menu has no page to draw on, so renderProblem cannot show there: say so in development instead of dropping it quietly.
  const lostProblem = !!(dataExport?.menu && dataExport.renderProblem && !dataExport.onProblem);
  useEffect(() => {
    if (lostProblem && typeof __DEV__ !== 'undefined' && __DEV__) console.warn('app-settings-kit: dataExport.renderProblem is not shown with dataExport.menu (there is no page). Pass dataExport.onProblem to show the sentence your own way.');
  }, [lostProblem]);
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
  return <SettingsScreen {...rest} profile={profile} plainHeaders={plainHeaders} pickers={pickers} exitMenu={exitMenu === false ? undefined : exitMenu} about={about} components={components} strings={accountStrings} app={preferences !== undefined ? { content: preferences } : undefined} extraPages={pages.extraPages} hubOrder={pages.hubOrder} />;
}
