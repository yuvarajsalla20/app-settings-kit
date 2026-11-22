/** Every word this kit adds, in English. 4.0.0: the same in every app. 7.0.0: the plan's name too (Premium). */
export interface SettingsStrings {
  /** The row and page for the app's own settings (app-account-kit's "App" page). */
  preferences: string;
  /**
   * The Account row and page title. 4.0.0: "Profile" in every app (was app-account-kit's "Account").
   */
  account: string;
  /** The Data Export row and page title. */
  dataExport: string;
  /** @deprecated Not shown since 2.1.0 (Data Export is a row on Account with no heading). Kept so apps that pass it still compile. */
  yourData?: string;
  /** The plan's name, in the comparison, Coming Soon and the Erase Account warning. 7.0.0: "Premium" in every app. */
  plan: string;
  /** 13.0.0: the plan row and its page title, "Subscription" in every app. The row shows nothing on its right. */
  subscription: string;
  /** Shown when a file could not be made. */
  exportFailed: string;
  /** 6.0.0: the line at the top of the Data Export menu. */
  exportHead: string;
  /** 9.2.0: the pill on the Data Export row when there are two or more formats. One format shows its own short name. */
  exportPick: string;
  /** 7.0.0: the badge on the Coming Soon page while the plan is not on sale yet. 13.0.0: no longer on the row. */
  comingSoon: string;
  /** 7.0.0: the line under the plan's name on its Coming Soon page. */
  comingSoonLine: (appName: string, planName: string) => string;
  /** 10.0.0: the heading over the Free and Premium comparison on the plan page. */
  compareTitle: (planName: string) => string;
  /** 10.0.0: the comparison's first column. */
  compareFeature: string;
  /** 10.0.0: the comparison's Free column. */
  compareFree: string;
  /** 10.0.0: under the plan's column once the person pays for it. */
  compareYourPlan: string;
  /** 10.0.0: what screen readers hear for a tick and a dash in the comparison. */
  compareIncluded: string;
  compareNotIncluded: string;
  /** 8.0.0: the card at the end of Preferences that holds Appearance. */
  display: string;
  /** 8.0.0: the Light / Dark row. */
  appearance: string;
  /** 8.0.0: the lock row (Face ID, PIN) in Preferences. */
  security: string;
  /**
   * 8.0.0: the warning on Erase Account, the same in every app. `subscribed` adds the line about cancelling a paid plan first,
   * since deleting the account does not stop App Store billing. 9.0.0: `platform` (Platform.OS) names where to cancel:
   * Google Play subscriptions on Android, Apple ID settings everywhere else.
   */
  deleteWarning: (planName: string, subscribed: boolean, platform?: string) => string;
}

export const DEFAULT_SETTINGS_STRINGS: SettingsStrings = {
  preferences: 'Preferences',
  account: 'Profile',
  dataExport: 'Data Export',
  plan: 'Premium',
  subscription: 'Subscription',
  exportFailed: 'Could not create the file. Please try again.',
  exportHead: 'Choose a Format to Export',
  exportPick: 'Choose',
  comingSoon: 'Coming Soon',
  comingSoonLine: (appName, planName) => `${planName} for ${appName} will be available soon.`,
  compareTitle: (planName) => `Compare Free and ${planName}`,
  compareFeature: 'Feature',
  compareFree: 'Free',
  compareYourPlan: 'Your Plan',
  compareIncluded: 'Included',
  compareNotIncluded: 'Not included',
  display: 'Display',
  appearance: 'Appearance',
  security: 'Security',
  deleteWarning: (planName, subscribed, platform = 'ios') =>
    'This erases every setting and piece of data, and your login. It cannot be undone.' +
    (subscribed
      ? ` Your ${planName} subscription keeps billing until you cancel it in ${platform === 'android' ? 'Google Play subscriptions' : 'your Apple ID settings'}, so cancel it first.`
      : '') +
    ' Use Data Export first if you want a copy.',
};
