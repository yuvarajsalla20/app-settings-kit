# app-settings-kit

The standard Settings screen for React Native / Expo apps, in one config.
Built on [app-account-kit](https://github.com/yuvarajsalla20/app-account-kit) (7.7 or later), which draws the screen itself. This kit adds what every app used to write by hand around it:

- the standard list: **About, Account, Preferences, Data Export, then the plan page** (VIP, Premium), then any page of the app's own;
- a **Data Export** page with **a lock per format** (one app keeps CSV free and locks PDF, another locks both);
- the **Kits** list in About, with each kit's version and the commit the app pins ("Account Kit | v7.7.0 | Build 8613ded");
- the **Version** line ("v4.18.0 | Build 12" and the build time) and the **build stamp** script for `app.config.js`.

No colors, no payment code and no export code of its own: the app passes its theme, its plan page and what each export makes. It does not depend on the payments, subscriptions or export kits.

Version 1.0.0 matches HringNring's Settings exactly (rows, order, words, version line, kits list).

## Build a new app: copy this and fill in the capitals

Words in CAPITALS are each app's own values. Everything else is the kit.

```tsx
import { AppSettings, kitList, versionLines } from 'app-settings-kit';

<AppSettings
  theme={APP_THEME}                        // the app's colors (app-account-kit's AccountTheme; the kit has none)
  components={{ Text, TextInput, Card, BackButton, EdgeSwipe }}   // optional: the app's font, cards, Back button and edge swipe
  brand={<APP_BRAND_BAR />}
  onBack={GO_HOME}
  profile={{ name: NICKNAME, fallbackName: APP_NAME, email: EMAIL, photo: PHOTO }}
  nickname={{ max: MAX_NICKNAME, onSave: SAVE_NICKNAME }}
  photo={{ pick: PICK_PHOTO, onChange: SAVE_PHOTO, cameraSupported }}
  password={HAS_PASSWORD ? { onChange: CHANGE_PASSWORD } : undefined}
  about={{
    appName: APP_NAME,
    logo: APP_ICON,
    version: { number: APP_VERSION, ...versionLines({ version: APP_VERSION, buildNumber: STORE_BUILD_NUMBER, stamp: BUILD_STAMP }) },
    privacyUrl: PRIVACY_URL,
    featuresUrl: FEATURES_URL,             // optional
    supportEmail: SUPPORT_EMAIL,
    share: { url: APP_STORE_URL },
    rate: { appStoreId: APP_STORE_ID },
    kits: kitList(APP_PACKAGE_JSON.dependencies, KITS_USED),
  }}
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
  // order={['about', 'account', 'app', 'export', 'plan']}   (the default; "app" is Preferences)
/>
```

How two apps fill it in:

| Placeholder | Moonpenny | HringNring |
|---|---|---|
| APP_NAME, APP_THEME | Moonpenny, moon gold on night | HringNring, purple glass |
| components | text and Back | text, Back button, edge swipe, glass cards |
| APP_OWN_ROWS | Currency, Categories | reminder settings |
| CSV_LOCKED | `false` (free) | `!premium` |
| PDF_LOCKED | `!canUse('pdfReport')` | `!premium` |
| PLAN_NAME, PLAN_PILL | VIP, Lite/VIP pill | Premium, Free/Monthly/Yearly pill |
| PLAN_PAGE | subscriptions kit `PremiumPage` | its Premium settings |
| APP_EXTRA_PAGES | Connect as Family | none |
| KITS_USED | Core, Auth, Account, Settings, Subscriptions, Payments, Export, Invite | Core, Auth, Account, Subscriptions, Payments |

Leave a prop out and its row is hidden (no `plan`: no plan page; no `dataExport`: no Data Export).

## What you get

| Part | What it does | App passes |
|---|---|---|
| `AppSettings` | app-account-kit's `SettingsScreen` with Preferences, Data Export and the plan page in the standard order. Every app-account-kit prop passes straight through. | everything above |
| `DataExportPage` | One row per format. Locked: the lock's words and badge, and a tap calls `onLocked`. Open: a tap makes the file. One file at a time; a failure goes to `onError` and shows "Could not create the file. Please try again." | `formats`, `onLocked`, and `onProblem` (show it yourself) or `renderProblem` (drawn under the card) |
| `kitList(deps, kits)` | The About > Kits list from the app's package.json pins | the app's `dependencies`, and each kit's name, npm name and version |
| `versionLines(...)` | `{ lines, label }` for About > Version | version, store build number, build stamp |
| `build-stamp.js` | "Nov 14, 2026 \| 10:45 AM CT" at build time | optional `{ timeZone, zoneNames }` |
| `hubOrder`, `DEFAULT_ORDER` | The list order with the app's page ids | optional `order` |

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

Pin a full commit SHA and note the tag in `kitVersions`. Peer dependencies: `app-account-kit` (7.7.0 or later), `react`, `react-native`.

## Versions

- 1.0.0 (2026-11-14): first release. Same Settings as HringNring: About, Account, Preferences, Data Export (lock per format), plan page; kits list; version line; build stamp.
- Later releases stay backward compatible: a new option defaults to the old behavior.
