# Changelog

Release notes for app-settings-kit, newest first. Each version is tagged in git (`v2.3.0`). Major versions (4.0.0, 5.0.0, 6.0.0) lock more of the approved Settings; each has an upgrade guide.

## 11.0.0 (2026-11-22)

**The Premium tag on Data Export.** Members saw no sign that Data Export belongs to Premium, and free accounts saw a pill that each app passed its own way. The kit now draws it, the same in every app:

- **A gold Premium tag after the name**, the award mark and "PREMIUM", for every account (app-account-kit 7.34.0 `premium`). Screen readers hear "Data Export, Premium".
- **Locked: only the gold padlock.** While every format is `locked`, the row shows the gold padlock instead of the menu, and a tap calls `dataExport.onLocked`. Once the plan includes it, the Choose menu works as before.
- **Breaking:** `dataExport.value` and `dataExport.badge` are no longer used (named in development). Needs app-account-kit 7.34.0 or later.
- Extra pages pass `premium`, `locked` and `onLocked` through to app-account-kit, so an app's other Premium rows (such as widgets) carry the same tag.

## 10.0.0 (2026-11-21)

**A Free and Premium comparison on every plan page.** Premium and free features looked alike (the same gold tiles, with only a star or a tick between them). Every plan page now ends with one comparison table, the same in every app: a Free column and a Premium column under the award mark, tinted in the plan's color. Premium features come first, with tiles in the plan's color and a dash under Free; free features follow, with quiet tiles and a tick in both columns.

- **On sale and Coming Soon alike.** The table follows the app's own plan page (`content`) and the Coming Soon card.
- **Coming Soon:** the two lists ("What Premium Will Add", "Free in <App> Today") are replaced by the table. The line reads "Every current <App> feature is free. Premium will be available soon." (was "<App> is free to use. …").
- **Subscribers:** with `plan.subscribed`, the Premium column reads "Your Plan".
- **`plan.features` and `plan.freeFeatures` are required**, and accept `{ label, detail?, icon? }` as well as a line. An empty list is named in development.
- New strings: `compareTitle`, `compareFeature`, `compareFree`, `compareYourPlan`, `compareIncluded`, `compareNotIncluded`. Removed: `planWillAdd`, `freeToday`.
- New exports: `PlanCompare`, `featureParts`, `PlanFeature`.

Upgrading: pass `plan.features` and `plan.freeFeatures` (an app on sale now passes them too, beside `content`). Use app-subscriptions-kit 3.0.0 or later, whose `PremiumPage` no longer repeats the feature list.

## 9.2.0 (2026-11-21)

**The Data Export row's pill says "Choose".** With two or more formats the pill read "CSV / PDF", which looked like a chosen setting. It now says "Choose" (the kit's `exportPick` word, the same in every app). With one format the pill still shows its short name, such as "CSV". The menu, its locks and the Premium pill are unchanged.

Upgrading: nothing to change.

## 9.1.0 (2026-11-21)

**Share and Rate use Google Play on Android in every app, with no app code.** The kit reads the app's Google Play id from app.json (`expo.android.package`), or from the installed app on an Android phone, so Share sends the Google Play page and Rate opens it on Android. iPhone is unchanged.

- `about.playPackage` is deprecated: it is used only when app.json names no Android package.
- New export from `expoBuild`: `expoPlayPackage()`.

Upgrading: nothing to change. An app that passes `about.playPackage` may remove it.

## 9.0.0 (2026-11-21)

**Professional default words on Premium, Coming Soon, Data Export, Log Out and Erase Account.** The words people see change, so this is a major version; nothing changes in code.

