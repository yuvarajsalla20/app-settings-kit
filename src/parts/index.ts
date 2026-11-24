/**
 * Only the small shared parts (the round Back button, the page header and swipe-from-the-edge), without the Settings screen. Importing
 * `app-settings-kit/parts` from an app's other screens does not load the whole Settings screen and app-account-kit.
 */
export { BACK_BUTTON, makeBackButton } from './BackButton';
export type { BackButtonProps } from './BackButton';
export { EdgeSwipeBack } from './EdgeSwipeBack';
export { makePageHeader } from './PageHeader';
export { CONFIRM_SIZE, makeConfirmPair } from './ConfirmPair';
export type { ConfirmPairProps } from './ConfirmPair';
export type { HeaderConfirm, HeaderFilters, PageHeaderProps } from './PageHeader';
export { HOME_PHOTO_LABEL, homeGreeting, homeInitial, makeHomeHeader } from './HomeHeader';
export type { HomeHeaderProps } from './HomeHeader';
export type { HeaderButtonSpec } from './HeaderButton';
export { MAX_HEADER_BUTTONS } from './headerLook';
export type { HeaderTheme } from './headerLook';
