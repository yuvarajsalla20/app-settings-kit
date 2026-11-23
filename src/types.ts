import type { ComponentType, ReactNode } from 'react';
import type { IconName, SettingsScreenProps } from 'app-account-kit';

/** app-account-kit's own `extraPages` entry, as handed to `SettingsScreen`. */
export type AccountExtraPage = NonNullable<SettingsScreenProps['extraPages']>[number];

/**
 * A page the app adds (app-account-kit's `extraPages` entry). `under` places it:
 * left out, a parent on the list; `'account'`, a row on Account; `'preferences'` (or app-account-kit's `'app'`), a row on Preferences (since 2.2.0);
 * `'about'` (14.0.0, app-account-kit 7.37.0), a help page in About's Help card. A page with nothing to set goes under About, not Preferences (the Page rule).
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
  /** Only for a standalone DataExportPage (its own tile color). In AppSettings the kit colors Data Export itself (theme.tints.data) and ignores this. */
  tint?: string;
  /**
   * For a standalone DataExportPage only: true while the person's plan does not include this format. 12.0.0: in AppSettings
   * Data Export is Premium in every app and the kit locks every format unless `plan.subscribed`, so this is not used there.
   */
  locked?: boolean;
  /** The line under the label while locked. Default: `detail`. */
  lockedDetail?: string;
  /** The word on the right while locked, read out with the label, such as "VIP only, locked". */
  lockedValue?: string;
  /** Drawn on the right while locked, such as the subscriptions kit's lock badge. Screen readers hear `lockedValue`. */
  lockedBadge?: ReactNode;
  /** Makes and shares the file. The kit runs one at a time and reports a failure. */
  onExport: () => Promise<unknown>;
  /** 3.3.0, `dataExport.menu` only: the short word in the row's pill, such as "CSV". Default: the first word of `label`. */
  pill?: string;
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
  /** A tap on a locked format: usually opens the plans. 12.0.0, in AppSettings: leave out to open the kit's plan page. */
  onLocked?: () => void;
  /** Quiet failures, for crash reporting. Called with "data-export" and the error. */
  onError?: (where: string, error: unknown) => void;
  /** Gets the sentence when a file could not be made (the app shows it its own way). Leave out to use `renderProblem`. */
  onProblem?: (text: string) => void;
  /** Draws that sentence under the card. Used when `onProblem` is left out. */
  renderProblem?: (text: string) => ReactNode;
  /** Draws each row instead of app-account-kit's `SettingRow`, such as an app's own Premium row. */
  Row?: ComponentType<ExportRowProps>;
  /** The tile color of a format that has no `tint` of its own. Pass the theme's `tints.data`. */
  tint?: string;
}

/**
 * The row on the Settings list for a page this kit adds. 6.0.0: the row's name, icon and color are the kit's, the same in
 * every app; an app gives only the page id, its palette's tile color, and the live value or pill on the right.
 */
export interface PageRow {
  /** The page id. Default "export" for Data Export and "plan" for the plan page. */
  id?: string;
  /** The icon tile color, from the app's palette (the kit has no colors of its own). Default: the Preferences tile color. */
  tint?: string;
  /**
   * @deprecated 13.0.0: not used. The kit's rows draw their own right side: nothing on the Subscription row, the Choose menu
   * or gold padlock on Data Export. Still accepted so older apps compile, and named in development.
   */
  value?: string;
  /** @deprecated 13.0.0: not used (see `value`). */
  badge?: ReactNode;
}

/**
 * The Data Export page: its row, and the formats it offers. 11.0.0: the row always carries the gold Premium tag. 12.0.0: Data
 * Export is Premium in every app: while the account does not pay for Premium (`plan.subscribed`) every format is locked, the
 * row shows the gold padlock and a tap calls `onLocked`, or opens the plan page when there is none. `value` and `badge` are not used.
 */
export type DataExportConfig = PageRow &
  DataExportPageProps & {
    /** @deprecated 6.0.0: Data Export is always the pull-down menu on its row, with the kit's line at the top. Ignored. */
    menu?: unknown;
  };

/** The plan page (VIP, Premium): its row, and what the page shows (for example app-subscriptions-kit's `PremiumPage`). */
/** 10.0.0: one feature in the plan comparison: a line, or a line with a short second line and a Feather icon name. */
export type PlanFeature = string | { label: string; detail?: string; icon?: IconName };

export interface PlanConfig extends PageRow {
  /**
   * @deprecated 7.0.0: the plan is called "Premium" in every app (the kit's word). Still accepted so 6.x apps compile; a different
   * name is not used and is named in development.
   */
  name?: string;
  /**
   * The plan page, for an app whose plan is on sale (usually app-subscriptions-kit's `PremiumPage`).
   * 7.0.0: leave it out while there is nothing to buy: the kit then draws its standard Coming Soon page, the same in every
   * app. 13.0.0: the row reads "Subscription" with nothing on its right, on sale or not.
   */
  content?: ReactNode;
  /**
   * What the plan adds, one entry each (a line, or `{ label, detail, icon }`), for the kit's Free and Premium comparison.
   * 14.0.1: needed only while nothing is on sale (no `content`), where Coming Soon shows the comparison; with a plan on sale
   * the comparison is on the Plans screen (the Page rule), and these lists are not used. Missing on Coming Soon is named in development.
   */
  features?: readonly PlanFeature[];
  /** 8.0.0: the person pays for the plan now. Erase Account then also says to cancel the subscription first, and the comparison marks the plan as "Your Plan" (10.0.0). */
  subscribed?: boolean;
  /** What every account has for free, one entry each, for the same comparison. 14.0.1: needed only on Coming Soon, like `features`. */
  freeFeatures?: readonly PlanFeature[];
}
