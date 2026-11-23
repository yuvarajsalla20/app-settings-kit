# app-settings-kit

The standard **Settings screen** for React Native and Expo apps, in one config. Every app gets the same four parents (**About**, **Account**, **Preferences** and a **plan page**), a **Data Export** page with a lock per format, an About page that fills its own Kits and Version rows, and the round Back button with swipe-back. Built on [app-account-kit](https://github.com/yuvarajsalla20/app-account-kit), which draws the screen.

**Current version: 18.1.0** (tag `v18.1.0`). Needs app-account-kit **9.1.0** or later.

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
  "app-account-kit": "git+https://github.com/yuvarajsalla20/app-account-kit.git#<full SHA of v8.1.0>",
  "app-settings-kit": "git+https://github.com/yuvarajsalla20/app-settings-kit.git#<full SHA of v18.1.0>"
},
"kitVersions": {
  "app-account-kit": "v8.1.0",
  "app-settings-kit": "v18.1.0"
}
```

Pin the full commit SHA of a release tag so every build gets exactly the code you tested, and write the tag in `kitVersions`. Find a SHA with `git ls-remote https://github.com/yuvarajsalla20/app-settings-kit refs/tags/v9.1.0`.

**Peer dependencies:** `app-account-kit` ≥ 8.1.0, `firebase` ≥ 11 (15.0.0, for `app-settings-kit/support-firestore`), `react` ≥ 18, `react-native` ≥ 0.74, `@expo/vector-icons` ≥ 14, and (8.0.0) `expo-application`, `expo-constants`, `expo-image-picker`, `expo-image-manipulator`.

## Entry points

| Import | What it holds |
|---|---|
| `app-settings-kit` | `AppSettings`, `DataExportPage`, the Back button and swipe-back, the helpers, and `useSettingsNav` (re-exported from app-account-kit) |
| `app-settings-kit/logic` | Pure helpers only, no React Native, for tests in plain Node |
| `app-settings-kit/support-firestore` | 15.0.0: `firestoreSupport(db, auth)`, how Contact Support sends on Firebase |
| `app-settings-kit/support.rules` | 15.0.0: the Firestore rules block every app copies into its `firestore.rules` |
| `app-settings-kit/support-function` | 16.0.0: `supportMail`, the Cloud Function that emails each Contact Support message to the inbox |
| `app-settings-kit/build-stamp` | `buildStamp()`, plain Node, for `app.config.js` |
| `app-settings-kit/package.json` | The kit's `version`, for About > Kits |

## The layout every app gets

- **Main list:** About, Account, Preferences, the plan page, then any parent page of the app's own.
- **Log Out and Erase Account (6.0.0: required, always on Profile):** Log Out is its own row and opens a small menu; Erase Account under it opens the delete steps (what you lose, type DELETE, password; the steps say the data is deleted forever, as Apple requires). `actions.onSignOut` and `actions.onDeleteAccount` are required. `exitMenu` takes only the optional `{ unlock, losses }`.
- **Features live inside a parent, never on the list.** Data Export is about the person's data, so it is a row called **Data Export** on Profile in every app, opening a pull-down menu headed "Make a file and share it".
- **About:** the app's picture and name, then **Features**, **Rate &lt;App&gt;**, **Share &lt;App&gt;**; **Contact Support** (15.0.0: an in-app form, see below), **Privacy Policy**; **Kits**, **Version**. Kits and Version fill themselves (8.0.0: from `appPackage` and the app itself). A missing part hides its row, and the kit warns in development.
- **Wording:** approved Title Case words by default ("Rate MyApp", "Contact Support", "Privacy Policy", "Log Out", "Erase Account" (4.0.0), "Slide to Send" (15.0.0)). 4.0.0: **enforced**. These words, the card headings and the page names are the same in every app; an app's own version through `strings` is not used (development shows a warning). `strings` is only for the app's own sentences, such as `deleteWarning`.
- **Back:** a round 44 pt Back button in `theme.accent` with a `theme.ink` arrow, and swipe from the left edge to go back, on every page.

