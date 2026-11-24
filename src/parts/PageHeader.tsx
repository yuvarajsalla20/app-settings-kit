import Feather from '@expo/vector-icons/Feather';
import type { ComponentType, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text as PlainText, View, type TextProps } from 'react-native';
import { makeBackButton } from './BackButton';
import { makeConfirmPair } from './ConfirmPair';
import { makeHeaderButtons, type HeaderButtonSpec } from './HeaderButton';
import { headerFills, isIos, limitButtons, type HeaderTheme } from './headerLook';

/** 13.1.0: a row of filters under the title. The app passes the words and which one is selected. */
export interface HeaderFilters {
  options: readonly string[];
  selected: string;
  onSelect: (option: string) => void;
}

/** 13.1.0: the confirm button of a sheet. 21.0.0: a ✓ on every platform; the label is what screen readers hear. */
export interface HeaderConfirm {
  /** Title Case, e.g., "Save". Read by screen readers, not drawn (21.0.0). */
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export interface PageHeaderProps {
  title: string;
  /** Leave out on a screen with nowhere to go back to: the title then starts at the edge. */
  onBack?: () => void;
  /** What VoiceOver says for Back, such as "Back to Home". Default "Back". */
  backLabel?: string;
  /** A short word right after the title, such as the month. */
  titleRight?: string;
  /** 13.1.0: one calm line under the title, e.g., "24 Reminders This Month". 13.3.0: on a sheet too, e.g., the choice so far. */
  subtitle?: string;
  /** 13.1.0: up to two buttons at the right end. iPhone: one glass capsule. Android: tonal round buttons. */
  buttons?: readonly HeaderButtonSpec[];
  /** 13.1.0: a row of filters under the title: glass segments on iPhone, Material filter chips on Android. */
  filters?: HeaderFilters;
  /**
   * 13.1.0: a sheet's header. Close takes the place of Back, the title sits in the middle on iPhone and on the left on Android,
   * and `confirm` (when given) is the accent button at the right end.
   */
  onClose?: () => void;
  /** What VoiceOver says for Close. Default "Close". */
  closeLabel?: string;
  confirm?: HeaderConfirm;
  /** Anything else for the right end of the row. Prefer `buttons`, which keeps the kit's look and limit. */
  right?: ReactNode;
}

/** The app's Text (its font), the same type as app-account-kit's `components.Text`. */
type TextLike = ComponentType<TextProps>;

/**
 * The header of every page in every app: the round Back button and the title in one row, the same as every Settings page, with up
 * to two buttons, an optional subtitle and filter row (13.1.0), and a sheet form with Close and a confirm button. Make it once,
 * with the app's theme and its Text:
 *
 *   export const PageHeader = makePageHeader(ACCOUNT_THEME, { Text });
 *   <PageHeader title="Categories" onBack={goBack} buttons={[{ icon: 'plus', label: 'Add Category', onPress: add }]} />
 */
export function makePageHeader(theme: HeaderTheme, components: { Text?: TextLike } = {}) {
  const BackButton = makeBackButton(theme);
  const HeaderButtons = makeHeaderButtons(theme);
  const { CancelButton, ConfirmButton } = makeConfirmPair(theme);
  const Text: TextLike = components.Text ?? PlainText;
  const fill = headerFills(theme);
  const ios = isIos();
  // The same sizes as the Settings pages' plain header (app-account-kit's inline header).
  const styles = StyleSheet.create({
    wrap: { marginBottom: 14, gap: 10 },
    row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6 },
    back: { marginRight: 4 },
    titleBox: { flexShrink: 1, flexGrow: 1 },
    titles: { flexShrink: 1, flexDirection: 'row', alignItems: 'baseline', gap: 8 },
    title: { flexShrink: 1, color: theme.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.2 },
    sheetTitles: { flex: 1, minWidth: 0 },
    // 13.3.0: on a sheet the line under the title is the choice so far, in the accent color.
    sheetSubtitle: { marginTop: 2, color: theme.accent, fontSize: 13, fontWeight: '700', textAlign: ios ? 'center' : 'left' },
    sheetTitle: { color: theme.text, fontSize: ios ? 17 : 22, fontWeight: ios ? '700' : '600', textAlign: ios ? 'center' : 'left' },
    titleRight: { color: theme.muted, fontSize: 14, fontWeight: '500' },
    subtitle: { color: theme.muted, fontSize: 14, fontWeight: '500', marginTop: 2 },
    right: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 8 },
    spacer: { width: 44 },
    pressed: { opacity: 0.75 },
    segments: { flexDirection: 'row', padding: 4, gap: 2, borderRadius: 22, backgroundColor: fill.glass, borderWidth: StyleSheet.hairlineWidth, borderColor: fill.glassEdge },
    segment: { flex: 1, minHeight: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
    segmentOn: { backgroundColor: theme.accent },
    segmentWord: { color: theme.text, fontSize: 14, fontWeight: '600' },
    segmentWordOn: { color: theme.ink, fontWeight: '700' },
    chips: { flexDirection: 'row', gap: 8 },
    chip: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: fill.outline },
    chipOn: { backgroundColor: fill.tonal, borderColor: fill.tonal, paddingLeft: 10 },
    chipWord: { color: theme.text, fontSize: 14, fontWeight: '600' },
    chipWordOn: { color: theme.accent, fontWeight: '700' },
  });

  function Filters({ options, selected, onSelect }: HeaderFilters) {
    if (ios) {
      return (
        <View style={styles.segments} accessibilityRole="tablist">
          {options.map((o) => {
            const on = o === selected;
            return (
              <Pressable key={o} onPress={() => onSelect(o)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={[styles.segment, on && styles.segmentOn]}>
                <Text style={[styles.segmentWord, on && styles.segmentWordOn]} numberOfLines={1}>
                  {o}
                </Text>
              </Pressable>
            );
          })}
        </View>
      );
    }
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {options.map((o) => {
          const on = o === selected;
          return (
            <Pressable key={o} onPress={() => onSelect(o)} accessibilityRole="button" accessibilityState={{ selected: on }} style={[styles.chip, on && styles.chipOn]}>
              {on ? <Feather name="check" size={18} color={theme.accent} /> : null}
              <Text style={[styles.chipWord, on && styles.chipWordOn]}>{o}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  return function PageHeader({ title, onBack, backLabel, titleRight, subtitle, buttons, filters, onClose, closeLabel = 'Close', confirm, right }: PageHeaderProps) {
    const shown = limitButtons(buttons, 'PageHeader');
    if (onClose) {
      return (
        <View style={styles.wrap}>
          <View style={styles.row}>
            <CancelButton onPress={onClose} label={closeLabel} />
            <View style={styles.sheetTitles}>
              <Text style={styles.sheetTitle} numberOfLines={1} accessibilityRole="header">
                {title}
              </Text>
              {subtitle ? (
                <Text style={styles.sheetSubtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
            {confirm ? <ConfirmButton onPress={confirm.onPress} label={confirm.label} disabled={confirm.disabled} /> : ios ? <View style={styles.spacer} /> : null}
          </View>
          {filters ? <Filters {...filters} /> : null}
        </View>
      );
    }
    return (
      <View style={styles.wrap}>
        <View style={styles.row}>
          {onBack ? <BackButton onPress={onBack} label={backLabel} style={styles.back} /> : null}
          <View style={styles.titleBox}>
            <View style={styles.titles}>
              <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
                {title}
              </Text>
              {titleRight ? (
                <Text style={styles.titleRight} numberOfLines={1}>
                  {titleRight}
                </Text>
              ) : null}
            </View>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {shown.length || right ? (
            <View style={styles.right}>
              {right}
              <HeaderButtons buttons={shown} />
            </View>
          ) : null}
        </View>
        {filters ? <Filters {...filters} /> : null}
      </View>
    );
  };
}
