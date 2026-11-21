import { SettingsScreen, type AboutProps, type AccountStrings, type ActionsProps, type ExitMenuProps } from 'app-account-kit';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { assemblePages } from './assemble';
import { aboutProblems, cardHeadings, logoPixels, titleCaseStrings } from './logic/about';
import { kitList, type KitSource } from './logic/kits';
import { versionLines, type VersionParts } from './logic/version';
import { makeBackButton } from './parts/BackButton';
import { EdgeSwipeBack } from './parts/EdgeSwipeBack';
import { exportMenu } from './pages/DataExportPage';
import { createOneAtATime } from './logic/oneAtATime';
import { DEFAULT_SETTINGS_STRINGS, type SettingsStrings } from './strings';
import type { DataExportConfig, ExtraPage, PlanConfig } from './types';

type AccountScreenProps = ComponentProps<typeof SettingsScreen>;

/**
 * 5.0.0: what an app gives the About page. Everything the approved page shows is required.
 */
export type AboutConfig = Omit<AboutProps, 'version' | 'logo' | 'showHeader' | 'featuresUrl' | 'rate' | 'share' | 'kits'> & {
  /**
   * The app's one master logo (its glossy app icon), shown under the About title at 104 pt. Pass the same file the app uses
   * everywhere, at least 312 px square (3x) so it stays sharp; 1024 px is best. Smaller images are flagged in development.
   */
  logo: NonNullable<AboutProps['logo']>;
  /** A secure (https) page listing what the app does. The Features row. */
  featuresUrl: string;
  /** The app's App Store number (digits, such as 6830296391). The Rate row opens its review screen, and Share sends its App Store page. */
  appStoreId: string;
  /** Optional: the Google Play package name (com.example.app), for Rate on Android. */
  playPackage?: string;
  /** Optional: the words sent with Share. The kit's default names the app. */
  shareMessage?: string;
};

/** The App Store page for an app number, which Share sends. */
export const appStorePage = (appStoreId: string) => `https://apps.apple.com/app/id${appStoreId.trim()}`;

export type AppSettingsProps = Omit<AccountScreenProps, 'app' | 'extraPages' | 'hubOrder' | 'about' | 'exitMenu' | 'photo' | 'actions' | 'plainHeaders' | 'data'> & {
  /**
   * 6.0.0: Log Out and Erase Account are on Profile in every app, laid out by the kit. An app adds only the optional unlock step
   * or the "You will lose" lines.
   */
  exitMenu?: Pick<ExitMenuProps, 'unlock' | 'losses'>;
  /** 6.0.0: Log Out and Erase Account are required, so both rows are always there. */
  actions: ActionsProps & Required<Pick<ActionsProps, 'onSignOut' | 'onDeleteAccount'>>;
  /**
   * The About page. 5.0.0: every part of the approved About is required, so no app can leave a row out by accident:
   * the logo (shown under the About title), Features, Rate and Share (both from `appStoreId`), Contact Support, Privacy Policy,
   * and Version and Kits (from `build` and `kitSources`).
   */
  about: AboutConfig;
  /** The app's version, build number and build stamp (from `app-settings-kit/build-stamp`). Fills About > Version as "v1.2.0 | Build 12" and the build time. Required (5.0.0). */
  build: VersionParts;
  /** The kits the app uses and its package.json `dependencies`. Fills About > Kits, with each kit's build read from its pin. Required (5.0.0). */
  kitSources: { dependencies: Readonly<Record<string, string>>; kits: readonly KitSource[] };
  /** The app's own settings (reminders, currency...), built with SettingsGroup and SettingRow. Required (5.0.0): every app has Preferences. Theme and security rows, when an app has them, go here. */
  preferences: ReactNode;
  /** The Data Export page, a row on Profile, called Data Export. Required (5.0.0). To open it from another page (the plan page's perk), use `useSettingsNav().open(DEFAULT_IDS.export)` (or its own id). */
  dataExport: DataExportConfig;
  /** The plan page (Premium, VIP). Required (5.0.0): every app on the kit shows its plan. */
  plan: PlanConfig;
  /** Change photo on Profile. Required (5.0.0). */
  photo: NonNullable<AccountScreenProps['photo']>;
  /** More pages of the app's own (Connect as Family, say). Add `under: 'preferences'` to make one a row on Preferences, or `under: 'account'` for Account. */
  extraPages?: readonly ExtraPage[];
};

