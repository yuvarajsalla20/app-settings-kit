import Feather from '@expo/vector-icons/Feather';
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
  strings: Pick<SettingsStrings, 'comingSoon' | 'comingSoonLine' | 'yourPlan' | 'freePlan' | 'freePlanTitle' | 'yourCurrentPlan' | 'freeIncluded'>;
}

/** A soft wash of a hex color (e.g., the accent at 10%), for the card's fill and border. Other color forms are used as given. */
const wash = (color: string, alpha: string) => (/^#[0-9a-f]{6}$/i.test(color) ? `${color}${alpha}` : color);

/**
 * 17.0.0: the Your Plan card, first on the plan page, the same as app-subscriptions-kit draws for a plan on sale. While nothing
 * is on sale every account is on the free plan. 20.0.0: the Get Premium pattern of app-subscriptions-kit 11.0.0 (a round mark,
 * a bold title, a colored line and a quieter line), washed and outlined in the calm accent color.
 */
export function FreePlanCard({ theme: t, Text = PlainText, strings }: Pick<ComingSoonPageProps, 'theme' | 'Text' | 'strings'>) {
  const title = strings.freePlanTitle(strings.freePlan);
  return (
    <View
      accessible
      accessibilityLabel={`${strings.yourPlan}. ${title}. ${strings.yourCurrentPlan}. ${strings.freeIncluded}`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: t.radius + 8, backgroundColor: t.surface, borderWidth: 1.5, borderColor: wash(t.accent, '8C'), overflow: 'hidden' }}
    >
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: wash(t.accent, '1A') }} />
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name="shield" size={22} color={t.accent} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: t.text, fontSize: 18, fontWeight: '800' }}>{title}</Text>
        <Text style={{ color: t.accent, fontSize: 14, fontWeight: '700' }}>{strings.yourCurrentPlan}</Text>
        <Text style={{ color: t.muted, fontSize: 13 }}>{strings.freeIncluded}</Text>
      </View>
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
