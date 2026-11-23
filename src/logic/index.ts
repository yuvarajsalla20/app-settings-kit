// Pure functions: no React Native, so an app's tests can import them in plain Node (`app-settings-kit/logic`).
export { KIT_ORDER, kitDisplayName, kitList, kitsFromPackage, pinnedBuild } from './kits';
export type { AppPackage, KitEntry, KitSource } from './kits';
export { versionLines } from './version';
export type { VersionInfo, VersionParts } from './version';
export { DEFAULT_IDS, DEFAULT_ORDER, hubOrder } from './order';
export type { SectionName } from './order';
export { createOneAtATime } from './oneAtATime';
export { LOGO_MIN_PIXELS, aboutProblems, logoPixels, missingAboutParts, titleCaseStrings } from './about';
export type { AboutParts } from './about';
export { SWIPE_BACK, finishesSwipe, isEdgeSwipe } from './swipe';
export { SUPPORT_COLLECTIONS, SUPPORT_LIMITS, SUPPORT_TOPICS, SupportLimitError, buildSupportMail, cleanSupportMessage, nextSupportWindow, screenshotMegabytes, supportDetailsLine, supportDevice, supportFormSwitch, supportReference } from './support';
export type { SupportDetails, SupportDraft, SupportMail, SupportScreenshot, SupportSender, SupportTopic, SupportTransport, SupportWindow } from './support';
