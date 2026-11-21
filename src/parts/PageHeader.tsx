import type { AccountTheme } from 'app-account-kit';
import type { ComponentType, ReactNode } from 'react';
import { StyleSheet, Text as PlainText, View, type TextProps } from 'react-native';
import { makeBackButton } from './BackButton';

export interface PageHeaderProps {
  title: string;
  /** Leave out on a screen with nowhere to go back to: the title then starts at the edge. */
  onBack?: () => void;
  /** What VoiceOver says for Back, such as "Back to Home". Default "Back". */
  backLabel?: string;
  /** A short word right after the title, such as the month. */
  titleRight?: string;
  /** Anything for the right end of the row (an icon button, an avatar). */
  right?: ReactNode;
}

/** The app's Text (its font), the same type as app-account-kit's `components.Text`. */
type TextLike = ComponentType<TextProps>;

/**
 * 8.0.0: the header every Settings page has (the round Back button, then the title in one row), for an app's own screens, so every
 * inner screen of every app matches Settings exactly. Make it once, with the app's theme and its Text:
 *
 *   export const PageHeader = makePageHeader(APP_THEME, { Text });
 *   <PageHeader title="Categories" onBack={goBack} />
 */
export function makePageHeader(theme: Pick<AccountTheme, 'accent' | 'ink' | 'text' | 'muted'> & { shadow?: string }, components: { Text?: TextLike } = {}) {
  const BackButton = makeBackButton(theme);
  const Text: TextLike = components.Text ?? PlainText;
  // The same sizes as the Settings pages' plain header (app-account-kit's inline header).
  const styles = StyleSheet.create({
    row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
    back: { marginRight: 4 },
    titles: { flexShrink: 1, flexDirection: 'row', alignItems: 'baseline', gap: 8 },
    title: { flexShrink: 1, color: theme.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.2 },
    titleRight: { color: theme.muted, fontSize: 14, fontWeight: '500' },
    right: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' },
  });
  return function PageHeader({ title, onBack, backLabel, titleRight, right }: PageHeaderProps) {
    return (
      <View style={styles.row}>
        {onBack ? <BackButton onPress={onBack} label={backLabel} style={styles.back} /> : null}
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
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    );
  };
}
