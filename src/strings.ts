/** Every word this kit adds, in English. 4.0.0: the same in every app; only `plan` (the plan's name) can be set through `settingsStrings`. */
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
  /** The plan row and page title, until the app names it (VIP, Premium). */
  plan: string;
  /** Shown when a file could not be made. */
  exportFailed: string;
}

export const DEFAULT_SETTINGS_STRINGS: SettingsStrings = {
  preferences: 'Preferences',
  account: 'Profile',
  dataExport: 'Data Export',
  plan: 'Plan',
  exportFailed: 'Could not create the file. Please try again.',
};
