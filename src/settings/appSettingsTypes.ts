import type { SettingsScreen, AboutProps, ActionsProps, Choice, ExitMenuProps, PlanMode } from 'app-account-kit';
import type { ComponentProps, ReactNode } from 'react';
import type { AppPackage, KitSource } from '../about/kits';
import type { SupportTransport } from '../support/support';
import type { VersionParts } from '../about/version';
import type { DataExportConfig, ExtraPage, PlanConfig } from '../types';

/** The props and fixed values of AppSettings, apart from the screen itself. */
export type AccountScreenProps = ComponentProps<typeof SettingsScreen>;

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
  /**
   * 18.1.0: for an app without app-subscriptions-kit, where the plan mode comes from. Pass `firestorePlanMode(db, auth)` from
   * `app-settings-kit/plan-mode-firestore`, so the owner's `planMode` (and `subscriptionTesters`) in Firestore `config/app`
   * chooses Plan · Free or the Subscription row. Leave out in an app with app-subscriptions-kit, whose `SubscriptionProvider`
   * sets it; without either, the app is free.
   */
  planMode?: () => Promise<PlanMode>;
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
export const LOCKED_PROPS = ['order', 'dataExportIn', 'plainHeaders', 'pickers', 'settingsStrings'] as const;