- **Coming Soon:** "Moonpenny is free to use. Premium will be available soon." (was "…Premium is on the way.").
- **Data Export menu line:** "Choose a Format to Export" (was "Make a file and share it").
- **Erase Account warning names the right store.** For a paying person it says to cancel in "Google Play subscriptions" on Android and in "your Apple ID settings" on iPhone (it said Apple ID on both). `deleteWarning` takes an optional third argument, `platform` (the kit passes `Platform.OS`).
- **Log Out and Erase Account read in one vocabulary, in Title Case:** "Log Out?", "Stay Logged In", "Log Out Instead", "Erase Your Account?", "What You Will Lose" (was "You will lose, forever:"), "Prefer to Keep Your Data?" (was "Just want a break?"), "Confirm It Is You" (was "Last step: sign in again"), "Erase My Account Forever", "Erase Everything" (was "Delete Everything"). The confirmation word stays DELETE (Apple's account-deletion rule). "Your data stays safe. Log in at any time to see it again." replaces "…Sign in any time…".
- **Contact Support:** "Send us a question, an idea or a problem, and a member of our team will reply." and "No mail app is set up. Please write to <email>."
- **Screen readers hear the lock.** A locked format in the Data Export menu carries the plan's name, so VoiceOver reads "CSV File, Premium" (or the format's `lockedValue`), and the word shows beside the padlock.

Upgrading: nothing to change in code. App tests that matched the old words need the new ones. These words are locked: an app's `strings` cannot change them.

## 8.0.0 (2026-11-21)

**Even less for an app to wire by hand, so every app on the kit is the same.**

- **Theme and Security are the kit's rows.** `appearance={{ value, onChange }}` draws Appearance (System, Light, Dark) in a "Display" card at the end of Preferences; `security={{ content }}` (app-guard-kit's `SecurityPage`) draws a "Security" row with a lock in Preferences. Both stay optional; the words, icons and place are the same in every app.
- **Kits and Version fill themselves.** `appPackage` (the app's package.json) lists every `app-...-kit` dependency in a standard order (Core, Auth, Account, Settings, Export, Payments, Subscriptions, then A to Z), with its version from `kitVersions` and its build from the pin. Version comes from the app itself (`expoBuild()`: app.json's version, the phone's build number, none in Expo Go, and `extra.buildStamp` from `app-settings-kit/build-stamp`). `build` and `kitSources` are deprecated; `build` is ignored.
- **The kit picks its rows' tile colors** from the theme: the plan uses `tints.rate`, Data Export `tints.data`, Security `tints.password`, Appearance `tints.app`. `plan.tint` and `dataExport.tint` are ignored, and an export format no longer needs a `tint`.
- **Photo and password defaults.** `photo` needs only `onChange`; the picker and camera check are app-account-kit's `pickProfilePhoto` and `cameraSupported`. `password.minLength` defaults to app-account-kit's `MIN_PASSWORD` (8).
- **The Erase Account warning is the kit's**, with "Your Premium subscription keeps billing until you cancel it..." when `plan.subscribed`. An app's own `strings.deleteWarning` is ignored.
- **Share on Android** sends the Google Play page when `about.playPackage` is set (`playStorePage`).
- **`makePageHeader`** (`app-settings-kit/parts`): the Settings header (round Back, then the title) for an app's own screens. It takes the app's Text, typed like `components.Text`.
- **Contrast check:** in development, the kit warns about text the app's theme makes hard to read (app-account-kit's `themeContrast`), in whichever look is showing.
- New peer dependencies: `expo-application`, `expo-constants`, `expo-image-picker`, `expo-image-manipulator` (every Expo app on the kits has them).

### Upgrading from 7.x
Replace `kitSources` with `appPackage={pkg}` and delete `build` (add `buildStamp()` from `app-settings-kit/build-stamp` to app.config.js `extra.buildStamp` if the app has none). Move an Appearance row to `appearance` and a Security page to `security`. Delete `photo.pick`, `photo.cameraSupported`, `password.minLength`, `plan.tint`, `dataExport.tint`, each format's `tint` and `strings.deleteWarning`; pass `plan.subscribed` when the person pays.

## 7.0.0 (2026-11-21)

**One plan name and one Coming Soon page, the same in every app.**

