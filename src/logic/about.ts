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
  // 9.0.0: Title Case for every title and button, one vocabulary (Log Out / Log In, Erase), calm full sentences.
  signOutTitle: 'Log Out?',
  signOutBody: 'Your data stays safe. Log in at any time to see it again.',
  stayIn: 'Stay Logged In',
  deleteBreakTitle: 'Prefer to Keep Your Data?',
  deleteBreakAction: 'Log Out Instead',
  signOutAction: 'log out',
  deleteAccount: 'Erase Account',
  deleteTitle: 'Erase Your Account?',
  deleteLoseTitle: 'What You Will Lose',
  deleteFinalTitle: 'Confirm It Is You',
  deleteForever: 'Erase My Account Forever',
  deleteEverything: 'Erase Everything',
  keepAccount: 'Keep My Account',
  supportBody: 'Send us a question, an idea or a problem, and a member of our team will reply.',
  noMail: (email: string) => `No mail app is set up. Please write to ${email}.`,
  // 3.2.0: the Access page (exitMenu place 'page'), in the same words.
  access: 'Access',
  accessNote: 'Logging out keeps your data safe. Erasing your account removes it permanently, after a few confirmation steps.',
});

/**
 * 3.4.0: the grey headings over the cards, the same in every app. Profile page: Account (4.0.1), Your Data, Sign In. About: the app's
 * name, Help, Info (Version before Kits). 4.0.0: enforced, an app cannot reword them.
 */
export const cardHeadings = (appName: string) => ({
  profileGroup: 'Account',
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

/** 5.0.0: the logo is shown at 104 pt, so it needs 312 px (3x) to stay sharp on every iPhone. */
export const LOGO_MIN_PIXELS = 312;

/** The pixel width of an image logo (a `require`d file or `{ uri, width }`), or undefined when it cannot be known (a drawn element, a remote file). */
export const logoPixels = (logo: unknown): number | undefined => {
  if (!logo || typeof logo === 'string') return undefined;
  if (typeof logo === 'object' && logo !== null && 'width' in logo && typeof (logo as { width?: unknown }).width === 'number') return (logo as { width: number }).width;
  if (typeof logo === 'number') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const rn = require('react-native') as { Image?: { resolveAssetSource?: (s: number) => { width?: number } | null } };
      return rn.Image?.resolveAssetSource?.(logo)?.width;
    } catch {
      return undefined;
    }
  }
  return undefined;
};

/** 5.0.0: values the types allow but that would still hide a row or blur the logo. Empty when About is complete. */
export const aboutProblems = (about: { logo?: unknown; featuresUrl?: string; appStoreId?: string }, logoWidth?: number): string[] => {
  const out: string[] = [];
  if (!about.logo) out.push('About needs the app\'s logo.');
  else if (logoWidth !== undefined && logoWidth < LOGO_MIN_PIXELS) out.push(`The About logo is ${logoWidth} px wide; use the master logo, at least ${LOGO_MIN_PIXELS} px (1024 px is best), so it stays sharp.`);
  if (!about.featuresUrl || !/^https:\/\//i.test(about.featuresUrl.trim())) out.push('About needs an https Features page (featuresUrl).');
  if (!about.appStoreId || !/^\d+$/.test(about.appStoreId.trim())) out.push('About needs the App Store number (appStoreId, digits only) for Rate and Share.');
  return out;
};
