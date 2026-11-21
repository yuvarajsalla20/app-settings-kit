# app-settings-kit

The standard **Settings screen** for React Native and Expo apps, in one config. Every app gets the same four parents (**About**, **Account**, **Preferences** and a **plan page**), a **Data Export** page with a lock per format, an About page that fills its own Kits and Version rows, and the round Back button with swipe-back. Built on [app-account-kit](https://github.com/yuvarajsalla20/app-account-kit), which draws the screen.

**Current version: 10.0.0** (tag `v10.0.0`). Needs app-account-kit **7.31.0** or later.

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
[app-export-kit](https://github.com/yuvarajsalla20/app-export-kit) ·
[app-guard-kit](https://github.com/yuvarajsalla20/app-guard-kit) ·
[app-theme-kit](https://github.com/yuvarajsalla20/app-theme-kit) ·
[app-invite-kit](https://github.com/yuvarajsalla20/app-invite-kit) ·
[app-goldrates-api-kit](https://github.com/yuvarajsalla20/app-goldrates-api-kit)

Tools that work alongside them: [code-review-kit](https://github.com/yuvarajsalla20/code-review-kit) (reviews) and app-insights-kit (store numbers, private).

## Install

```jsonc
// package.json
"dependencies": {
  "app-account-kit": "git+https://github.com/yuvarajsalla20/app-account-kit.git#<full SHA of v7.31.0>",
  "app-settings-kit": "git+https://github.com/yuvarajsalla20/app-settings-kit.git#<full SHA of v10.0.0>"
},
"kitVersions": {
  "app-account-kit": "v7.31.0",
  "app-settings-kit": "v10.0.0"
}
```

Pin the full commit SHA of a release tag so every build gets exactly the code you tested, and write the tag in `kitVersions`. Find a SHA with `git ls-remote https://github.com/yuvarajsalla20/app-settings-kit refs/tags/v9.1.0`.

**Peer dependencies:** `app-account-kit` ≥ 7.30.0, `react` ≥ 18, `react-native` ≥ 0.74, `@expo/vector-icons` ≥ 14, and (8.0.0) `expo-application`, `expo-constants`, `expo-image-picker`, `expo-image-manipulator`.

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
- **About:** the app's picture and name, then **Features**, **Rate &lt;App&gt;**, **Share &lt;App&gt;**; **Contact Support**, **Privacy Policy**; **Kits**, **Version**. Kits and Version fill themselves (8.0.0: from `appPackage` and the app itself). A missing part hides its row, and the kit warns in development.
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
  photo={{ onChange: SAVE_PHOTO }}          // 8.0.0: the picker is app-account-kit's
  password={HAS_PASSWORD ? { onChange: CHANGE_PASSWORD } : undefined}
  about={{
    appName: APP_NAME,
    logo: MASTER_LOGO,                     // required: the app's one master logo, 1024 px
    featuresUrl: FEATURES_URL,             // required
    privacyUrl: PRIVACY_URL,
    supportEmail: SUPPORT_EMAIL,
    appStoreId: APP_STORE_ID,              // required: Rate and Share both come from it
  }}
  appPackage={APP_PACKAGE_JSON}            // 8.0.0: About > Kits from its app-...-kit dependencies; Version reads itself
  appearance={{ value: THEME_CHOICE, onChange: SET_THEME_CHOICE }}   // optional: the kit's Appearance row
  security={{ content: <SecurityPage /> }}  // optional: the kit's Security row (app-guard-kit)
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
  plan={{ id: 'premium', value: CURRENT_PLAN_WORD, subscribed: PAYS_NOW, badge: PLAN_PILL, content: PLAN_PAGE }}   // called Premium in every app
  extraPages={APP_EXTRA_PAGES}             // optional
/>
```

`APP_PACKAGE_JSON` is the app's own package.json (`import pkg from '../../package.json'`). 8.0.0: About > Kits lists every `app-...-kit` dependency by itself, in the same order in every app, like "Account Kit | v7.30.0 | Build da25d6e" (the version from `kitVersions`, the build from the pin). About > Version reads app.json's version, the phone's build number and the build time from app.config.js.

`PLAN_PAGE` is usually app-subscriptions-kit's `PremiumPage`, and `MAKE_CSV` / `MAKE_PDF` usually call app-export-kit.

## `AppSettings` props

These app-account-kit `SettingsScreen` props pass through: `theme`, `strings` (the app's own sentences only), `components` (the kit's Back button and swipe always win), `brand`, `onBack`, `profile`, `nickname`, `password`, `describeError`, `actionTimeoutMs`, `onError`. On top of those, all required unless marked:

| Prop | Type | Notes |
|---|---|---|
| `about` | `AboutConfig` | `appName`, `logo`, `privacyUrl`, `featuresUrl`, `supportEmail`, `appStoreId`; optional `playPackage`, `shareMessage`. Version and Kits fill themselves. 9.1.0: Share and Rate use Google Play on Android, read from app.json (`expo.android.package`); `playPackage` is only a fallback |
| `actions` | `{ onSignOut, onDeleteAccount, confirmsWithPassword }` | 6.0.0: Log Out and Erase Account are required |
| `photo` | app-account-kit `PhotoProps` | Change photo on Profile |
| `exitMenu` | `{ unlock?, losses? }` | Optional extras for the delete steps. The layout is the kit's |
| `appPackage` | `{ dependencies, kitVersions? }` | 8.0.0: the app's package.json. Fills About > Kits by itself. (`kitSources` still works for 7.x apps; `build` is ignored: Version reads the app itself) |
| `appearance` | `{ value, onChange }` | 8.0.0, optional: the kit's Appearance row (System, Light, Dark) in a Display card at the end of Preferences |
| `security` | `{ content, value? }` | 8.0.0, optional: the kit's Security row in Preferences, opening the app's lock page (app-guard-kit's `SecurityPage`) |
| `preferences` | `ReactNode` | The app's own settings rows |
| `dataExport` | `DataExportConfig` | The Data Export page (see below) |
| `plan` | `PlanConfig` | The plan page: `{ features, freeFeatures, content?, subscribed?, id?, value?, badge? }`. 7.0.0: it is called **Premium** in every app (the kit's word). 10.0.0: `features` and `freeFeatures` are required; every plan page ends with the kit's Free and Premium comparison. Leave out `content` while nothing is on sale and the kit draws its Coming Soon page (see below) |
| `extraPages` | `ExtraPage[]` | Optional: the app's own pages. `under: 'preferences'` or `'account'` puts one inside that parent; left out, it follows the four parents on the list |

6.0.0 removed `order`, `dataExportIn`, `plainHeaders`, `pickers`, `settingsStrings`, `data`, `about.version`, and the `label`, `icon` and `menu` of `plan` and `dataExport`. They are the kit's now.

Since 4.0.0 the kit's words always win: Profile, Preferences, Data Export, Premium (7.0.0), the headings (Account, Your Data, Sign In on the Profile page; the app's name, Help, Info), Log Out and Erase Account.

## The plan page and the Free and Premium comparison (10.0.0)

Every app shows its plan page, and every plan page ends with the same comparison table, so a person can always tell which features are Premium and which are free:

```tsx
plan={{
  features: [{ label: 'Repeat Alerts', detail: 'Up to 5 Times', icon: 'repeat' }, 'Workspaces'],
  freeFeatures: [{ label: 'Sync Across Devices', icon: 'refresh-cw' }],
  content: <PremiumPage features={...} onOpenPlans={...} />, // leave out while nothing is on sale
  subscribed,
}}
```

- **The comparison:** under the heading **Compare Free and Premium**, one table with a **Free** column and a **Premium** column under the award mark, tinted in the plan's color (the theme's `tints.rate`). What the plan adds comes first, with tiles in the plan's color and a dash under Free; what every account has follows, with quiet tiles (`tints.version`) and a tick in both columns. With `subscribed`, the Premium column reads **Your Plan**. Each entry is a line, or `{ label, detail?, icon? }` (a Feather icon name). The table, its words and its colors are the kit's; the app gives only the two lists.
- **Nothing on sale yet:** leave out `content`. The row on the list reads **Coming Soon**, and the page opens with **Premium**, **Coming Soon** and "Every current &lt;App&gt; feature is free. Premium will be available soon.", then the comparison. Nothing to buy.
- **On sale:** pass `content` (app-subscriptions-kit's `PremiumPage`). The page shows it, then the comparison. Since app-subscriptions-kit 3.0.0, `PremiumPage` no longer repeats the feature list; subscribers see only the features that have their own controls, under **Premium Settings**.

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

**The same header on your own screens (8.0.0):**

```tsx
import { makePageHeader } from 'app-settings-kit/parts';

export const PageHeader = makePageHeader(APP_THEME, { Text });   // round Back, then the title, like every Settings page
<PageHeader title="Categories" onBack={goBack} titleRight="Nov 2026" />
```

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

8.0.0: the kit reads it back by itself (`expoBuild()`: `Constants.expoConfig.extra.buildStamp`, and the store build number from `expo-application`, none in Expo Go). The app passes nothing.

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

## Writing rule: every word is professional

This rule is the standard for every shared kit (core, auth, account, settings, subscriptions, payments, export, guard, theme, invite and goldrates-api), for code-review-kit and app-insights-kit, and for every app built on them. It applies to every word a person reads: each caption, tagline, sub-line, placeholder, note, message and button, and equally to the READMEs, changelogs, code comments, commit messages and pull requests.

- **Titles, row labels and buttons** use Title Case: "Confirm Your PIN", "Not Now", "Sign In Again", "Data Export". Small words (a, an, the, and, or, to, of, in, on, for, by) stay lower case unless they come first.
- **Captions, notes and messages** are calm, complete sentences with a full stop: "Unable to save your PIN. Please try again." Never chatty fragments ("Add your own, rename, recolor or hide"), never slang, never exclamation marks.
- **Errors** state what happened and what to do next: "Unable to verify your PIN. Please try again." Never "Oops" or "Something broke".
- **Examples** use "e.g.,": "New category name (e.g., Pets)". Not "like Pets".
- **Status words** are capitalized after a dot: "Estimated rates · Offline", "Updated 9:00 AM".
- **Consistent words** across kits and apps: Log Out, Erase Account, Profile, Preferences, Premium, Data Export, App Lock, Face ID (Face Unlock and Fingerprint on Android), and "device" rather than "phone" in messages.
- **Documentation** is written in the same voice: complete sentences, exact version numbers and tags, commands that work as written (on Windows PowerShell, join commands with `;`), and no casual shorthand. A README states the current version and is updated in the same pull request that changes the version.
- Apps do not override kit words. If a word must change, change the kit default so every app receives it.

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
