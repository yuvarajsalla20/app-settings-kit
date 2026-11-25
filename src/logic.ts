// Pure functions: no React Native, so an app's tests can import them in plain Node (`app-settings-kit/logic`).
export { KIT_ORDER, kitDisplayName, kitList, kitsFromPackage, pinnedBuild } from './about/kits';
export type { AppPackage, KitEntry, KitSource } from './about/kits';
export { versionLines } from './about/version';
export type { VersionInfo, VersionParts } from './about/version';
export { DEFAULT_IDS, DEFAULT_ORDER, hubOrder } from './settings/order';
export type { SectionName } from './settings/order';
export { createOneAtATime } from './shared/oneAtATime';
export { LOGO_MIN_PIXELS, aboutProblems, logoPixels, missingAboutParts, titleCaseStrings } from './about/about';
export type { AboutParts } from './about/about';
export { SWIPE_BACK, finishesSwipe, isEdgeSwipe } from './headers/swipe';
export { SUPPORT_COLLECTIONS, SUPPORT_LIMITS, SUPPORT_TOPICS, SupportLimitError, buildSupportMail, cleanSupportMessage, nextSupportWindow, screenshotMegabytes, supportDetailsLine, supportDevice, supportFormSwitch, supportReference } from './support/support';
export type { SupportDetails, SupportDraft, SupportMail, SupportScreenshot, SupportSender, SupportTopic, SupportTransport, SupportWindow } from './support/support';
