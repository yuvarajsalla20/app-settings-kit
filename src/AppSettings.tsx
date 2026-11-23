import { PickerRow, SettingsGroup, SettingsScreen, supportMailUrl, themeContrast, usePlanMode, MIN_PASSWORD, type AboutProps, type AccountStrings, type ActionsProps, type Choice, type ExitMenuProps } from 'app-account-kit';
import { cameraSupported as defaultCameraSupported, pickProfilePhoto } from 'app-account-kit/photo';
import { Platform, Text, View } from 'react-native';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { assemblePages } from './assemble';
import { DEFAULT_IDS } from './logic/order';
import { aboutProblems, cardHeadings, logoPixels, titleCaseStrings } from './logic/about';
import { kitList, kitsFromPackage, type AppPackage, type KitSource } from './logic/kits';
import { expoBuild, expoPlayPackage } from './expoBuild';
import { versionLines, type VersionParts } from './logic/version';
import { makeBackButton } from './parts/BackButton';
import { EdgeSwipeBack } from './parts/EdgeSwipeBack';
import { exportMenu } from './pages/DataExportPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { PlanCompare, featureParts } from './pages/PlanCompare';
import { createOneAtATime } from './logic/oneAtATime';
import { DEFAULT_SETTINGS_STRINGS, type SettingsStrings } from './strings';
import type { DataExportConfig, ExtraPage, PlanConfig, PlanFeature } from './types';
import { ContactSupportPage } from './pages/ContactSupportPage';
import { pickScreenshot } from './parts/pickScreenshot';
import { supportDevice, type SupportTransport } from './logic/support';
import { useSupportForm } from './logic/useSupportForm';

/** 12.0.0: a plan feature line that names Data Export. */
const EXPORT_WORD = /data export/i;

type AccountScreenProps = ComponentProps<typeof SettingsScreen>;

/**
 * 5.0.0: what an app gives the About page. Everything the approved page shows is required.
 */