Every part is required (5.0.0 and 6.0.0): a missing one is a type error, not a hidden row. Only Change password shows for email sign-in alone (Apple and Google have no password).

## Quick start

Words in CAPITALS are each app's own values. Everything else is the kit.

```tsx
import { AppSettings } from 'app-settings-kit';
import { firestoreSupport } from 'app-settings-kit/support-firestore';

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
  appearance={{ value: THEME_CHOICE, onChange: SET_THEME_CHOICE }}   // required (12.0.0): the kit's Appearance row, free in every app
  security={{ content: <SecurityPage /> }}  // optional: the kit's Security row (app-guard-kit), the one part an app turns on or off
  actions={{ onSignOut: SIGN_OUT, onDeleteAccount: DELETE_ACCOUNT, confirmsWithPassword: NEEDS_PASSWORD }}
  onError={REPORT_ERROR}
  preferences={APP_OWN_ROWS}               // required: SettingsGroup + SettingRow from app-account-kit (Theme, Security go here when an app has them)
  dataExport={{
    formats: [
      { id: 'csv', label: 'CSV File', icon: 'file-text', onExport: MAKE_CSV },
      { id: 'pdf', label: 'PDF File', icon: 'file', onExport: MAKE_PDF },
    ],
    onLocked: OPEN_PLANS,                  // optional: leave out to open the kit's plan page
  }}                                       // 12.0.0: Premium in every app, locked unless plan.subscribed
  plan={{ id: 'premium', subscribed: PAYS_NOW, content: PLAN_PAGE }}   // 13.0.0: the Subscription row, nothing on its right
  support={firestoreSupport(DB, AUTH)}     // 16.0.0: the in-app form while supportForm is true in config/app; otherwise the Mail app
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
| `appearance` | `{ value, onChange }` | Required (12.0.0): the kit's Appearance row (System, Light, Dark) in a Display card at the end of Preferences. Free in every app |
| `security` | `{ content, value? }` | 8.0.0, optional: the kit's Security row in Preferences, opening the app's lock page (app-guard-kit's `SecurityPage`) |
| `preferences` | `ReactNode` | The app's own settings rows |
| `dataExport` | `DataExportConfig` | The Data Export page (see below) |
| `plan` | `PlanConfig` | The plan page: `{ features, freeFeatures, content?, subscribed?, id? }`. 13.0.0: its row and page are called **Subscription** in every app, with nothing on the row's right (`value` and `badge` are not used); the plan itself is called **Premium** (the kit's word, 7.0.0). 10.0.0: `features` and `freeFeatures` are required; every plan page ends with the kit's Free and Premium comparison. Leave out `content` while nothing is on sale and the kit draws its Coming Soon page (see below) |
| `support` | `SupportTransport` | Optional (16.0.0; required in 15.x): how About › Contact Support sends from the in-app form. On Firebase, `firestoreSupport(db, auth)`; the form shows only while `supportForm: true` is set in `config/app`, otherwise the Mail app. The page, its words, topics and limits are the kit's |
| `extraPages` | `ExtraPage[]` | Optional: the app's own pages. `under: 'preferences'` or `'account'` puts one inside that parent; left out, it follows the four parents on the list |

6.0.0 removed `order`, `dataExportIn`, `plainHeaders`, `pickers`, `settingsStrings`, `data`, `about.version`, and the `label`, `icon` and `menu` of `plan` and `dataExport`. They are the kit's now.

Since 4.0.0 the kit's words always win: Profile, Preferences, Data Export, Premium (7.0.0), the headings (Account, Your Data, Sign In on the Profile page; the app's name, Help, Info), Log Out and Erase Account.

## Contact Support inside the app (15.0.0)

About › Contact Support is a page of its own in every app. A person never leaves the app and never needs a mail app: they write their message and Slide to Send, and the support inbox (`about.supportEmail`) receives an email with their address as Reply-To, so a reply from the inbox reaches them directly.

**Mail or the form, chosen by the owner (16.0.0).** The form shows only while `supportForm: true` is set in the app's Firestore document `config/app`. Otherwise, and in an app that passes no `support`, Contact Support opens the Mail app with the app, version and phone filled in, as before. The switch is read once per launch and is Mail if it cannot be read, so an app never shows a form that cannot deliver. Turn it on once the email function is deployed (step 3); turn it off to return everyone to Mail at once. The form ends with **Email Support** ("You can also write from your own mail app."), which opens the Mail app for anyone who prefers it.

- **The page, top to bottom:** one line on what happens; **Replies Go To** (the account's name and email, which cannot be changed here); **Topic** (Question, Report a Problem, Billing and Subscription, Suggestion) in the pull-down menu; **Message** (up to 2,000 characters); **Add Screenshot** (optional, one image, reduced on the phone to at most 1280 px and about 0.5 MB); **Details Included** (the app and version, build, phone, system and plan, shown on one line); then **Slide to Send**.
- **Email Support (16.0.0):** under Slide to Send, a quiet button that opens the Mail app addressed to the inbox, with the same details.
- **Slide to Send:** a round knob with the send mark on a pill track. Sliding it to the end sends; letting go early returns it, so a stray tap never sends. VoiceOver and TalkBack hear one button, "Slide to Send", and a double-tap sends. It stays off until there is a message.
- **Message Sent:** a check mark, "Thank you, &lt;name&gt;. Your message is with the &lt;App&gt; team, and we will reply to &lt;email&gt;.", a reference such as **RR-7K2Q9F**, the topic, screenshot and time, and **Done**, which returns to About.
- **Limits:** five messages per account each hour, enforced by the Firestore rules. When the hour is full, the page says when the next message is possible.
- **The email:** subject "&lt;App&gt; Support: &lt;Topic&gt;, &lt;Reference&gt;"; the message, then From, Topic, Reference, App, Device, Plan and Account ID; the screenshot attached.
- **Without an email address** (rare), the page asks the person to write to the inbox instead.
- **The Page rule:** this page has one job, sending one message to support. It shows no setting, plan or price.

### Setup, once for each app on Firebase

1. **App:** pass `support={firestoreSupport(db, auth)}` (from `app-settings-kit/support-firestore`) to `AppSettings`.
2. **Rules:** copy `support.rules` into the app's `firestore.rules`, inside `match /databases/{database}/documents`, and replace `SUPPORT_INBOX` with the app's support inbox. Deploy the rules. A person can send only to that inbox, only with their own email as Reply-To, at most five each hour, and cannot read a sent message. `rules-test/` checks every rule in the Firebase emulator (`npm install`, then `npm test`; needs Java).
3. **Email (16.0.0):** the Firebase project needs the Blaze plan. The kit's own Cloud Function, `app-settings-kit/support-function`, sends each message through the support inbox's mail account (e.g., Gmail with an app password) to that same inbox, with the person's email as Reply-To, and records the outcome on the document as `delivery`. It sends only to the inbox it signs in to, whatever a document contains. The app keeps a small `functions` folder:

   ```js
   // functions/index.js ("type": "module"; dependencies: app-settings-kit at the same pin as the app, firebase-admin, firebase-functions, nodemailer)
   export { supportMail } from 'app-settings-kit/support-function';
   ```

   `functions/.npmrc` holds `legacy-peer-deps=true`, so the function installs only what it uses, not the app's React Native packages. The first `firebase deploy --only functions` asks for **SUPPORT_SMTP_USER** (the inbox address), **SUPPORT_APP_NAME** (e.g., RingRinga) and the secret **SUPPORT_SMTP_PASSWORD** (the app password), and keeps them for later deploys. A database outside us-central1 (or nam5) uses `createSupportMail({ region })` instead. The Firebase Trigger Email extension is not needed; Firebase retires all extensions on 31 March 2027.
4. **Switch (16.0.0):** the rules must let the app read `config/app` (`match /config/app { allow read: if true; allow write: if false; }`). In the Firebase console, set `supportForm` (boolean) to `true` in that document and send one test message from the app.

## Plan mode: Plan · Free or Subscription (18.0.0)

Which plan row Settings shows follows the plan mode, which the owner sets with `planMode` in the Firestore document `config/app` (app-subscriptions-kit 9.0.0 reads it; app-account-kit 9.0.0 shares it):

- **`"free"`, or missing (the default).** The row reads **Plan** with **Free** on its right. It has no arrow and opens nothing, so nothing in the app is for sale. Data Export is open to everyone with no Premium tag, and Erase Account names no subscription. The Subscription page, Coming Soon and the comparison are not reachable.
- **`"subscription"`.** The row reads **Subscription** and opens the plan page as described below, with Data Export Premium.

Nothing changes in the app's code: `plan` is passed as before, and the kit decides which row to draw.

Every app follows the same switch. An app with app-subscriptions-kit gets it from `SubscriptionProvider`. An app without it (18.1.0) passes one line, and `planMode: "subscription"` then shows the Subscription row with the Coming Soon page:

```tsx
import { firestorePlanMode } from 'app-settings-kit/plan-mode-firestore';

