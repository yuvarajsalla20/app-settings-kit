# app-settings-kit

The standard **Settings screen** for React Native and Expo apps, in one config. Every app gets the same four parents (**About**, **Account**, **Preferences** and a **plan page**), a **Data Export** page with a lock per format, an About page that fills its own Kits and Version rows, and the round Back button with swipe-back. Built on [app-account-kit](https://github.com/yuvarajsalla20/app-account-kit), which draws the screen.

**Current version: 6.0.0** (tag `v6.0.0`). Needs app-account-kit **7.30.0** or later.

**Everything is required (5.0.0).** Every row of the approved Settings shows in every app: About with the logo under its title, Features, Rate, Share, Contact Support, Privacy Policy, Version and Kits; Profile with photo, Data Export, Log Out and Erase Account; Preferences; and the plan page. Only an app's own Preferences rows (Theme, Security) are its choice.

**The approved Settings look is locked (6.0.0).** Every app gets the same list order (About, Profile, Preferences, plan), plain page headers, pull-down pickers, the profile photo centered, Log Out and Erase Account on Profile, Data Export as a pull-down row on Profile, the kit's row names and icons, and the kit's round Back button. None of these can be changed by an app; anything an app still passes for them is ignored and named in development. The app gives only its values: its theme and palette, its plan's name, its own Preferences rows and pages, and what each export makes.

No colors, no payment code and no export code of its own: the app passes its theme, its plan page and what each export makes. It does not depend on the payments, subscriptions or export kits.

Part of the shared kits:
[app-core-kit](https://github.com/yuvarajsalla20/app-core-kit) ·
[app-auth-kit](https://github.com/yuvarajsalla20/app-auth-kit) ·
[app-account-kit](https://github.com/yuvarajsalla20/app-account-kit) ·
**app-settings-kit** ·
[app-subscriptions-kit](https://github.com/yuvarajsalla20/app-subscriptions-kit) ·
[app-payments-kit](https://github.com/yuvarajsalla20/app-payments-kit) ·
[app-export-kit](https://github.com/yuvarajsalla20/app-export-kit)

## Install

```jsonc
// package.json
"dependencies": {
  "app-account-kit": "git+https://github.com/yuvarajsalla20/app-account-kit.git#<full SHA of v7.12.0>",
  "app-settings-kit": "git+https://github.com/yuvarajsalla20/app-settings-kit.git#<full SHA of v2.4.0>"
},
"kitVersions": {
  "app-account-kit": "v7.12.0",
  "app-settings-kit": "v2.3.0"
}
```

Pin the full commit SHA of a release tag so every build gets exactly the code you tested, and write the tag in `kitVersions`. Find a SHA with `git ls-remote https://github.com/yuvarajsalla20/app-settings-kit refs/tags/v2.3.0`.

**Peer dependencies:** `app-account-kit` ≥ 7.12.0, `react` ≥ 18, `react-native` ≥ 0.74, `@expo/vector-icons` ≥ 14.

## Entry points

| Import | What it holds |
|---|---|
| `app-settings-kit` | `AppSettings`, `DataExportPage`, the Back button and swipe-back, the helpers, and `useSettingsNav` (re-exported from app-account-kit) |
| `app-settings-kit/logic` | Pure helpers only, no React Native, for tests in plain Node |
| `app-settings-kit/build-stamp` | `buildStamp()`, plain Node, for `app.config.js` |
| `app-settings-kit/package.json` | The kit's `version`, for About > Kits |

## The layout every app gets

- **Main list:** About, Account, Preferences, the plan page, then any parent page of the app's own.
- **Log Out and Erase Account (6.0.0: required, always on Profile):** Log Out is its own row and opens a small menu; Erase Account under it opens the delete steps (what you lose, type DELETE, password; the steps say the data is deleted forever, as Apple requires). `actions.onSignOut` and `actions.onDeleteAccount` are required. `exitMenu` takes only the optional `{ unlock, losses }`.
- **Features live inside a parent, never on the list.** Data Export is about the person's data, so it is a row called **Data Export** on Profile in every app, opening a pull-down menu headed "Make a file and share it".
- **About:** the app's picture and name, then **Features**, **Rate &lt;App&gt;**, **Share &lt;App&gt;**; **Contact Support**, **Privacy Policy**; **Kits**, **Version**. Kits and Version fill themselves from `kitSources` and `build`. A missing part hides its row, and the kit warns in development.
- **Wording:** approved Title Case words by default ("Rate MyApp", "Contact Support", "Privacy Policy", "Log Out", "Erase Account" (4.0.0), "We're Here to Help", "Write to Us"). 4.0.0: **enforced**. These words, the card headings and the page names are the same in every app; an app's own version through `strings` is not used (development shows a warning). `strings` is only for the app's own sentences, such as `deleteWarning`.
- **Back:** a round 44 pt Back button in `theme.accent` with a `theme.ink` arrow, and swipe from the left edge to go back, on every page.

Every part is required (5.0.0 and 6.0.0): a missing one is a type error, not a hidden row. Only Change password shows for email sign-in alone (Apple and Google have no password).

## Quick start

Words in CAPITALS are each app's own values. Everything else is the kit.

```tsx
import { AppSettings } from 'app-settings-kit';

<AppSettings
  theme={APP_THEME}                        // app-account-kit's AccountTheme (the kit has no colors)
  components={{ Text, TextInput, Card }}   // optional: the app's font and cards
  brand={<APP_BRAND_BAR />}                // optional
  onBack={GO_HOME}
  profile={{ name: NICKNAME, fallbackName: APP_NAME, email: EMAIL, photo: PHOTO }}
  nickname={{ max: MAX_NICKNAME, onSave: SAVE_NICKNAME }}
  photo={{ pick: PICK_PHOTO, onChange: SAVE_PHOTO, cameraSupported: true }}
  password={HAS_PASSWORD ? { onChange: CHANGE_PASSWORD } : undefined}
  about={{
    appName: APP_NAME,
    logo: MASTER_LOGO,                     // required: the app's one master logo, 1024 px
    featuresUrl: FEATURES_URL,             // required
    privacyUrl: PRIVACY_URL,
    supportEmail: SUPPORT_EMAIL,
    appStoreId: APP_STORE_ID,              // required: Rate and Share both come from it
  }}
  build={{ version: APP_VERSION, buildNumber: STORE_BUILD_NUMBER, stamp: BUILD_STAMP }}  // fills About > Version
  kitSources={{ dependencies: APP_PACKAGE_JSON.dependencies, kits: KITS_USED }}           // fills About > Kits
  actions={{ onSignOut: SIGN_OUT, onDeleteAccount: DELETE_ACCOUNT, confirmsWithPassword: NEEDS_PASSWORD }}
  onError={REPORT_ERROR}
  preferences={APP_OWN_ROWS}               // required: SettingsGroup + SettingRow from app-account-kit (Theme, Security go here when an app has them)
  dataExport={{
    formats: [
      { id: 'csv', label: 'CSV File', icon: 'file-text', tint: TINT, onExport: MAKE_CSV, locked: CSV_LOCKED },
      { id: 'pdf', label: 'PDF File', icon: 'file', tint: TINT, onExport: MAKE_PDF, locked: PDF_LOCKED, lockedBadge: LOCK_BADGE },
    ],
    onLocked: OPEN_PLANS,
  }}
  plan={{ id: 'premium', name: PLAN_NAME, tint: TINT, value: CURRENT_PLAN_WORD, badge: PLAN_PILL, content: PLAN_PAGE }}
  extraPages={APP_EXTRA_PAGES}             // optional
/>
```

`KITS_USED` is a list of `{ name, pkg, version }`, one per kit:

```ts
import account from 'app-account-kit/package.json';
import settings from 'app-settings-kit/package.json';

const KITS_USED = [
  { name: 'Account Kit', pkg: 'app-account-kit', version: account.version },
  { name: 'Settings Kit', pkg: 'app-settings-kit', version: settings.version },
];
// About > Kits shows "Account Kit | v7.12.0 | Build 874b317", the build read from the app's package.json pin.
```

`PLAN_PAGE` is usually app-subscriptions-kit's `PremiumPage`, and `MAKE_CSV` / `MAKE_PDF` usually call app-export-kit.

## `AppSettings` props

These app-account-kit `SettingsScreen` props pass through: `theme`, `strings` (the app's own sentences only), `components` (the kit's Back button and swipe always win), `brand`, `onBack`, `profile`, `nickname`, `password`, `describeError`, `actionTimeoutMs`, `onError`. On top of those, all required unless marked:

| Prop | Type | Notes |
|---|---|---|
| `about` | `AboutConfig` | `appName`, `logo`, `privacyUrl`, `featuresUrl`, `supportEmail`, `appStoreId`; optional `playPackage`, `shareMessage`. Version and Kits always come from `build` and `kitSources` |
| `actions` | `{ onSignOut, onDeleteAccount, confirmsWithPassword }` | 6.0.0: Log Out and Erase Account are required |
| `photo` | app-account-kit `PhotoProps` | Change photo on Profile |
| `exitMenu` | `{ unlock?, losses? }` | Optional extras for the delete steps. The layout is the kit's |
| `build` | `{ version, buildNumber?, stamp?, fallbackStamp?, buildWord? }` | Fills About > Version as "v1.2.0 \| Build 12" and the build time ("dev build" in a local run) |
| `kitSources` | `{ dependencies, kits: { name, pkg, version }[] }` | Fills About > Kits, each build read from its pin |
| `preferences` | `ReactNode` | The app's own settings rows |
| `dataExport` | `DataExportConfig` | The Data Export page (see below) |
| `plan` | `PlanConfig` | The plan page: `{ name, content, id?, tint?, value?, badge? }`. `name` (Premium, VIP) is the only word on Settings that is the app's |
| `extraPages` | `ExtraPage[]` | Optional: the app's own pages. `under: 'preferences'` or `'account'` puts one inside that parent; left out, it follows the four parents on the list |

6.0.0 removed `order`, `dataExportIn`, `plainHeaders`, `pickers`, `settingsStrings`, `data`, `about.version`, and the `label`, `icon` and `menu` of `plan` and `dataExport`. They are the kit's now.

Since 4.0.0 the kit's words always win: Profile, Preferences, Data Export, the headings (Account, Your Data, Sign In on the Profile page; the app's name, Help, Info), Log Out and Erase Account.

## Data Export

```ts
interface ExportFormat {
  id: string;                 // unique on the page: 'csv', 'pdf'
  label: string;
  detail?: string;            // a smaller second line
  icon: IconName;
  tint: string;
  locked?: boolean;           // each format has its own lock
  lockedDetail?: string;      // line under the label while locked (default: detail)
  lockedValue?: string;       // read out while locked, such as "Premium only, locked"
  lockedBadge?: ReactNode;    // drawn on the right while locked
  onExport: () => Promise<unknown>;
}
```

`dataExport` also takes `onLocked` (usually opens the plans), `onError`, `onProblem` (show the failure yourself) or `renderProblem` (drawn under the card), `Row` (your own row design, which gets `{ format, last, onPress }`), and the row fields `id`, `tint`, `value`, `badge`.

6.0.0: the row is always a pull-down menu on Profile, one line per format, headed "Make a file and share it". It makes one file at a time. A locked format shows a padlock (from `theme.lock`) and a tap calls `onLocked`; an open one shows a download icon. A failure goes to `onError` and shows "Could not create the file. Please try again."

`DataExportPage` can also be used on its own.

## The app's own pages in Preferences

Give an `extraPages` entry `under: 'preferences'` to make it a row on Preferences. Add `group: 'Widgets'` for a titled card of its own. Theme and Security, when an app has them, are rows in `preferences`.

```tsx
<AppSettings
  {...EVERYTHING_ELSE}
  preferences={APP_OWN_ROWS}
  extraPages={[
    { id: 'family', label: 'Connect as Family', icon: 'users', content: FAMILY_PAGE, under: 'preferences' },
    { id: 'widgets', label: 'Home Screen Widgets', icon: 'grid', content: WIDGETS_PAGE, under: 'preferences', group: 'Widgets' },
  ]}
/>
```

The list stays About, Profile, Preferences, plan.

## Theming

The kit uses app-account-kit's `AccountTheme` and adds no colors of its own (a test fails on a color literal in `src/`). Two theme values matter here:

- `theme.lock` (`{ icon, circle }`) colors the padlock on locked export formats.
- An optional `shadow` color on the theme object gives the round Back button its shadow.

Pass `components.BackButton` or `components.EdgeSwipe` to replace the built-in Back button or swipe-back.

**The same Back on your own screens:**

```tsx
// 'app-settings-kit/parts' (2.4.0+) loads only these parts; 'app-settings-kit' works too.
import { EdgeSwipeBack, makeBackButton } from 'app-settings-kit/parts';

export const BackButton = makeBackButton(APP_THEME);   // uses accent, ink, text and optional shadow

<EdgeSwipeBack onBack={goBack}>
  <BackButton onPress={goBack} label="Back" />
  {/* your screen */}
</EdgeSwipeBack>
```

## Build stamp

```js
// app.config.js (plain Node)
const { buildStamp } = require('app-settings-kit/build-stamp');

module.exports = ({ config }) => ({ ...config, extra: { ...config.extra, buildStamp: buildStamp() } });
// "Nov 15, 2026 | 9:00 AM CT". Another zone:
// buildStamp(new Date(), { timeZone: 'Asia/Kolkata', zoneNames: { 'GMT+5:30': 'IST' } })
```

Read it back in the app with `Constants.expoConfig?.extra?.buildStamp` (`expo-constants`), and the store build number with `Application.nativeBuildVersion` (`expo-application`), then pass both in `build`.

## Helpers

| Export | What it does |
|---|---|
| `kitList(dependencies, kits)` | The About > Kits list from the app's package.json pins |
| `pinnedBuild(spec)` | The short commit a dependency is pinned to |
| `versionLines(parts)` | `{ lines, label }` for About > Version |
| `hubOrder(order?, ids?)`, `DEFAULT_ORDER`, `DEFAULT_IDS` | The main list order with the app's page ids |
| `titleCaseStrings(appName)` | The approved Title Case words for app-account-kit |
| `missingAboutParts(about)` | Which About parts are missing (picture, Features, Rate, Share, Kits) |
| `createOneAtATime()` | The "one export at a time" guard |
| `SWIPE_BACK`, `isEdgeSwipe`, `finishesSwipe` | The swipe-back rules |
| `BACK_BUTTON` | The Back button's size, icon size and hit slop |
| `assemblePages` | Which pages, in which order (used by `AppSettings`) |

## Folder layout

```
build-stamp.js        build time stamp, plain Node for app.config.js (+ build-stamp.d.ts)
src/
  AppSettings.tsx     the screen: passes everything to app-account-kit, adds this kit's pages
  assemble.ts         which pages, in which order (pure)
  pages/DataExportPage.tsx
  parts/              BackButton, EdgeSwipeBack
  strings.ts types.ts kit.ts
  logic/              pure functions (app-settings-kit/logic): about, kits, version, order, oneAtATime, swipe
tests/                logic, build stamp, no colors, and the real screens rendered with a small React Native stand-in
```

## Rules it follows

- No colors in `src/`. Every color comes from the app's theme.
- No dependency on the payments, subscriptions or export kits. They connect through `locked`, `onExport`, `onLocked` and the plan page `content`.
- The words, the layout and every section are the kit's, the same in every app (4.0.0 to 6.0.0). Only Theme and Security rows are an app's choice.
- Define `theme`, `strings` and `components` once, outside your component.

## Development

```bash
npm install
npm run typecheck
npm test
```

The dev dependency on app-account-kit is pinned to a commit; move it when the peer range moves. To release: bump `version` in `package.json` and `KIT_VERSION` in `src/kit.ts`, add an entry to [CHANGELOG.md](CHANGELOG.md), merge, then tag the merged commit.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
