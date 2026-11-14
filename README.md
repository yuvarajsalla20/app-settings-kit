# app-settings-kit

The standard Settings screen for React Native / Expo apps, in one config.
Built on [app-account-kit](https://github.com/yuvarajsalla20/app-account-kit) (7.8 or later), which draws the screen itself. This kit adds what every app used to write by hand around it:

- the standard list, **four parents in every app: About** (the app), **Account** (you and your data), **Preferences** (how the app works) **and the plan page** (VIP, Premium: activate it), then any page of the app's own;
- **features live inside a parent, never on the list.** Place a feature by what it is, not by what it costs; the plan pill shows the price wherever the row lives. Data Export is about your data, so it is a row called **Data Export** on **Account** (no heading above it), in every app, whether it is free or paid;
- a **Data Export** page with **a lock per format** (one app keeps CSV free and locks PDF, another locks both);
- the **Kits** list in About, with each kit's version and the commit the app pins ("Account Kit | v7.7.0 | Build 8613ded");
- the **Version** line ("v4.18.0 | Build 12" and the build time) and the **build stamp** script for `app.config.js`.

No colors, no payment code and no export code of its own: the app passes its theme, its plan page and what each export makes. It does not depend on the payments, subscriptions or export kits.



## Build a new app: copy this and fill in the capitals

Words in CAPITALS are each app's own values. Everything else is the kit.

```tsx
import { AppSettings } from 'app-settings-kit';

<AppSettings
  theme={APP_THEME}                        // the app's colors (app-account-kit's AccountTheme; the kit has none)
  components={{ Text, TextInput, Card }}   // optional: the app's font and cards (the round Back button and edge swipe are built in)
  brand={<APP_BRAND_BAR />}
  onBack={GO_HOME}
  profile={{ name: NICKNAME, fallbackName: APP_NAME, email: EMAIL, photo: PHOTO }}
  nickname={{ max: MAX_NICKNAME, onSave: SAVE_NICKNAME }}
  photo={{ pick: PICK_PHOTO, onChange: SAVE_PHOTO, cameraSupported }}
  password={HAS_PASSWORD ? { onChange: CHANGE_PASSWORD } : undefined}
  about={{
    appName: APP_NAME,
    logo: APP_ICON,
    privacyUrl: PRIVACY_URL,
    featuresUrl: FEATURES_URL,             // optional
    supportEmail: SUPPORT_EMAIL,
    share: { url: APP_STORE_URL },
    rate: { appStoreId: APP_STORE_ID },
  }}
  build={{ version: APP_VERSION, buildNumber: STORE_BUILD_NUMBER, stamp: BUILD_STAMP }}   // fills About > Version
  kitSources={{ dependencies: APP_PACKAGE_JSON.dependencies, kits: KITS_USED }}            // fills About > Kits
  actions={{ onSignOut: SIGN_OUT, onDeleteAccount: DELETE_ACCOUNT, confirmsWithPassword: NEEDS_PASSWORD }}
  onError={REPORT_ERROR}
  preferences={APP_OWN_ROWS}               // the Preferences page: SettingsGroup + SettingRow from app-account-kit
  dataExport={{
    formats: [
      { id: 'csv', label: 'CSV File', icon: 'file-text', tint: TINT, onExport: MAKE_CSV, locked: CSV_LOCKED },
      { id: 'pdf', label: 'PDF File', icon: 'file', tint: TINT, onExport: MAKE_PDF, locked: PDF_LOCKED, lockedBadge: LOCK_BADGE },
    ],
    onLocked: OPEN_PLANS,
  }}
  plan={{ id: 'premium', label: PLAN_NAME, icon: 'award', tint: TINT, value: CURRENT_PLAN_WORD, badge: PLAN_PILL, content: PLAN_PAGE }}
  extraPages={APP_EXTRA_PAGES}             // optional, such as Connect as Family
  // order={['about', 'account', 'app', 'plan']}   (the default; "app" is Preferences; Data Export is always inside Account)
/>
```

How two apps fill it in:

| Placeholder | Moonpenny | HringNring |
|---|---|---|
| APP_NAME, APP_THEME | Moonpenny, moon gold on night | HringNring, teal glass |
| components | text | text, glass cards |
| APP_OWN_ROWS | Currency, Categories | reminder settings |
| CSV_LOCKED | `false` (free) | `!premium` |
| PDF_LOCKED | `!canUse('pdfReport')` | `!premium` |
| PLAN_NAME, PLAN_PILL | VIP, Lite/VIP pill | Premium, Free/Monthly/Yearly pill |
| PLAN_PAGE | subscriptions kit `PremiumPage` | its Premium settings |
| APP_EXTRA_PAGES | Connect as Family | none |
| KITS_USED | Core, Auth, Account, Settings, Subscriptions, Payments, Export, Invite | Core, Auth, Account, Settings, Subscriptions, Payments, Export |

Leave a prop out and its row is hidden (no `plan`: no plan page; no `dataExport`: no Data Export).

## The approved About page

About, the same in every app: the app's picture and name, then **Features**, **Rate &lt;App&gt;**, **Share &lt;App&gt;**; **Contact Support**, **Privacy Policy**; **Kits**, **Version**. Pass `logo`, `featuresUrl`, `rate` and `share` in `about`, and the kit fills the last two rows itself: `build={{ version, buildNumber, stamp }}` makes Version, and `kitSources={{ dependencies: pkg.dependencies, kits: [...] }}` makes Kits (an `about.version` or `about.kits` the app passes still wins). A missing part hides its row, and the kit warns in development.

Every page also gets the approved round **Back button** (a 44 pt circle in `theme.accent` with a `theme.ink` arrow and a soft shadow, `theme.shadow` if the theme has one) and **swipe from the left edge to go back**, unless the app passes its own `components.BackButton` or `components.EdgeSwipe`. Use the same parts on the app's own inner screens so every Back looks alike: `const BackButton = makeBackButton(APP_THEME)` and `<EdgeSwipeBack onBack={...}>`. The colors, cards and background still come from the app's `theme`, `components` and screen.

## What you get

| Part | What it does | App passes |
|---|---|---|
| `AppSettings` | app-account-kit's `SettingsScreen` with the four parents in the standard order, and Data Export as a row on Account. Every app-account-kit prop passes straight through. | everything above |
| `DataExportPage` | One row per format. Locked: the lock's words and badge, and a tap calls `onLocked`. Open: a tap makes the file. One file at a time; a failure goes to `onError` and shows "Could not create the file. Please try again." | `formats`, `onLocked`, and `onProblem` (show it yourself) or `renderProblem` (drawn under the card) |
| `kitList(deps, kits)` | The About > Kits list from the app's package.json pins | the app's `dependencies`, and each kit's name, npm name and version |
| `versionLines(...)` | `{ lines, label }` for About > Version | version, store build number, build stamp |
| `build-stamp.js` | "Nov 14, 2026 \| 10:45 AM CT" at build time | optional `{ timeZone, zoneNames }` |
| `hubOrder`, `DEFAULT_ORDER` | The list order with the app's page ids | optional `order` |
| `makeBackButton(theme)`, `EdgeSwipeBack` | The approved round Back button and swipe-back (the defaults in Settings), for the app's own screens; `SWIPE_BACK`, `isEdgeSwipe`, `finishesSwipe` in `/logic` | the theme; `onBack` |
| `useSettingsNav()` | From the app's own page (the plan page), `open(id)` opens another Settings page, such as Data Export from a perk row; Back returns to the page that opened it | the page id (`DEFAULT_IDS.export` unless the app named it) |

### Export formats

```ts
interface ExportFormat {
  id: string; label: string; detail?: string; icon: IconName; tint: string;
  locked?: boolean;          // each format has its own lock
  lockedDetail?: string;     // line under the label while locked (default: detail)
  lockedValue?: string;      // read out while locked, such as "VIP only, locked"
  lockedBadge?: ReactNode;   // drawn on the right while locked
  onExport: () => Promise<unknown>;
}
```

An app with its own row design passes `dataExport.Row` (gets `{ format, last, onPress }`).

### Build stamp

```js
// app.config.js (plain Node)
const { buildStamp } = require('app-settings-kit/build-stamp');
module.exports = ({ config }) => ({ ...config, extra: { ...config.extra, buildStamp: buildStamp() } });
// another zone: buildStamp(new Date(), { timeZone: 'Asia/Kolkata', zoneNames: { 'GMT+5:30': 'IST' } })
```

The app reads it back with `expo-constants` (`Constants.expoConfig?.extra?.buildStamp`) and the store build number with `expo-application` (`Application.nativeBuildVersion`), and passes both to `versionLines`.

### Words

`settingsStrings` rewords this kit: `preferences` ("Preferences"), `dataExport` ("Data Export"), `plan` ("Plan"), `exportFailed`. app-account-kit's own words go through `strings` as before; if `strings.app` is set it wins over `preferences`.

## Folder layout

```
build-stamp.js        build time stamp, plain Node for app.config.js (+ build-stamp.d.ts)
src/
  AppSettings.tsx     the screen: passes everything to app-account-kit, adds this kit's pages
  assemble.ts         which pages, in which order (pure)
  pages/DataExportPage.tsx
  strings.ts  types.ts  kit.ts
  logic/              pure functions, no React Native (app-settings-kit/logic)
    kits.ts  version.ts  order.ts  oneAtATime.ts
tests/                logic, build stamp, no colors, and the real screens rendered with a small react-native stand-in
```

## Rules it follows

- No colors in `src/` (a test fails on a color literal). Every color comes from the app's theme.
- No dependency on the payments, subscriptions or export kits: they connect through `locked`, `onExport`, `onLocked` and the plan page `content`.
- Every word can be changed. Every page is optional.
- Define `theme`, `strings`, `settingsStrings` and `components` once, outside your component.

## Install

```json
"app-settings-kit": "git+https://github.com/yuvarajsalla20/app-settings-kit.git#<full commit SHA>"
```

Pin a full commit SHA and note the tag in `kitVersions`. Peer dependencies: `app-account-kit` (7.8.0 or later), `react`, `react-native`.

## Versions

- 2.1.0 (2026-11-14): **the approved About page by default.** Every app gets HringNring's approved words in Title Case ("Rate MyApp", "Share MyApp", "Contact Support", "Privacy Policy", "Sign Out", "Delete Account"...) without passing them; `strings` still rewords any of them. In development a warning names any About part the app leaves out (picture, Features, Rate, Share, Kits), since each one hides a row. Data Export is now a plain row on Account called **Data Export**, with no "Your Data" heading (needs app-account-kit 7.9.0; `settingsStrings.yourData` is no longer shown but still accepted). Version and Kits fill themselves from new `build` and `kitSources` props. Each Data Export format row has the approved look: a gold padlock while locked, a download icon once open (needs the app's `theme.lock`). The round Back button and swipe-back are the defaults (new `makeBackButton`, `EdgeSwipeBack`, `BACK_BUTTON`, `SWIPE_BACK`). New `titleCaseStrings(appName)` and `missingAboutParts(about)`. Needs `@expo/vector-icons` (every Expo app has it). Upgrading changes what other apps show: the round Back button, swipe-back and Title Case words arrive by default (pass `components.BackButton` / `components.EdgeSwipe` or `strings` to keep your own). The Back button is made again only when one of its colors changes, and a second quick swipe while the page slides away is ignored.
- 2.0.0 (2026-11-14): **four parents.** The list is About, Account, Preferences, plan. Data Export moves off the list onto Account, under Your Data (new string `yourData`); "export" in `order` is ignored. New `useSettingsNav()` for shortcuts (the plan page's Data Export perk). Needs app-account-kit 7.8.0. Upgrading from 1.x: drop "export" from `order` if you set one; nothing else to change.
- 1.0.0 (2026-11-14): first release. Same Settings as HringNring: About, Account, Preferences, Data Export (lock per format), plan page; kits list; version line; build stamp.
- Later releases stay backward compatible: a new option defaults to the old behavior.