const PLAN_MODE = firestorePlanMode(db, auth); // reads config/app once per launch

<AppSettings planMode={PLAN_MODE} ... />
```

## Data Export is Premium in every app (12.0.0)

While a plan is on sale (plan mode `"subscription"`, 18.0.0), Data Export is a Premium feature in every app, and the kit enforces it. In free mode it is open to everyone. An app cannot make it free, and a new app needs nothing more than its formats:

- **The lock follows the plan.** Every format is locked unless `plan.subscribed` is true (the account pays for Premium). A format's own `locked` is not used and is named in development.
- **The row.** A small gold tag, the award mark and the word "PREMIUM", sits right after the name for every account (11.0.0). While locked, the row shows only the gold padlock; once the account pays, it opens the Choose menu.
- **A tap on the lock** calls `dataExport.onLocked` when the app passes one (e.g., its own plans screen). Leave it out and the kit opens its plan page, which is the Coming Soon page in an app with nothing on sale.
- **The comparison** always lists Data Export under Premium. An app that names "Data Export" in `plan.features` keeps its own line; otherwise the kit adds "Data Export" with the formats (e.g., "CSV File or PDF File"). Do not list it in `plan.freeFeatures` (named in development).

The gold is app-account-kit's `theme.premium`, by default `tints.rate`, the comparison table's gold. `dataExport.value` and `dataExport.badge` are not used. For an app's own Premium rows, pass `premium` (and `locked`, `onLocked`) on an extra page, or use app-account-kit's `SettingRow premium` and `PremiumTag`.

## The plan page and the Free and Premium comparison (10.0.0)

Every app shows its plan page, and it always opens with the Your Plan card (17.0.0), which names the plan the account holds. While nothing is on sale, the page ends with the comparison table, so a person can always tell which features will be Premium and which are free. With a plan on sale (14.0.0), the comparison lives on the Plans screen, where a plan is chosen, and the Subscription page shows plan facts only (the Page rule):

```tsx
plan={{
  features: [{ label: 'Repeat Alerts', detail: 'Up to 5 Times', icon: 'repeat' }, 'Workspaces'],
  freeFeatures: [{ label: 'Sync Across Devices', icon: 'refresh-cw' }],
  content: <PremiumPage features={...} onOpenPlans={...} />, // leave out while nothing is on sale
  subscribed,
}}
```

- **The comparison:** under the heading **Compare Free and Premium**, one table with a **Free** column and a **Premium** column under the award mark, tinted in the plan's color (the theme's `tints.rate`). What the plan adds comes first, with tiles in the plan's color and a dash under Free; what every account has follows, with quiet tiles (`tints.version`) and a tick in both columns. With `subscribed`, the Premium column reads **Your Plan**. Each entry is a line, or `{ label, detail?, icon? }` (a Feather icon name). The table, its words and its colors are the kit's; the app gives only the two lists.
- **The row:** **Subscription**, with the award mark and nothing on its right, in every app and for every account (13.0.0). The page it opens is titled **Subscription**; which plan the account holds (Free, Premium, Coming Soon) is shown on the page, not on the row.
- **Nothing on sale yet:** leave out `content`. The page opens with **Premium**, **Coming Soon** and "Premium for &lt;App&gt; will be available soon.", then the comparison. Nothing to buy.
- **On sale:** pass `content` (app-subscriptions-kit's `PremiumPage`). The page shows only that: status, Included With Premium, Your Plan and Cancel. The comparison is on app-subscriptions-kit's Plans screen, so `features` and `freeFeatures` are not needed (14.0.0).

## Data Export

```ts
interface ExportFormat {
  id: string;                 // unique on the page: 'csv', 'pdf'
  label: string;
  detail?: string;            // a smaller second line
  icon: IconName;
  tint: string;
  locked?: boolean;           // standalone DataExportPage only; in AppSettings the kit locks every format unless plan.subscribed
  lockedDetail?: string;      // line under the label while locked (default: detail)
  lockedValue?: string;       // read out while locked, such as "Premium only, locked"
  lockedBadge?: ReactNode;    // drawn on the right while locked
  onExport: () => Promise<unknown>;
}
```

`dataExport` also takes `onLocked` (opens the plans; leave out to open the kit's plan page), `onError`, `onProblem` (show the failure yourself) or `renderProblem` (drawn under the card), `Row` (your own row design, which gets `{ format, last, onPress }`), and the row fields `id`, `tint`, `value`, `badge`.

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
    { id: 'effects', label: 'Background Effects', icon: 'wind', content: null, under: 'preferences', group: 'Personalize', toggle: EFFECTS },
    { id: 'widgets', label: 'Home Screen Widgets', icon: 'grid', content: WIDGETS_HELP, under: 'about' }, // nothing to set: a help page in About
  ]}
/>
```

