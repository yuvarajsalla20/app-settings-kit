import type { ComponentType, ReactNode } from 'react';
import type { IconName, SettingsScreenProps } from 'app-account-kit';

/** app-account-kit's own `extraPages` entry, as handed to `SettingsScreen`. */
export type AccountExtraPage = NonNullable<SettingsScreenProps['extraPages']>[number];

/**
 * A page the app adds (app-account-kit's `extraPages` entry). `under` places it:
 * left out, a parent on the list; `'account'`, a row on Account; `'preferences'` (or app-account-kit's `'app'`), a row on Preferences (since 2.2.0).
 * Back from a page inside a parent returns to that parent.
 */
export type ExtraPage = Omit<AccountExtraPage, 'under'> & { under?: AccountExtraPage['under'] | 'preferences' };

/** Where the Data Export row lives: on Account (the default) or on Preferences. */
export type DataExportPlace = 'account' | 'preferences';

/** One file the Data Export page can make. */
export interface ExportFormat {
  /** Unique on the page, such as "csv" or "pdf". */
  id: string;
  label: string;
  /** A second, smaller line under the label. */
  detail?: string;
  icon: IconName;
  /** The color of the icon tile. */
  tint: string;
  /** True while the person's plan does not include this format: a tap calls `onLocked` (open the plans) instead of making the file. Each format has its own lock. */
  locked?: boolean;
  /** The line under the label while locked. Default: `detail`. */
  lockedDetail?: string;
  /** The word on the right while locked, read out with the label, such as "VIP only, locked". */
  lockedValue?: string;
  /** Drawn on the right while locked, such as the subscriptions kit's lock badge. Screen readers hear `lockedValue`. */
  lockedBadge?: ReactNode;
  /** Makes and shares the file. The kit runs one at a time and reports a failure. */
  onExport: () => Promise<unknown>;
}

/** What a custom export row receives (see `DataExportPageProps.Row`). */
export interface ExportRowProps {
  format: ExportFormat;
  /** The last row in the card has no line under it. */
  last: boolean;
  /** Makes the file, or calls `onLocked` while the format is locked. */
  onPress: () => void;
}

export interface DataExportPageProps {
  formats: readonly ExportFormat[];
  /** A tap on a locked format: usually opens the plans. */
  onLocked?: () => void;
  /** Quiet failures, for crash reporting. Called with "data-export" and the error. */
  onError?: (where: string, error: unknown) => void;
  /** Gets the sentence when a file could not be made (the app shows it its own way). Leave out to use `renderProblem`. */
  onProblem?: (text: string) => void;
  /** Draws that sentence under the card. Used when `onProblem` is left out. */
  renderProblem?: (text: string) => ReactNode;
  /** Draws each row instead of app-account-kit's `SettingRow`, such as an app's own Premium row. */
  Row?: ComponentType<ExportRowProps>;
}

/** The row on the Settings list for a page this kit adds. Every part is optional. */
export interface PageRow {
  /** The page id. Default "export" for Data Export and "plan" for the plan page. */
  id?: string;
  /** The row name and page title. Default from `settingsStrings`. */
  label?: string;
  icon?: IconName;
  /** The icon tile color. Default: the Preferences tile color. */
  tint?: string;
  /** A short word on the right of the row, read out with the label ("Yearly", "VIP"). */
  value?: string;
  /** Drawn in place of `value`, such as a plan pill. */
  badge?: ReactNode;
}

/** The Data Export page: its row, and the formats it offers. */
export type DataExportConfig = PageRow & DataExportPageProps;

/** The plan page (VIP, Premium): its row, and what the page shows (for example app-subscriptions-kit's `PremiumPage`). */
export interface PlanConfig extends PageRow {
  content: ReactNode;
}
