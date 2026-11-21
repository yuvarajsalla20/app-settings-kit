import type { AccountStrings } from 'app-account-kit';

/**
 * The approved Settings words, in Title Case like Apple's Settings: "Rate MyApp", "Contact Support", "Privacy Policy".
 * app-account-kit's own defaults are plainer ("Rate", "Contact support"); every app on this kit gets these instead, and can still reword any of them through `strings`.
 */
export const titleCaseStrings = (appName: string): Partial<AccountStrings> => ({
  myData: 'My Data',
  changePhoto: 'Change Photo',
  takePhoto: 'Take Photo',
  removePhoto: 'Remove',
  profilePicture: 'Profile Picture',
  changePassword: 'Change Password',
  currentPassword: 'Current Password',
  newPassword: 'New Password',
  confirmPassword: 'Confirm Password',
  privacy: 'Privacy Policy',
  contactSupport: 'Contact Support',
  supportTitle: "We're Here to Help",
  writeToUs: 'Write to Us',
  rate: `Rate ${appName}`,
  share: `Share ${appName}`,
  // 3.1.0: "Log Out" and "Close Account"; 4.0.0: "Erase Account". The steps still say the data is deleted forever and ask for DELETE (Apple's account-deletion rule).
  signOut: 'Log Out',
  signOutTitle: 'Log out?',
  stayIn: 'Stay logged in',
  deleteBreakAction: 'Log out instead',
  signOutAction: 'log out',
  deleteAccount: 'Erase Account',
  deleteTitle: 'Erase your account?',
  deleteForever: 'Erase my account forever',
  deleteEverything: 'Delete Everything',
  keepAccount: 'Keep My Account',
  // 3.2.0: the Access page (exitMenu place 'page'), in the same words.
  access: 'Access',
  accessNote: 'Logging out keeps your data safe. Erasing your account wipes it for good, after a few checks.',
});

/**
 * 3.4.0: the grey headings over the cards, the same in every app. Account: Profile, Your Data, Sign In. About: the app's
 * name, Help, Info (Version before Kits). 4.0.0: enforced, an app cannot reword them.
 */
export const cardHeadings = (appName: string) => ({
  profileGroup: 'Profile',
  dataGroup: 'Your Data',
  exitGroup: 'Sign In',
  aboutAppGroup: appName,
  aboutHelpGroup: 'Help',
  aboutInfoGroup: 'Info',
});

/** What the approved About page needs. Each missing part hides a row or the picture, so a new app is told in development. */
export interface AboutParts {
  logo?: unknown;
  featuresUrl?: string;
  rate?: unknown;
  share?: unknown;
  kits?: unknown;
}

/** The parts of the approved About page this app leaves out: picture, Features, Rate, Share, Kits. Empty when the page is complete. */
export const missingAboutParts = (about: AboutParts): string[] =>
  (['logo', 'featuresUrl', 'rate', 'share', 'kits'] as const).filter((key) => !about[key]);