A page on Preferences holds something to set: a switch, a choice or a page of settings. A page with nothing to set, such as how to add a widget, is help: give it `under: 'about'` (14.0.0) and it sits in About's Help card after Contact Support.

The list stays About, Profile, Preferences, plan.

## Theming

The kit uses app-account-kit's `AccountTheme` and adds no colors of its own (a test fails on a color literal in `src/`). Two theme values matter here:

- `theme.lock` (`{ icon, circle }`) colors the padlock on locked export formats.
- An optional `shadow` color on the theme object gives the round Back button its shadow.

Pass `components.BackButton` or `components.EdgeSwipe` to replace the built-in Back button or swipe-back.

**The shared headers on your own screens (8.0.0, 13.1.0):** every app draws its Home and inner pages with these two headers, so no app draws its own. Make each once with the same theme Settings takes:

```tsx
import { makeHomeHeader, makePageHeader } from 'app-settings-kit/parts';

export const HomeHeader = makeHomeHeader(ACCOUNT_THEME, { Text });
export const PageHeader = makePageHeader(ACCOUNT_THEME, { Text });

// Home: "Hi <nickname>" on one line, one optional button, and the photo, which opens Profile.
<HomeHeader name={profile.name} fallbackName="MyApp" photo={profile.photo} onOpenProfile={openSettings} button={{ icon: 'search', label: 'Search', onPress: search }} />

// A page: the round Back button and the title, like every Settings page, with up to two buttons, a subtitle and filters.
<PageHeader
  title="Completed"
  onBack={goBack}
  subtitle="24 Reminders This Month"
  buttons={[{ icon: 'search', label: 'Search', onPress: search }]}
  filters={{ options: ['All', 'This Week', 'This Month'], selected, onSelect: setSelected }}
/>

// A sheet: Close in place of Back, and the confirm button (a check on iPhone, the word on Android).
<PageHeader title="Add Reminder" onClose={close} confirm={{ label: 'Save', onPress: save }} />

// 13.3.0: a picker sheet, with the choice so far under the title. Leave out `confirm` when a tap on a choice closes the sheet.
<PageHeader title="Date and Time" subtitle="Today, 7:30 PM" onClose={cancel} confirm={{ label: 'Done', onPress: keep }} />
```

