# Changelog

Release notes for app-settings-kit, newest first. Each version is tagged in git (`v2.3.0`). Later releases stay backward compatible: a new option defaults to the old behavior.

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