/**
 * 4.0.0: the approved exit layout is the default in every app. Log Out is its own row on Profile and opens a small menu;
 * the row under it opens the Delete steps at once. One object, so the screen does not see a new value on every render.
 * Pass `{}` for the 3.x ⋯ menu, or `false` to put both back on the main list.
 */
export const DEFAULT_EXIT_MENU: ExitMenuProps = Object.freeze({ place: 'page', signOutOnAccount: true, signOutMenu: true, deleteOnAccess: true });

/** 6.0.0: the approved look, the same in every app. Nothing here can be changed by an app. */
export const LOCKED_LOOK = Object.freeze({ plainHeaders: true, pickers: 'pullDown' as const, centeredPhoto: true });

/** Props an app could pass before 6.0.0 that now belong to the kit. Still read at run time so a JavaScript app is told. */
const LOCKED_PROPS = ['order', 'dataExportIn', 'plainHeaders', 'pickers', 'settingsStrings'] as const;

/**
 * The standard Settings screen in one config: four parents, About, Account, Preferences and the plan page. Sign out and Delete account sit behind a ⋯ on Account (`exitMenu={false}` puts them back on the list).
 * Data Export (a lock per format) is a feature, so it is a row inside Account, called Data Export, or inside Preferences with `dataExportIn: 'preferences'`.
 * Everything app-account-kit takes (theme, strings, components, profile, about, actions...) passes straight through.
 */
