import { SettingRow, SettingsGroup, type AccountTheme } from 'app-account-kit';
import type { ComponentType } from 'react';
import { Text as PlainText, View, type TextProps } from 'react-native';
import type { SettingsStrings } from '../strings';

export interface ComingSoonPageProps {
  /** The app's name, as on About. */
  appName: string;
  /** The plan's name (Premium). */
  planName: string;
  /** The plan's color (the plan row's tint, from the app's palette). */
  tint: string;
  /** 17.0.0: the app's theme, for the Your Plan card. */
  theme: AccountTheme;
  /** The app's Text (its font). */
  Text?: ComponentType<TextProps>;
  strings: Pick<SettingsStrings, 'comingSoon' | 'comingSoonLine' | 'yourPlan' | 'freePlan' | 'freePlanLine'>;
}

/**
 * 17.0.0: the Your Plan card, first on the plan page, the same as app-subscriptions-kit 8.0.0 draws for a plan on sale. While
 * nothing is on sale every account is on the free plan, so the card says so in one line.
 */
export function FreePlanCard({ theme: t, Text = PlainText, strings }: Pick<ComingSoonPageProps, 'theme' | 'Text' | 'strings'>) {
  return (
    <View
      accessible
      accessibilityLabel={`${strings.yourPlan}. ${strings.freePlan}. ${strings.freePlanLine(strings.freePlan)}`}
      style={{ borderRadius: t.radius + 8, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, padding: 18, gap: 10 }}
    >
      <Text style={{ color: t.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase' }}>{strings.yourPlan}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: t.muted }} />
        </View>
        <Text style={{ flex: 1, color: t.text, fontSize: 22, fontWeight: '800' }}>{strings.freePlan}</Text>
      </View>
      <Text style={{ color: t.muted, fontSize: 14, lineHeight: 20 }}>{strings.freePlanLine(strings.freePlan)}</Text>
    </View>
  );
}

/**
 * 7.0.0: the top of the standard plan page for an app whose plan is not on sale yet, the same in every app: the plan's name
 * with "Coming Soon" and one line saying the plan is on the way. Rows only: nothing to buy.
 * 10.0.0: what the plan will add and what is free are no longer two lists here; AppSettings shows them below this card in
 * the kit's Free and Premium comparison (`PlanCompare`), the same table as on a plan page that is on sale.
 * 17.0.0: the Your Plan card comes first, so the page says which plan the account holds.
 */
export function ComingSoonPage({ appName, planName, tint, theme, Text, strings }: ComingSoonPageProps) {
  return (
    <View style={{ gap: 16 }}>
      <FreePlanCard theme={theme} Text={Text} strings={strings} />
      <SettingsGroup>
        <SettingRow icon="award" tint={tint} label={planName} detail={strings.comingSoonLine(appName, planName)} value={strings.comingSoon} last />
      </SettingsGroup>
    </View>
  );
}
