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
  /** The plan row and page title. 7.0.0: "Premium" in every app. */
  plan: string;
  /** Shown when a file could not be made. */
  exportFailed: string;
  /** 6.0.0: the line at the top of the Data Export menu. */
  exportHead: string;
  /** 7.0.0: the plan row's value and the badge on its page while the plan is not on sale yet. */
  comingSoon: string;
  /** 7.0.0: the line under the plan's name on its Coming Soon page. */
  comingSoonLine: (appName: string, planName: string) => string;
  /** 7.0.0: the heading over what the plan will add. */
  planWillAdd: (planName: string) => string;
  /** 7.0.0: the heading over what is free today. */
  freeToday: (appName: string) => string;
}

export const DEFAULT_SETTINGS_STRINGS: SettingsStrings = {
  preferences: 'Preferences',
  account: 'Profile',
  dataExport: 'Data Export',
  plan: 'Premium',
  exportFailed: 'Could not create the file. Please try again.',
  exportHead: 'Make a file and share it',
  comingSoon: 'Coming Soon',
  comingSoonLine: (appName, planName) => `${appName} is free to use. ${planName} is on the way.`,
  planWillAdd: (planName) => `What ${planName} Will Add`,
  freeToday: (appName) => `Free in ${appName} Today`,
};
