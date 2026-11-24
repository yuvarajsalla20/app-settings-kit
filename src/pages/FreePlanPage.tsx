import Feather from '@expo/vector-icons/Feather';
import { SettingsGroup, type AccountTheme } from 'app-account-kit';
import type { ComponentType } from 'react';
import { Text as PlainText, View, type TextProps } from 'react-native';
import type { SettingsStrings } from '../strings';
import type { PlanFeature } from '../types';
import { FreePlanCard } from './ComingSoonPage';
import { featureParts } from './PlanCompare';

export interface FreePlanPageProps {
  /** The app's theme: every color comes from it. */
  theme: AccountTheme;
  /** What every account has, one entry each (a line, or `{ label, detail, icon }`): the app's `plan.freeFeatures`. */
  freeFeatures: readonly PlanFeature[];
  /** The app's Text (its font). */
  Text?: ComponentType<TextProps>;
  strings: Pick<SettingsStrings, 'yourPlan' | 'freePlan' | 'freePlanTitle' | 'yourCurrentPlan' | 'freeIncluded' | 'includedWithYourPlan' | 'compareIncluded'>;
}

/**
 * 22.0.0: the Subscription page while nothing is on sale (plan mode 'free'), the same in every app. The Your Plan card says
 * the account is on the Free plan, and one list names every feature that plan includes. Nothing on the page mentions
 * Premium, a price or a purchase, because in free mode nothing is for sale (the Page rule: plan facts only).
 */
export function FreePlanPage({ theme: t, freeFeatures, Text = PlainText, strings }: FreePlanPageProps) {
  const quiet = t.tints.version;
  return (
    <View style={{ gap: 16 }}>
      <FreePlanCard theme={t} Text={Text} strings={strings} />
      {freeFeatures.length ? (
        <SettingsGroup title={strings.includedWithYourPlan}>
          {freeFeatures.map((f, i) => {
            const r = featureParts(f);
            return (
              <View
                key={r.label}
                accessible
                accessibilityLabel={`${r.label}${r.detail ? `, ${r.detail}` : ''}. ${strings.compareIncluded}.`}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: 14, paddingVertical: 8, ...(i ? { borderTopWidth: 1, borderTopColor: t.line } : {}) }}
              >
                <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: `${quiet}33`, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name={r.icon ?? 'check-circle'} size={17} color={quiet} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.text, fontSize: 15, fontWeight: '600' }}>{r.label}</Text>
                  {r.detail ? <Text style={{ color: t.muted, fontSize: 12, marginTop: 1 }}>{r.detail}</Text> : null}
                </View>
                <Feather name="check" size={18} color={t.accent} />
              </View>
            );
          })}
        </SettingsGroup>
      ) : null}
    </View>
  );
}