export type AboutConfig = Omit<AboutProps, 'version' | 'logo' | 'showHeader' | 'featuresUrl' | 'rate' | 'share' | 'kits' | 'supportPage'> & {
  /**
   * The app's one master logo (its glossy app icon), shown under the About title at 104 pt. Pass the same file the app uses
   * everywhere, at least 312 px square (3x) so it stays sharp; 1024 px is best. Smaller images are flagged in development.
   */
  logo: NonNullable<AboutProps['logo']>;
  /** A secure (https) page listing what the app does. The Features row. */
  featuresUrl: string;
  /** The app's App Store number (digits, such as 6830296391). The Rate row opens its review screen, and Share sends its App Store page. */
  appStoreId: string;
  /** Deprecated in 9.1.0: the kit reads the Google Play package from app.json (expo.android.package). Used only when app.json has none. */
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
   * The Light / Dark choice. The kit draws it the same way in every app: an Appearance row (System, Light, Dark) in a
   * "Display" card at the end of Preferences. 12.0.0: required and free in every app; the app gives the choice and keeps it.
   */
  appearance: { value: AppearanceChoice; onChange: (value: AppearanceChoice) => void };
  /**
   * 8.0.0, optional: the app's lock page (app-guard-kit's `SecurityPage`). The kit draws its row the same way in every app:
   * "Security" with a lock, in Preferences. 12.0.0: Security is the only part of Settings an app turns on or off, and it is
   * free in every app that has it.
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
  /**
   * 15.0.0: how About › Contact Support sends a message from the kit's in-app form. Apps on Firebase pass
   * `firestoreSupport(db, auth)` from `app-settings-kit/support-firestore`; the message goes to `about.supportEmail` with the
   * person's email as Reply-To. The page, its words, topics and limits are the kit's.
   * 16.0.0: optional. The form shows only while the owner's switch is on (`supportForm: true` in Firestore `config/app` for
   * `firestoreSupport`); otherwise, and without `support`, Contact Support opens the Mail app as before.
   */
  support?: SupportTransport;
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
  const { support, preferences, dataExport, plan, extraPages, strings, about: aboutIn, build: ownBuild, appPackage, kitSources, appearance, security, photo: photoIn, password: passwordIn, components: componentsIn, exitMenu: exitExtras, profile: profileIn, ...restIn } = props;
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
    const { appStoreId, playPackage: ownPlayPackage, shareMessage, ...restAbout } = aboutIn as AboutConfig & { version?: unknown; supportPage?: ReactNode };
    delete (restAbout as { version?: unknown }).version;
    delete (restAbout as { supportPage?: unknown }).supportPage;
    // 8.0.0: Version from the app itself and Kits from its package.json, the same in every app.
    const build = expoBuild();
    const version = { number: build.version, ...versionLines(build) };
    const kits = appPackage ? kitsFromPackage(appPackage) : kitSources ? kitList(kitSources.dependencies, kitSources.kits) : undefined;
    // 9.1.0: the Google Play id comes from app.json, so Share and Rate work on Android in every app without app code.
    const playPackage = expoPlayPackage() ?? ownPlayPackage;
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
  // 18.0.0: with nothing on sale (plan mode 'free', the default; app-subscriptions-kit sets it from config/app) the plan row
  // reads Plan · Free with no page, every feature is open, and nobody holds a subscription to cancel.
  const selling = usePlanMode() === 'subscription';
  const subscribed = selling && !!plan.subscribed;
  const locked = useMemo(
    () => ({
      ...titleCaseStrings(appName),
      ...cardHeadings(appName),
      // With Log Out as its own row, the row under it holds only the delete steps, so it reads "Erase Account" in every app (4.0.0; was "Deactivate").
      access: 'Erase Account',
      app: words.preferences,
      account: words.account,
      // 8.0.0: the Erase Account warning is the kit's too.
      deleteWarning: words.deleteWarning(words.plan, subscribed, Platform.OS),
    }),
    [appName, words, subscribed],
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
  // 10.0.0: the comparison needs both lists; an empty one is said in development (the types already require them).
  // 14.0.0 Page rule: the comparison shows only while nothing is on sale (Coming Soon); with a plan on sale it lives on the Plans screen.
  const missingLists = plan.content === undefined || plan.content === null ? [!plan.features?.length && 'plan.features', !plan.freeFeatures?.length && 'plan.freeFeatures'].filter(Boolean).join(' and ') : '';
  useEffect(() => {
    if (missingLists && typeof __DEV__ !== 'undefined' && __DEV__) console.warn(`app-settings-kit: ${missingLists} is empty. The Coming Soon page shows the Free and Premium comparison, so list what the plan adds and what is free.`);
  }, [missingLists]);
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
  // 12.0.0: Data Export is Premium in every app. Every format is locked unless the account pays for Premium (`plan.subscribed`);
  // a format's own `locked` is not used, so no app can make export free. A tap on the lock opens the plan page unless the
  // app passes its own `onLocked` (e.g., its plans screen).
  // 18.0.0: open to everyone while the plan mode is 'free'.
  const exportOpen = !selling || !!plan.subscribed;
  const exportFormats = useMemo(() => dataExport.formats.map((f) => ({ ...f, locked: !exportOpen })), [dataExport.formats, exportOpen]);
  const ownLocks = dataExport.formats.some((f) => 'locked' in f);
  useEffect(() => {
    if (ownLocks && typeof __DEV__ !== 'undefined' && __DEV__) console.warn('app-settings-kit: dataExport.formats[].locked is not used. Data Export is Premium in every app: the kit locks every format unless plan.subscribed is true.');
  }, [ownLocks]);
  const menu = exportMenu({ ...dataExport, formats: exportFormats, menu: { head: words.exportHead } }, (job) => runner.current?.run(job));
  // 7.0.0: an app with nothing on sale yet passes no content; the kit draws the standard Coming Soon page.
  // 13.0.0: the row is "Subscription" with nothing on its right in every app (no Free, Premium or Coming Soon beside it);
  // the plan the account holds is shown on the page. The app's `plan.value` and `plan.badge` are not used.
  const comingSoon = plan.content === undefined || plan.content === null;
  // 8.0.0: the kit's rows take their tile color from the theme, the same key in every app (the plan: Rate's gold; Data Export: data).
  const tints = rest.theme.tints;
  const planTint = tints.rate;
  // 10.0.0: every plan page ends with the kit's Free and Premium comparison, on sale or Coming Soon, so Premium features
  // always read apart from free ones. The app gives the two lists; the table, its words and its colors are the kit's.
  // 12.0.0: Data Export is Premium in every app, so the comparison always lists it under Premium. An app that names it in
  // its own `features` keeps its line; otherwise the kit adds "Data Export" with the formats (e.g., "CSV File or PDF File").
  const exportFormatWords = dataExport.formats.map((f) => f.label).join(' or ');
  const premiumFeatures = useMemo<readonly PlanFeature[]>(() => {
    const own = plan.features ?? [];
    if (own.some((f) => EXPORT_WORD.test(featureParts(f).label))) return own;
    return [...own, { label: words.dataExport, icon: 'download', ...(exportFormatWords ? { detail: exportFormatWords } : {}) }];
  }, [plan.features, words.dataExport, exportFormatWords]);
  const exportListedFree = (plan.freeFeatures ?? []).some((f) => EXPORT_WORD.test(featureParts(f).label));
  useEffect(() => {
    if (exportListedFree && typeof __DEV__ !== 'undefined' && __DEV__) console.warn('app-settings-kit: plan.freeFeatures names Data Export, which is Premium in every app. Remove it from the free list.');
  }, [exportListedFree]);
  const compare = (
    <PlanCompare theme={rest.theme} gold={planTint} planName={words.plan} features={premiumFeatures} freeFeatures={plan.freeFeatures ?? []}
      subscribed={!!plan.subscribed} Text={componentsIn?.Text as never} strings={words} />
  );
  const planSection = !selling
    ? {
        // 18.0.0: Plan · Free, a row that only states the plan: no arrow, no page.
        row: kitRow({ id: plan.id, tint: planTint }),
        content: null,
        info: true,
      }
    : comingSoon
    ? {
        row: kitRow({ id: plan.id, tint: planTint }),
        content: (
          <View style={{ gap: 16 }}>
            <ComingSoonPage appName={appName} planName={words.plan} tint={planTint} theme={rest.theme} Text={componentsIn?.Text as never} strings={words} />
            {compare}
          </View>
        ),
      }
    : {
        row: kitRow({ id: plan.id, tint: planTint }),
        // 14.0.0 Page rule: with a plan on sale the Subscription page holds plan facts only; the comparison is on the Plans screen.
        content: plan.content,
      };
  // 8.0.0: Security, when the app has one, is the kit's row in Preferences.
  const allPages: readonly ExtraPage[] = security
    ? [...(extraPages ?? []), { id: 'security', label: words.security, icon: 'lock', tint: tints.password, under: 'preferences', content: security.content, ...(security.value !== undefined ? { value: security.value } : {}) }]
    : (extraPages ?? []);
  // 8.0.0: Appearance is the kit's row in a Display card at the end of Preferences. 12.0.0: every app has it, free.
  const noAppearance = !appearance;
  useEffect(() => {
    if (noAppearance && typeof __DEV__ !== 'undefined' && __DEV__) console.warn('app-settings-kit: appearance is required. Every app offers System, Light and Dark: pass appearance={{ value, onChange }}.');
  }, [noAppearance]);
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
  // 11.0.0: Data Export is a Premium feature in every app: the gold Premium tag after its name for every account. While the
  // account does not pay for Premium (12.0.0) the row shows only the gold padlock, and a tap opens the plan page (or the app's
  // `onLocked`); once it does, the Choose menu. The app's own value and badge are not used, so every app reads the same.
  const exportLocked = !exportOpen;
  // 15.0.0: About › Contact Support is the kit's in-app form, with the details it adds from the app and the phone.
  // 16.0.0: only while the owner's switch is on; otherwise it opens the Mail app, as before. The form also offers Mail.
  const build = expoBuild();
  const constants = (Platform as { constants?: { Model?: string } }).constants;
  const phone = supportDevice(Platform.OS, Platform.Version, constants?.Model, (Platform as { isPad?: boolean }).isPad);
  const formOn = useSupportForm(support);
  const mailUrl = supportMailUrl({ email: about.supportEmail, appName, versionNumber: build.version, device: `${Platform.OS} ${Platform.Version}` });
  const supportPage = support && formOn ? (
    <ContactSupportPage
      theme={rest.theme}
      strings={words.support}
      appName={appName}
      inbox={about.supportEmail}
      sender={{ name: profileIn?.name || undefined, email: profileIn?.email || undefined }}
      details={{ appName, version: build.version, ...(build.buildNumber ? { build: build.buildNumber } : {}), ...phone, plan: subscribed ? words.plan : words.support.free }}
      transport={support}
      mailUrl={mailUrl}
      pickScreenshot={pickScreenshot}
      onError={rest.onError as ((where: string, error: unknown) => void) | undefined}
      Text={(componentsIn?.Text ?? Text) as never}
      {...(componentsIn?.TextInput ? { TextInput: componentsIn.TextInput as never } : {})}
    />
  ) : undefined;
  const pages = assemblePages({
    dataExport: { row: kitRow({ id: dataExport.id, tint: tints.data }), content: null, menu, premium: true, locked: exportLocked, ...(dataExport.onLocked ? { onLocked: dataExport.onLocked } : { lockedOpens: plan.id ?? DEFAULT_IDS.plan }) },
    plan: planSection,
    planFree: !selling,
    extraPages: allPages,
    strings: words,
  });
  return <SettingsScreen {...(rest as unknown as AccountScreenProps)} profile={profile} plainHeaders={LOCKED_LOOK.plainHeaders} pickers={LOCKED_LOOK.pickers} exitMenu={exitMenu} about={supportPage ? { ...about, supportPage } : about} components={components} strings={accountStrings} app={{ content: preferencesPage }} photo={photo} password={password} extraPages={pages.extraPages} hubOrder={pages.hubOrder} />;
}

/** 6.0.0: only the page id and the tile color (the app's palette) come from the app; the name and icon are the kit's. 13.0.0: neither row takes a value or pill. */
const kitRow = (row: { id?: string; tint?: string }) => ({
  ...(row.id ? { id: row.id } : {}),
  ...(row.tint ? { tint: row.tint } : {}),
});

/** Row parts an app still passes that 6.0.0 no longer reads, for the development warning. */
function rowOverrides(plan: object, dataExport: object): string[] {
  const out: string[] = [];
  for (const [name, row] of [['plan', plan], ['dataExport', dataExport]] as const) {
    for (const k of ['label', 'icon', 'menu']) if (row && k in row) out.push(`${name}.${k}`);
  }
  // 11.0.0: Data Export's right side is the kit's (the Choose menu, or the gold padlock while locked).
  // 13.0.0: the Subscription row shows nothing on its right, so the plan's value and badge are not used either.
  for (const [name, row] of [['plan', plan], ['dataExport', dataExport]] as const) {
    for (const k of ['value', 'badge']) if (row && k in row && (row as Record<string, unknown>)[k] !== undefined) out.push(`${name}.${k}`);
  }
  return out;
}