| Part | iPhone | Android |
| --- | --- | --- |
| Buttons (at most two; more are left out) | One glass circle, or two sharing one glass capsule | Material 3 tonal round buttons |
| Filters | Glass segments, the selected one in the accent color | Filter chips, the selected one tonal with a check |
| Sheet | Close in a glass circle, the title in the middle, an accent check | Close, the title on the left, an accent Save button |

13.2.0: a button with `tone: 'danger'` draws its icon in the theme's `danger` color (Delete, Clear All). A button that opens a pull-down menu passes `anchorRef: anchor.ref` (app-account-kit `useAnchor`), so the menu opens from it.
| Home photo | A glass ring and a soft shadow | Flat |

The glass and tonal fills come from the theme: `menu` (else `surface`) for glass, `border` for its edge, and an optional `soft` for the tonal fill (else `surface`). The Back button and the title keep the Settings pages' sizes, so every screen matches Settings exactly.

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

## Page rule: every page has one job

This rule is the standard for every shared kit and every app built on them, including each new app made from app-starter-template. Each page, menu and sheet does one job, written in one line below. A page shows only what serves that job. Another page may point to it with one row or link, but never repeats it or draws it. One fact is listed in one place: a feature list, a comparison or an export exists once, and every page that needs it reads that one source. The kits enforce it: a kit page accepts only what serves its job, and names anything else in a development warning.