- **The plan is called "Premium" in every app.** It is the kit's word now, like Profile and Preferences: the row on the list and the page title. `plan.name` is no longer needed; a different name (VIP, Plus) is not used and is named in development.
- **A standard Coming Soon page.** An app with nothing on sale yet passes no `plan.content`, and the kit draws the page: "Premium" with "Coming Soon", "&lt;App&gt; is free to use. Premium is on the way.", then "What Premium Will Add" (`plan.features`) and "Free in &lt;App&gt; Today" (`plan.freeFeatures`), each card only when the app lists something. The row on the list reads "Coming Soon". New kit words: `comingSoon`, `comingSoonLine`, `planWillAdd`, `freeToday`. `ComingSoonPage` is exported too.
- Nothing else changes for an app that passes `plan.content` and already calls its plan Premium (HringNring).

### Upgrading from 6.x
Delete `plan.name`. An app with no plan on sale deletes its own plan page from `plan.content` and passes `plan.features` (and `plan.freeFeatures`) instead.

## 6.0.0 (2026-11-21)

**Every Settings section is now locked to the approved layout, in every app.** 5.0.0 made every row required; an app could still reorder the list, move Data Export, turn off the approved look, rename or re-icon the plan and Data Export rows, bring its own Back button, replace the Version line, or leave out Log Out and Erase Account. None of that is possible now. Only Theme and Security (rows in `preferences`) are an app's choice.

- **Log Out and Erase Account are required** (`actions.onSignOut`, `actions.onDeleteAccount`) and always on Profile. `exitMenu` takes only `{ unlock, losses }`.
- **The list order is fixed:** About, Profile, Preferences, plan, then the app's own pages. `order` is gone.
- **Data Export is always a pull-down row on Profile**, headed "Make a file and share it" (new kit word `exportHead`). `dataExportIn` and `dataExport.menu` are gone.
- **The look is fixed:** plain headers, pull-down pickers, the centered photo and the kit's round Back button with swipe-back. `plainHeaders`, `pickers` and `components.BackButton`/`EdgeSwipe` are ignored.
- **Row names and icons are the kit's:** `plan.label`, `plan.icon`, `dataExport.label`, `dataExport.icon` are gone. The plan's name is now `plan.name` (required), replacing `settingsStrings`. The tile color still comes from the app's palette (the kit has no colors).
- **Version always comes from `build`:** `about.version` is gone. The old My data row (`data`) is gone; Data Export replaces it.
- Anything an app still passes for these is dropped and named in a development warning.

### Upgrading from 5.x
Pass `actions.onDeleteAccount` and `plan.name`. Delete `order`, `dataExportIn`, `plainHeaders`, `pickers`, `settingsStrings`, `exitMenu` (except `unlock`/`losses`), `data`, `about.version`, `plan.label`, `plan.icon`, `dataExport.label`, `dataExport.icon` and `dataExport.menu`. An app that had Data Export on Preferences now finds it on Profile.

## 5.0.0 (2026-11-21)

**Everything on the approved Settings is required, so no app can leave a row out.** Rate and Share were missing from HringNring's About, and its logo was hidden, because the kit treated them as optional and quietly hid them. Only an app's own Preferences rows (such as Theme or Security) are up to the app.

- **About shows the app's logo under the title "About"** (no name under it), at 104 pt with the home screen's rounded corners. `about.logo` is required: pass the app's one master logo, at least 312 px square (1024 px is best). A smaller image is flagged in development.
- **Rate and Share always show.** `about.appStoreId` (digits) is required. Rate opens the App Store review screen and Share sends the App Store page (`https://apps.apple.com/app/id…`, also exported as `appStorePage`). `about.rate` and `about.share` are gone; `playPackage` and `shareMessage` stay optional.
- **Required now:** `about.featuresUrl`, `build` (Version), `kitSources` (Kits), `preferences`, `dataExport`, `plan` and `photo`. `about.kits` and `about.showHeader` are no longer taken.
- **Development check:** `aboutProblems` flags a value the types allow but that would still hide a row (a malformed App Store number, a Features page that is not https) or blur the logo.
- Needs app-account-kit 7.30.0 or later.

### Upgrading from 4.x
Pass `about.logo` (your master logo), `about.featuresUrl`, `about.appStoreId`, `build`, `kitSources`, `preferences`, `dataExport`, `plan` and `photo`. Delete `about.rate`, `about.share`, `about.kits` and `about.showHeader`.