export function AppSettings(props: AppSettingsProps) {
  const { preferences, dataExport, plan, extraPages, strings, about: aboutIn, build, kitSources, components: componentsIn, exitMenu: exitExtras, profile: profileIn, ...restIn } = props;
  // 6.0.0: the order, the place of Data Export, the headers, the pickers and the centered photo are the kit's. Anything an app
  // still passes for them is dropped here and named in development.
  const rest = { ...restIn } as typeof restIn & Record<string, unknown>;
  const lockedProps = LOCKED_PROPS.filter((k) => k in rest);
  for (const k of lockedProps) delete rest[k];
  const exitMenu = useMemo<ExitMenuProps>(() => ({ ...DEFAULT_EXIT_MENU, ...(exitExtras?.unlock ? { unlock: exitExtras.unlock } : {}), ...(exitExtras?.losses ? { losses: exitExtras.losses } : {}) }), [exitExtras?.unlock, exitExtras?.losses]);
  const profile = useMemo(() => ({ ...profileIn, centered: LOCKED_LOOK.centeredPhoto }), [profileIn]);
  // Version and Kits filled in from the build and package.json, unless the app passed its own.
  // 5.0.0: the approved About in every app: the title "About" with the logo under it, then every row. Nothing here can be left out.
  const about = useMemo<AboutProps>(() => {
    const { appStoreId, playPackage, shareMessage, ...restAbout } = aboutIn as AboutConfig & { version?: unknown };
    delete (restAbout as { version?: unknown }).version;
    const filled = build ? versionLines(build) : undefined;
    const version = filled ? { number: build.version, ...filled } : { number: '', label: '' };
    const kits = kitSources ? kitList(kitSources.dependencies, kitSources.kits) : undefined;
    return {
      ...restAbout,
      showHeader: 'logo',
      version,
      kits,
      rate: { appStoreId, playPackage },
      share: { url: appStoreId ? appStorePage(appStoreId) : undefined, message: shareMessage },
    };
  }, [aboutIn, build, kitSources]);
  // The approved round Back button (in the theme's accent) and swipe-from-the-edge to go back, unless the app brings its own.
  // Made again only when a color it uses changes, so an app that writes its theme inline does not remount the button on every render.
  const { accent, ink, text } = rest.theme;
  const shadow = (rest.theme as { shadow?: string }).shadow;
  const BackButton = useMemo(() => makeBackButton({ accent, ink, text, shadow }), [accent, ink, text, shadow]);
  // 6.0.0: the kit's Back button and swipe always win; an app still passes its own Text and the like.
  const components = useMemo(() => ({ ...componentsIn, BackButton, EdgeSwipe: EdgeSwipeBack }), [BackButton, componentsIn]);
  // 4.0.0: the kit's words are enforced, so every app reads the same. Only the plan's name (Premium, VIP) is the app's.
  const words = useMemo<SettingsStrings>(() => ({ ...DEFAULT_SETTINGS_STRINGS, plan: plan.name }), [plan.name]);
  const appName = about.appName;
  const locked = useMemo(
    () => ({
      ...titleCaseStrings(appName),
      ...cardHeadings(appName),
      // With Log Out as its own row, the row under it holds only the delete steps, so it reads "Erase Account" in every app (4.0.0; was "Deactivate").
      access: 'Erase Account',
      app: words.preferences,
      account: words.account,
    }),
    [appName, words.preferences, words.account],
  );
  // The app's own sentences (deleteWarning, describeError text...) still come from `strings`; the kit's words always win.
  const accountStrings = useMemo<Partial<AccountStrings>>(() => ({ ...strings, ...locked }), [strings, locked]);
  const ignored = [
    ...Object.keys(strings ?? {}).filter((k) => k in locked && (strings as Record<string, unknown>)[k] !== (locked as Record<string, unknown>)[k]),
    ...lockedProps,
    ...rowOverrides(plan, dataExport),
  ].join(', ');
  useEffect(() => {
    if (ignored && typeof __DEV__ !== 'undefined' && __DEV__) console.warn(`app-settings-kit: ${ignored} are the kit's words and the same in every app, so the app's version is not used. Change them in the kit.`);
  }, [ignored]);
  // 5.0.0: the types require every part; this also catches a value that would still hide a row (a malformed App Store number,
  // a Features page that is not https, a logo too small to stay sharp), and says so in development.
  const problems = aboutProblems(aboutIn, logoPixels(aboutIn.logo)).join(' ');
  useEffect(() => {
    if (problems && typeof __DEV__ !== 'undefined' && __DEV__) console.warn(`app-settings-kit: ${problems}`);
  }, [problems]);
  // The menu has no page to draw on, so renderProblem cannot show there: say so in development instead of dropping it quietly.
  const lostProblem = !!(dataExport.renderProblem && !dataExport.onProblem);
  useEffect(() => {
    if (lostProblem && typeof __DEV__ !== 'undefined' && __DEV__) console.warn('app-settings-kit: dataExport.renderProblem is not shown (Data Export is a menu, with no page). Pass dataExport.onProblem to show the sentence your own way.');
  }, [lostProblem]);
  // 3.3.0 dataExport.menu: the row opens a pull-down menu, one line per format, one file at a time.
  const report = useRef({ onError: dataExport?.onError ?? rest.onError, onProblem: dataExport?.onProblem, text: words.exportFailed });
  report.current = { onError: dataExport?.onError ?? rest.onError, onProblem: dataExport?.onProblem, text: words.exportFailed };
  const runner = useRef<ReturnType<typeof createOneAtATime> | null>(null);
  runner.current ??= createOneAtATime((error) => {
    report.current.onError?.('data-export', error);
    report.current.onProblem?.(report.current.text);
  });
  // 6.0.0: Data Export is always the pull-down menu on its row, with the kit's line at the top.
  const menu = exportMenu({ ...dataExport, menu: { head: words.exportHead } }, (job) => runner.current?.run(job));
  const pages = assemblePages({
    dataExport: { row: kitRow(dataExport), content: null, menu },
    plan: { row: kitRow(plan), content: plan.content },
    extraPages,
    strings: words,
  });
  return <SettingsScreen {...(rest as unknown as AccountScreenProps)} profile={profile} plainHeaders={LOCKED_LOOK.plainHeaders} pickers={LOCKED_LOOK.pickers} exitMenu={exitMenu} about={about} components={components} strings={accountStrings} app={{ content: preferences }} extraPages={pages.extraPages} hubOrder={pages.hubOrder} />;
}

/** 6.0.0: only the page id, the tile color (the app's palette) and the live value or pill come from the app; the name and icon are the kit's. */
const kitRow = (row: { id?: string; tint?: string; value?: string; badge?: ReactNode }) => ({
  ...(row.id ? { id: row.id } : {}),
  ...(row.tint ? { tint: row.tint } : {}),
  ...(row.value !== undefined ? { value: row.value } : {}),
  ...(row.badge !== undefined ? { badge: row.badge } : {}),
});

/** Row parts an app still passes that 6.0.0 no longer reads, for the development warning. */
function rowOverrides(plan: object, dataExport: object): string[] {
  const out: string[] = [];
  for (const [name, row] of [['plan', plan], ['dataExport', dataExport]] as const) {
    for (const k of ['label', 'icon', 'menu']) if (row && k in row) out.push(`${name}.${k}`);
  }
  return out;
}
