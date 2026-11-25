import { PickerRow, SettingsGroup, SettingsScreen, themeContrast, usePlanMode, MIN_PASSWORD, type AccountStrings, type ExitMenuProps } from 'app-account-kit';
import { cameraSupported as defaultCameraSupported, pickProfilePhoto } from 'app-account-kit/photo';
import { Platform } from 'react-native';
import { useMemo } from 'react';
import { assemblePages } from './assemble';
import { kitRow, useAbout, useExportMenu, usePlanModeSource, usePlanSection, useSupportPage } from './appSettingsParts';
import { APPEARANCE_CHOICES, DEFAULT_EXIT_MENU, LOCKED_LOOK, LOCKED_PROPS, type AccountScreenProps, type AppearanceChoice, type AppSettingsProps } from './appSettingsTypes';
import { useDevWarning } from '../shared/devWarning';
import { DEFAULT_IDS } from './order';
import { aboutProblems, cardHeadings, logoPixels, titleCaseStrings } from '../about/about';
import { makeBackButton } from '../headers/BackButton';
import { EdgeSwipeBack } from '../headers/EdgeSwipeBack';
import { DEFAULT_SETTINGS_STRINGS, type SettingsStrings } from '../strings';
import type { ExtraPage } from '../types';

export { APPEARANCE_CHOICES, DEFAULT_EXIT_MENU, LOCKED_LOOK, appStorePage, playStorePage } from './appSettingsTypes';
export type { AboutConfig, AppearanceChoice, AppSettingsProps } from './appSettingsTypes';

/**
 * The standard Settings screen in one config: four parents, About, Account, Preferences and the plan page. Sign out and Delete account sit behind a ⋯ on Account (`exitMenu={false}` puts them back on the list).
 * Data Export (a lock per format) is a feature, so it is a row inside Account, called Data Export, or inside Preferences with `dataExportIn: 'preferences'`.
 * Everything app-account-kit takes (theme, strings, components, profile, about, actions...) passes straight through.
 */
export function AppSettings(props: AppSettingsProps) {
  const { support, planMode: planModeSource, preferences, dataExport, plan, extraPages, strings, about: aboutIn, build: ownBuild, appPackage, kitSources, appearance, security, photo: photoIn, password: passwordIn, components: componentsIn, exitMenu: exitExtras, profile: profileIn, ...restIn } = props;
  // 6.0.0: the order, the place of Data Export, the headers, the pickers and the centered photo are the kit's. Anything an app
  // still passes for them is dropped here and named in development.
  const rest = { ...restIn } as typeof restIn & Record<string, unknown>;
  const lockedProps = LOCKED_PROPS.filter((k) => k in rest);
  for (const k of lockedProps) delete rest[k];
  const exitMenu = useMemo<ExitMenuProps>(() => ({ ...DEFAULT_EXIT_MENU, ...(exitExtras?.unlock ? { unlock: exitExtras.unlock } : {}), ...(exitExtras?.losses ? { losses: exitExtras.losses } : {}) }), [exitExtras?.unlock, exitExtras?.losses]);
  const profile = useMemo(() => ({ ...profileIn, centered: LOCKED_LOOK.centeredPhoto }), [profileIn]);
  const about = useAbout(aboutIn, appPackage, kitSources);
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
  usePlanModeSource(planModeSource);
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
  useDevWarning(ignored && `${ignored} are the kit's words and the same in every app, so the app's version is not used. Change them in the kit.`);
  // 5.0.0: the types require every part; this also catches a value that would still hide a row (a malformed App Store number,
  // a Features page that is not https, a logo too small to stay sharp), and says so in development.
  useDevWarning(aboutProblems(aboutIn, logoPixels(aboutIn.logo)).join(' '));
  // 8.0.0: text the app's theme makes hard to read (in its Light or Dark look, whichever is showing), said in development.
  const contrast = useMemo(() => themeContrast(rest.theme, rest.theme.surface).map((p) => `${p.pair} is ${p.ratio ?? 'unreadable'}:1 (needs ${p.min}:1)`).join('; '), [rest.theme]);
  useDevWarning(contrast && `hard to read in this look: ${contrast}.`);
  // 6.0.0: Data Export is always the pull-down menu on its row, with the kit's line at the top. A tap on the lock opens the plan
  // page unless the app passes its own `onLocked` (e.g., its plans screen).
  const exportOpen = selling && !!plan.subscribed;
  const menu = useExportMenu(dataExport, rest.onError as ((where: string, error: unknown) => void) | undefined, words, exportOpen);
  // 8.0.0: the kit's rows take their tile color from the theme, the same key in every app (the plan: Rate's gold; Data Export: data).
  // 13.0.0: the row is "Subscription" with nothing on its right in every app; the plan the account holds is shown on the page.
  const tints = rest.theme.tints;
  const planSection = usePlanSection({ plan, dataExport, selling, theme: rest.theme, components: componentsIn, words, appName, tint: tints.rate });
  // 8.0.0: Security, when the app has one, is the kit's row in Preferences.
  const allPages: readonly ExtraPage[] = security
    ? [...(extraPages ?? []), { id: 'security', label: words.security, icon: 'lock', tint: tints.password, under: 'preferences', content: security.content, ...(security.value !== undefined ? { value: security.value } : {}) }]
    : (extraPages ?? []);
  // 8.0.0: Appearance is the kit's row in a Display card at the end of Preferences. 12.0.0: every app has it, free.
  useDevWarning(!appearance && 'appearance is required. Every app offers System, Light and Dark: pass appearance={{ value, onChange }}.');
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
  const supportPage = useSupportPage({ support, about, appName, profile: profileIn, subscribed, theme: rest.theme, components: componentsIn, words, onError: rest.onError as ((where: string, error: unknown) => void) | undefined });
  // 11.0.0: Data Export is a Premium feature in every app: while the account does not pay for Premium (12.0.0) the row shows
  // only the gold padlock, and a tap opens the plan page (or the app's `onLocked`); once it does, the Choose menu.
  const pages = assemblePages({
    dataExport: { row: kitRow({ id: dataExport.id, tint: tints.data }), content: null, menu, premium: true, locked: !exportOpen, ...(dataExport.onLocked ? { onLocked: dataExport.onLocked } : { lockedOpens: plan.id ?? DEFAULT_IDS.plan }) },
    plan: planSection,
    extraPages: allPages,
    strings: words,
  });
  return <SettingsScreen {...(rest as unknown as AccountScreenProps)} profile={profile} plainHeaders={LOCKED_LOOK.plainHeaders} pickers={LOCKED_LOOK.pickers} exitMenu={exitMenu} about={supportPage ? { ...about, supportPage } : about} components={components} strings={accountStrings} app={{ content: preferencesPage }} photo={photo} password={password} extraPages={pages.extraPages} hubOrder={pages.hubOrder} />;
}

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
