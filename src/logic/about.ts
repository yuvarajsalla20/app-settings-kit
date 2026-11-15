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
  signOut: 'Sign Out',
  deleteAccount: 'Delete Account',
  deleteEverything: 'Delete Everything',
  keepAccount: 'Keep My Account',
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
