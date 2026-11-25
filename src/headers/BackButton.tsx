import Feather from '@expo/vector-icons/Feather';
import type { AccountTheme } from 'app-account-kit';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

/** The approved Back button's size: a 44 pt circle, a 24 pt arrow, and a little extra room around it for the finger. */
export const BACK_BUTTON = { size: 44, icon: 24, hitSlop: 12 } as const;

export interface BackButtonProps {
  onPress: () => void;
  /** What VoiceOver says, such as "Back to Home". Default "Back". */
  label?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The approved Back button in the app's colors: a solid `theme.accent` circle with a thick `theme.ink` arrow and a soft shadow (`theme.shadow`, else `theme.text`).
 * The Settings screen uses it by default; an app makes one for its own screens with the same theme: `const BackButton = makeBackButton(APP_THEME)`.
 */
export function makeBackButton(theme: Pick<AccountTheme, 'accent' | 'ink' | 'text'> & { shadow?: string }) {
  const styles = StyleSheet.create({
    circle: {
      width: BACK_BUTTON.size,
      height: BACK_BUTTON.size,
      borderRadius: BACK_BUTTON.size / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accent,
      shadowColor: theme.shadow ?? theme.text,
      shadowOpacity: 0.18,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    pressed: { opacity: 0.8 },
    // The chevron leans right in its box; a nudge left centres it by eye.
    icon: { marginLeft: -2 },
  });
  return function BackButton({ onPress, label = 'Back', style }: BackButtonProps) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={BACK_BUTTON.hitSlop} style={({ pressed }) => [styles.circle, pressed && styles.pressed, style]}>
        <Feather name="chevron-left" size={BACK_BUTTON.icon} color={theme.ink} style={styles.icon} />
      </Pressable>
    );
  };
}