| Page | Its one job | Points to, never holds |
|---|---|---|
| **Settings** (the list) | Opens the four parents: About, Profile, Preferences, Subscription. In free mode (18.0.0) the last row only states Plan · Free and opens nothing. | Any setting or action |
| **Profile** | Who you are and your account: photo, nickname, email, password, Data Export, Log Out, Erase Account. | App settings, plan facts |
| **Preferences** | Choices that change how the app behaves or looks, including Personalize, Security and Appearance. | Explanations, how-to steps, plan facts |
| **Subscription** | Your plan and billing: status, Included With Premium, Change Plan, Restore, Cancel; Coming Soon while nothing is on sale. | Feature switches, the plan comparison once a plan is on sale |
| **Plans** | Choosing and buying a plan: the comparison, prices, Subscribe, Redeem a Code. | Account or app settings |
| **Data Export** | Writes and shares your data as a file. The only way the full data leaves the app. | Anything else |
| **About** | The app, help and legal: Features, Rate, Share, Contact Support, help pages, Privacy, Version, Kits. | Settings, account actions |
| **Contact Support** | Sends one message to the app's support inbox: topic, message, optional screenshot, the details added for support, Slide to Send, then Message Sent. | Settings, plans, prices |
| **Sign In** | Signing in or creating an account. | Settings, plans |
| **Welcome** | Greets you once after signing in, then goes Home. | Settings, plans |
| **App Lock** (PIN, Face ID) | Unlocks the app. | Anything else |
| **Menus and sheets** | One choice, or one confirmation, for the row that opened it. | A second task |

Each app lists the job of each of its own screens in its CLAUDE.md, and a change that gives a page a second job moves that job to the page it belongs to.

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
