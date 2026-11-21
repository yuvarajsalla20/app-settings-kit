import { SettingRow, SettingsGroup } from 'app-account-kit';
import type { SettingsStrings } from '../strings';

export interface ComingSoonPageProps {
  /** The app's name, as on About. */
  appName: string;
  /** The plan's name (Premium, Plus, VIP). */
  planName: string;
  /** The tile color for every row (the plan row's tint, from the app's palette). */
  tint: string;
  /** What the plan will add, one line each. */
  features?: readonly string[];
  /** What the app already gives for free, one line each. */
  freeFeatures?: readonly string[];
  strings: Pick<SettingsStrings, 'comingSoon' | 'comingSoonLine' | 'planWillAdd' | 'freeToday'>;
}

/**
 * 7.0.0: the standard plan page for an app whose plan is not on sale yet, the same in every app. The plan's name with
 * "Coming Soon", one line saying the app is free and the plan is on the way, then what the plan will add and what is
 * free today (each card only when the app lists something). Rows only: no buttons, nothing to buy.
 */
export function ComingSoonPage({ appName, planName, tint, features = [], freeFeatures = [], strings }: ComingSoonPageProps) {
  return (
    <>
      <SettingsGroup>
        <SettingRow icon="award" tint={tint} label={planName} detail={strings.comingSoonLine(appName, planName)} value={strings.comingSoon} last />
      </SettingsGroup>
      {features.length ? (
        <SettingsGroup title={strings.planWillAdd(planName)}>
          {features.map((line, i) => (
            <SettingRow key={line} icon="star" tint={tint} label={line} last={i === features.length - 1} />
          ))}
        </SettingsGroup>
      ) : null}
      {freeFeatures.length ? (
        <SettingsGroup title={strings.freeToday(appName)}>
          {freeFeatures.map((line, i) => (
            <SettingRow key={line} icon="check" tint={tint} label={line} last={i === freeFeatures.length - 1} />
          ))}
        </SettingsGroup>
      ) : null}
    </>
  );
}