## 4.0.1 (2026-11-21)

**The Profile page no longer repeats its own name.** The heading over the photo and name card reads **Account** instead of "Profile". The Settings row and the page title stay **Profile**; Your Data and Sign In are unchanged.

A new test confirms that the About page's Version and Kits card is always headed **Info**, even when an app passes its own word (such as "App info").

## 4.0.0 (2026-11-21)

**Every app gets the approved Settings from the kit, with nothing to copy.** Before, each app had to turn on seven settings by hand and an app that missed one showed the old look (the row read "Account", the logo came back).

- **The kit's words are enforced.** Profile, Preferences, Data Export, the card headings (Profile, Your Data, Sign In; the app's name, Help, Info), Log Out, Erase Account and the other Title Case words are the same in every app. An app's own version through `strings` is ignored, with a warning in development. `settingsStrings` now takes only `plan` (the plan's name). `strings` stays for the app's own sentences such as `deleteWarning`.
- **Defaults now on:** `plainHeaders`, `pickers="pullDown"`, `profile.centered`, `about.showHeader: false`, and `exitMenu` = `{ place: 'page', signOutOnAccount: true, signOutMenu: true, deleteOnAccess: true }` (exported as `DEFAULT_EXIT_MENU`).
- **Layout opt-outs** still exist for a special case: `plainHeaders={false}`, `pickers="sheet"`, `profile.centered: false`, `about.showHeader: true`, `exitMenu={{}}`. Words have no opt-out.
- **Data Export menu:** `renderProblem` cannot show with `menu` (there is no page). It now says so in development instead of dropping it quietly; pass `onProblem`.
- **Erase Account** in place of Deactivate and Close Account: the row under Log Out, its page title, "Erase your account?" and "Erase my account forever". The steps still say it is forever and ask for DELETE (Apple 5.1.1(v)).
- Tested against app-account-kit 7.27.1.

Major version because the defaults change what an app shows. Apps can delete those props.

## 3.4.0 (2026-11-21)

**The same Settings words in every app.** So each app stops re-adding them:

- **Card headings by default:** Account shows **Profile**, **Your Data** (over Data Export) and **Sign In**. About shows the **app's name**, **Help** and **Info** (Version before Kits). Reword or blank any through `strings` (`profileGroup`, `dataGroup`, `exitGroup`, `aboutAppGroup`, `aboutHelpGroup`, `aboutInfoGroup`).
- **Deactivate:** with `exitMenu.signOutOnAccount`, the row under Log Out reads **Deactivate** (it holds only Close Account). `strings.access` still wins.
- **Data Export pill names every format:** with `menu` and several formats the row's pill reads "CSV / PDF" (one format still reads "CSV").

Visible on update: the headings and the Deactivate word. Needs app-account-kit 7.26.0 (unchanged).

## 3.3.0 (2026-11-20)

**Data Export as a pull-down menu (opt-in).** `dataExport={{ ..., menu: true }}` makes the Data Export row open a small menu in place instead of a page: one line per format (a padlock while locked), and a tap makes and shares that file, one at a time. With one format the row shows it in a grey pill ("CSV", from `pill` or the first word of the label) and the menu's top line is its `detail` (or `menu.head`). Failures go to `onError` and `onProblem`. Without it nothing changes.

Everything app-account-kit 7.26.0 adds passes straight through: `pickers="pullDown"`, `exitMenu.signOutMenu` and `exitMenu.deleteOnAccess`, and the card heading strings. Needs app-account-kit 7.26.0 (peer dependency raised from 7.24.0).

## 3.2.0 (2026-11-20)

**Access page (opt-in).** `exitMenu={{ place: 'page' }}` drops the ⋯ on Account and puts one **Access** row at the bottom of Account. It opens a page with a **Log Out** row and a red **Close Account** row, with a short line under them. Each opens the same pages and steps as before. Without it nothing changes: the ⋯ stays. Needs app-account-kit 7.24.0 (peer dependency raised from 7.17.0).

## 3.1.0 (2026-11-19)

