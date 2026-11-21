import Feather from '@expo/vector-icons/Feather';
import { SettingsGroup, type AccountTheme, type IconName } from 'app-account-kit';
import type { ComponentType } from 'react';
import { Text as PlainText, View, type TextProps } from 'react-native';
import type { SettingsStrings } from '../strings';
import type { PlanFeature } from '../types';

type TextLike = ComponentType<TextProps>;

export interface PlanCompareProps {
  /** The app's theme: every color comes from it. */
  theme: AccountTheme;
  /** The plan's color (the plan row's tint): the Premium column, its tiles and its ticks. */
  gold: string;
  planName: string;
  /** What the plan adds. Each shows a dash under Free and a tick under the plan. */
  features: readonly PlanFeature[];
  /** What every account has. Each shows a tick in both columns. */
  freeFeatures: readonly PlanFeature[];
  /** The person pays for the plan now: the plan's column says "Your Plan". */
  subscribed?: boolean;
  /** The app's Text (its font). */
  Text?: TextLike;
  strings: Pick<SettingsStrings, 'compareTitle' | 'compareFeature' | 'compareFree' | 'compareYourPlan' | 'compareIncluded' | 'compareNotIncluded'>;
}

/** A plan feature as a plain line, or with a short second line and the app's own icon. */
export const featureParts = (f: PlanFeature): { label: string; detail?: string; icon?: IconName } => (typeof f === 'string' ? { label: f } : f);

const FREE_COL = 48;
const PLAN_COL = 70;

/**
 * 10.0.0: the Free and Premium comparison on the plan page, the same in every app. One table: a Free column and the plan's
 * column under its award mark, tinted in the plan's color. What the plan adds comes first, with tiles in the plan's color and
 * a dash under Free; what every account has follows, with quiet tiles and a tick in both columns. Shown on the Coming Soon
 * page and under the app's own plan page alike, so a person can always tell at a glance which features are Premium.
 */
export function PlanCompare({ theme: t, gold, planName, features, freeFeatures, subscribed, Text = PlainText, strings }: PlanCompareProps) {
  const quiet = t.tints.version;
  const column = `${gold}1F`;
  // The plan's tick is a solid coin in its color, so the Premium column reads first; a free tick is a quiet line mark.
  const tick = (color: string, solid: boolean) => (
    <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: solid ? color : undefined, alignItems: 'center', justifyContent: 'center' }}>
      <Feather name="check" size={solid ? 15 : 17} color={solid ? t.surface : color} />
    </View>
  );
  const dash = <Text style={{ color: t.faint, fontSize: 16, fontWeight: '600' }}>–</Text>;
  const rows = [...features.map((f) => ({ ...featureParts(f), paid: true })), ...freeFeatures.map((f) => ({ ...featureParts(f), paid: false }))];
  return (
    <SettingsGroup title={strings.compareTitle(planName)}>
      <View style={{ flexDirection: 'row', alignItems: 'stretch', minHeight: 52 }}>
        <View style={{ flex: 1, justifyContent: 'flex-end', paddingLeft: 16, paddingBottom: 10 }}>
          <Text style={{ color: t.muted, fontSize: 13, fontWeight: '700' }}>{strings.compareFeature}</Text>
        </View>
        <View style={{ width: FREE_COL, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 10 }}>
          <Text style={{ color: t.muted, fontSize: 12, fontWeight: '800', letterSpacing: 0.6 }}>{strings.compareFree.toUpperCase()}</Text>
        </View>
        <View accessible accessibilityLabel={subscribed ? `${planName}, ${strings.compareYourPlan}` : planName}
          style={{ width: PLAN_COL, marginRight: 12, alignItems: 'center', justifyContent: 'flex-end', gap: 3, paddingTop: 8, paddingBottom: 10, backgroundColor: column, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          <Feather name="award" size={18} color={gold} />
          <Text style={{ color: gold, fontSize: 12, fontWeight: '800', letterSpacing: 0.6 }}>{planName.toUpperCase()}</Text>
          {subscribed ? <Text style={{ color: gold, fontSize: 10, fontWeight: '700' }}>{strings.compareYourPlan}</Text> : null}
        </View>
      </View>
      {rows.map((r) => {
        const tint = r.paid ? gold : quiet;
        const said = `${r.label}${r.detail ? `, ${r.detail}` : ''}. ${strings.compareFree}: ${r.paid ? strings.compareNotIncluded : strings.compareIncluded}. ${planName}: ${strings.compareIncluded}.`;
        return (
          <View key={`${r.paid ? 'p' : 'f'}:${r.label}`} accessible accessibilityLabel={said}
            style={{ flexDirection: 'row', alignItems: 'stretch', minHeight: 56, borderTopWidth: 1, borderTopColor: t.line }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 14, paddingRight: 6, paddingVertical: 8 }}>
              <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: `${tint}33`, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name={r.icon ?? (r.paid ? 'star' : 'check-circle')} size={17} color={tint} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontSize: 15, fontWeight: '600' }}>{r.label}</Text>
                {r.detail ? <Text style={{ color: t.muted, fontSize: 12, marginTop: 1 }}>{r.detail}</Text> : null}
              </View>
            </View>
            <View style={{ width: FREE_COL, alignItems: 'center', justifyContent: 'center' }}>{r.paid ? dash : tick(t.on, false)}</View>
            <View style={{ width: PLAN_COL, marginRight: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: column }}>
              {tick(gold, true)}
            </View>
          </View>
        );
      })}
    </SettingsGroup>
  );
}
