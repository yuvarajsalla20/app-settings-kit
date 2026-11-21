import { PickerRow, SettingsGroup, SettingsScreen, themeContrast, MIN_PASSWORD, type AboutProps, type AccountStrings, type ActionsProps, type Choice, type ExitMenuProps } from 'app-account-kit';
import { cameraSupported as defaultCameraSupported, pickProfilePhoto } from 'app-account-kit/photo';
import { Platform } from 'react-native';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { assemblePages } from './assemble';
import { aboutProblems, cardHeadings, logoPixels, titleCaseStrings } from './logic/about';
import { kitList, kitsFromPackage, type AppPackage, type KitSource } from './logic/kits';
import { expoBuild } from './expoBuild';
import { versionLines, type VersionParts } from './logic/version';
import { makeBackButton } from './parts/BackButton';
import { EdgeSwipeBack } from './parts/EdgeSwipeBack';
import { exportMenu } from './pages/DataExportPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
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

/** 8.0.0: the Google Play page for a package name, which Share sends on Android. */
export const playStorePage = (playPackage: string) => `https://play.google.com/store/apps/details?id=${playPackage.trim()}`;

/** 8.0.0: what the Appearance row offers. */
export type AppearanceChoice = 'system' | 'light' | 'dark';

/** 8.0.0: the Appearance choices, the same in every app. */
export const APPEARANCE_CHOICES: readonly Choice<AppearanceChoice>[] = Object.freeze([
  { value: 'system', label: 'System', icon: 'smartphone' },
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
]);

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
  /**
   * @deprecated 8.0.0: About > Version is read from the app itself (app.json's version, the phone's build number, the build time from
   * `app-settings-kit/build-stamp` in app.config.js). Anything passed here is not used.
   */
  build?: VersionParts;
  /**
   * 8.0.0: the app's package.json (`import pkg from '../../package.json'`). About > Kits lists every `app-...-kit` dependency
   * by itself, with its version from `kitVersions` and its build from the pin. The app lists nothing by hand.
   */
  appPackage: AppPackage;
  /** @deprecated 8.0.0: use `appPackage`. Still read when `appPackage` is missing, so 7.x apps keep their Kits list. */
  kitSources?: { dependencies: Readonly<Record<string, string>>; kits: readonly KitSource[] };
  /** The app's own settings (currency, reminders...), built with SettingsGroup and SettingRow. Required (5.0.0): every app has Preferences. */
  preferences: ReactNode;
  /**
   * 8.0.0, optional: the Light / Dark choice. The kit draws it the same way in every app: an Appearance row (System, Light,
   * Dark) in a "Display" card at the end of Preferences.
   */
  appearance?: { value: AppearanceChoice; onChange: (value: AppearanceChoice) => void };
  /**
   * 8.0.0, optional: the app's lock page (app-guard-kit's `SecurityPage`). The kit draws its row the same way in every app:
   * "Security" with a lock, in Preferences.
   */
  security?: { content: ReactNode; value?: string };
  /** The Data Export page, a row on Profile, called Data Export. Required (5.0.0). To open it from another page (the plan page's perk), use `useSettingsNav().open(DEFAULT_IDS.export)` (or its own id). */
  dataExport: DataExportConfig;
  /** The plan page, called Premium in every app (7.0.0). Required (5.0.0): every app on the kit shows its plan. */
  plan: PlanConfig;
  /**
   * Change photo on Profile. Required (5.0.0). 8.0.0: only `onChange` (where to save it) is the app's; the picker and the
   * camera check are app-account-kit's `pickProfilePhoto` and `cameraSupported` unless given.
   */
  photo: Omit<NonNullable<AccountScreenProps['photo']>, 'pick' | 'cameraSupported'> & Partial<Pick<NonNullable<AccountScreenProps['photo']>, 'pick' | 'cameraSupported'>>;
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
  const { preferences, dataExport, plan, extraPages, strings, about: aboutIn, build: ownBuild, appPackage, kitSources, appearance, security, photo: photoIn, password: passwordIn, components: componentsIn, exitMenu: exitExtras, profile: profileIn, ...restIn } = props;
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
    // 8.0.0: Version from the app itself and Kits from its package.json, the same in every app.
    const build = expoBuild();
    const version = { number: build.version, ...versionLines(build) };
    const kits = appPackage ? kitsFromPackage(appPackage) : kitSources ? kitList(kitSources.dependencies, kitSources.kits) : undefined;
    // 8.0.0: Share sends the Google Play page on Android when the app has one, the App Store page everywhere else.
    const shareUrl = Platform.OS === 'android' && playPackage ? playStorePage(playPackage) : appStoreId ? appStorePage(appStoreId) : undefined;
    return {
      ...restAbout,
      showHeader: 'logo',
      version,
      kits,
      rate: { appStoreId, playPackage },
      share: { url: shareUrl, message: shareMessage },
    };
  }, [aboutIn, appPackage, kitSources]);
  // The approved round Back button (in the theme's accent) and swipe-from-the-edge to go back, unless the app brings its own.
  // Made again only when a color it uses changes, so an app that writes its theme inline does not remount the button on every render.
  const { accent, ink, text } = rest.theme;
  const shadow = (rest.theme as { shadow?: string }).shadow;
  const BackButton = useMemo(() => makeBackButton({ accent, ink, text, shadow }), [accent, ink, text, shadow]);
  // 6.0.0: the kit's Back button and swipe always win; an app still passes its own Text and the like.
  const components = useMemo(() => ({ ...componentsIn, BackButton, EdgeSwipe: EdgeSwipeBack }), [BackButton, componentsIn]);
  // 4.0.0: the kit's words are enforced, so every app reads the same. 7.0.0: the plan's name too: "Premium" in every app.
  const words: SettingsStrings = DEFAULT_SETTINGS_STRINGS;
  const appName = about.appName;
  const locked = useMemo(
    () => ({
      ...titleCaseStrings(appName),
      ...cardHeadings(appName),
      // With Log Out as its own row, the row under it holds only the delete steps, so it reads "Erase Account" in every app (4.0.0; was "Deactivate").
      access: 'Erase Account',
      app: words.preferences,
      account: words.account,
      // 8.0.0: the Erase Account warning is the kit's too.
      deleteWarning: words.deleteWarning(words.plan, !!plan.subscribed),
    }),
    [appName, words, plan.subscribed],
  );
  // The app's own sentences (deleteWarning, describeError text...) still come from `strings`; the kit's words always win.
  const accountStrings = useMemo<Partial<AccountStrings>>(() => ({ ...strings, ...locked }), [strings, locked]);
  const ignored = [
    ...Object.keys(strings ?? {}).filter((k) => k in locked && (strings as Record<string, unknown>)[k] !== (locked as Record<string, unknown>)[k]),
    ...lockedProps,
    ...rowOverrides(plan, dataExport),
    ...(plan.name !== undefined && plan.name !== DEFAULT_SETTINGS_STRINGS.plan ? ['plan.name'] : []),
    // 8.0.0: the tile colors of the kit's rows and the Version line are the kit's.
    ...(plan.tint !== undefined ? ['plan.tint'] : []),
    ...(dataExport.tint !== undefined ? ['dataExport.tint'] : []),
    ...(ownBuild !== undefined ? ['build'] : []),
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
  // 8.0.0: text the app's theme makes hard to read (in its Light or Dark look, whichever is showing), said in development.
  const contrast = useMemo(() => themeContrast(rest.theme, rest.theme.surface).map((p) => `${p.pair} is ${p.ratio ?? 'unreadable'}:1 (needs ${p.min}:1)`).join('; '), [rest.theme]);
  useEffect(() => {
    if (contrast && typeof __DEV__ !== 'undefined' && __DEV__) console.warn(`app-settings-kit: hard to read in this look: ${contrast}.`);
  }, [contrast]);
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
  // 7.0.0: an app with nothing on sale yet passes no content; the kit draws the standard Coming Soon page and the row reads "Coming Soon".
  const comingSoon = plan.content === undefined || plan.content === null;
  // 8.0.0: the kit's rows take their tile color from the theme, the same key in every app (the plan: Rate's gold; Data Export: data).
  const tints = rest.theme.tints;
  const planTint = tints.rate;
  const planSection = comingSoon
    ? {
        row: kitRow({ id: plan.id, tint: planTint, value: words.comingSoon }),
        content: <ComingSoonPage appName={appName} planName={words.plan} tint={planTint} features={plan.features} freeFeatures={plan.freeFeatures} strings={words} />,
      }
    : { row: kitRow({ ...plan, tint: planTint }), content: plan.content };
  // 8.0.0: Security, when the app has one, is the kit's row in Preferences.
  const allPages: readonly ExtraPage[] = security
    ? [...(extraPages ?? []), { id: 'security', label: words.security, icon: 'lock', tint: tints.password, under: 'preferences', content: security.content, ...(security.value !== undefined ? { value: security.value } : {}) }]
    : (extraPages ?? []);
  // 8.0.0: Appearance, when the app has one, is the kit's row in a Display card at the end of Preferences.
  const preferencesPage = appearance ? (
    <>
      {preferences}
      <SettingsGroup title={words.display}>
        <PickerRow<AppearanceChoice> icon="sun" tint={tints.app} label={words.appearance} options={APPEARANCE_CHOICES} value={appearance.value} onChange={appearance.onChange} last />
      </SettingsGroup>
    </>
  ) : (
    preferences
  );
  // 8.0.0: the photo picker and the camera check are app-account-kit's unless the app brings its own; the password length is the kit's.
  const photo = useMemo(() => ({ pick: pickProfilePhoto, cameraSupported: defaultCameraSupported, ...photoIn }), [photoIn]);
  const password = useMemo(() => (passwordIn ? { minLength: MIN_PASSWORD, ...passwordIn } : undefined), [passwordIn]);
  const pages = assemblePages({
    dataExport: { row: kitRow({ ...dataExport, tint: tints.data }), content: null, menu },
    plan: planSection,
    extraPages: allPages,
    strings: words,
  });
  return <SettingsScreen {...(rest as unknown as AccountScreenProps)} profile={profile} plainHeaders={LOCKED_LOOK.plainHeaders} pickers={LOCKED_LOOK.pickers} exitMenu={exitMenu} about={about} components={components} strings={accountStrings} app={{ content: preferencesPage }} photo={photo} password={password} extraPages={pages.extraPages} hubOrder={pages.hubOrder} />;
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