**"Log Out" and "Close Account".** The default words change from Sign Out to **Log Out** ("Log out?", "Stay logged in", "Log out instead", "Could not log out") and from Delete Account to **Close Account** ("Close your account?", "Close my account forever"). The Close steps still say the data is deleted forever and still ask for DELETE, as Apple's account-deletion rule needs. "Sign in" words are unchanged. Any word can still be changed through `strings`. Nothing to change in apps.

## 3.0.0 (2026-11-19)

**Sign out and Delete account move inside Account, on by default.** Every app that updates gets app-account-kit's ⋯ menu on the Account page: Sign out opens its own page, and Delete account goes through its steps (what you lose, "Sign out instead", type DELETE, password). They are no longer on the main Settings list. Nothing to add in the app. Optional: pass `exitMenu={{ unlock, losses }}` for an unlock step (Face ID or PIN) or "You will lose" lines. To keep 2.x's layout, pass `exitMenu={false}`. Needs app-account-kit 7.17.0 (peer dependency raised from 7.12.0). Major version because what every app shows changes on update.

## 2.4.0 (2026-11-17)

**Light import for the shared parts.** New entry `app-settings-kit/parts` with `makeBackButton`, `BACK_BUTTON` and `EdgeSwipeBack` only, so an app's other screens can use the Back button without loading the whole Settings screen and app-account-kit at start-up. The main entry is unchanged; nothing to change in apps.

## 2.3.0 (2026-11-15)

**Contact Support page in Title Case.** app-account-kit 7.12.0 opens Contact Support as its own page; this kit gives it the approved words "We're Here to Help" and "Write to Us". Needs app-account-kit 7.12.0 (peer dependency raised from 7.10.0).

## 2.2.0 (2026-11-15)

**Profile and Preferences layout, opt-in.** New `dataExportIn` (`'account'` default, or `'preferences'`), new optional `settingsStrings.account` ("Profile"), and `extraPages` entries take `under: 'preferences'` (or `'account'`), so Data Export and an app's own pages such as Connect as Family can live inside Preferences with Back returning there. New types `DataExportPlace` and `AccountExtraPage`. Needs app-account-kit 7.10.0 (peer dependency raised from 7.9.0; 7.10.0 changes nothing for apps that do not use it). An app that sets none of the new options sees exactly what 2.1.0 showed.

## 2.1.0 (2026-11-14)

**the approved About page by default.** Every app gets the approved words in Title Case ("Rate MyApp", "Share MyApp", "Contact Support", "Privacy Policy", "Sign Out", "Delete Account"...) without passing them; `strings` still rewords any of them. In development a warning names any About part the app leaves out (picture, Features, Rate, Share, Kits), since each one hides a row. Data Export is now a plain row on Account called **Data Export**, with no "Your Data" heading (needs app-account-kit 7.9.0; `settingsStrings.yourData` is no longer shown but still accepted). Version and Kits fill themselves from new `build` and `kitSources` props. Each Data Export format row has the approved look: a gold padlock while locked, a download icon once open (needs the app's `theme.lock`). The round Back button and swipe-back are the defaults (new `makeBackButton`, `EdgeSwipeBack`, `BACK_BUTTON`, `SWIPE_BACK`). New `titleCaseStrings(appName)` and `missingAboutParts(about)`. Needs `@expo/vector-icons` (every Expo app has it). Upgrading changes what other apps show: the round Back button, swipe-back and Title Case words arrive by default (pass `components.BackButton` / `components.EdgeSwipe` or `strings` to keep your own). The Back button is made again only when one of its colors changes, and a second quick swipe while the page slides away is ignored.

## 2.0.0 (2026-11-14)

**four parents.** The list is About, Account, Preferences, plan. Data Export moves off the list onto Account, under Your Data (new string `yourData`); "export" in `order` is ignored. New `useSettingsNav()` for shortcuts (the plan page's Data Export perk). Needs app-account-kit 7.8.0. Upgrading from 1.x: drop "export" from `order` if you set one; nothing else to change.

## 1.0.0 (2026-11-14)

first release. The standard Settings: About, Account, Preferences, Data Export (lock per format), plan page; kits list; version line; build stamp.

