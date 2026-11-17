/**
 * Only the small shared parts (the round Back button and swipe-from-the-edge), without the Settings screen. Importing
 * `app-settings-kit/parts` from an app's other screens does not load the whole Settings screen and app-account-kit.
 */
export { BACK_BUTTON, makeBackButton } from './BackButton';
export type { BackButtonProps } from './BackButton';
export { EdgeSwipeBack } from './EdgeSwipeBack';
