import { SettingRow, SettingsGroup } from 'app-account-kit';
import type { SettingsStrings } from '../strings';

export interface ComingSoonPageProps {
  /** The app's name, as on About. */
  appName: string;
  /** The plan's name (Premium). */
  planName: string;
  /** The plan's color (the plan row's tint, from the app's palette). */
  tint: string;
  strings: Pick<SettingsStrings, 'comingSoon' | 'comingSoonLine'>;
}

/**
 * 7.0.0: the top of the standard plan page for an app whose plan is not on sale yet, the same in every app: the plan's name
 * with "Coming Soon" and one line saying the app is free and the plan is on the way. Rows only: nothing to buy.
 * 10.0.0: what the plan will add and what is free are no longer two lists here; AppSettings shows them below this card in
 * the kit's Free and Premium comparison (`PlanCompare`), the same table as on a plan page that is on sale.
 */
export function ComingSoonPage({ appName, planName, tint, strings }: ComingSoonPageProps) {
  return (
    <SettingsGroup>
      <SettingRow icon="award" tint={tint} label={planName} detail={strings.comingSoonLine(appName, planName)} value={strings.comingSoon} last />
    </SettingsGroup>
  );
}
