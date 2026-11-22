import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, View } from 'react-native';
import { headerFills, isIos, type HeaderTheme } from './headerLook';

/** One button at the right end of a header: a Feather icon and what VoiceOver and TalkBack say for it. */
export interface HeaderButtonSpec {
  icon: keyof typeof Feather.glyphMap;
  /** Title Case, e.g., "Add Category". */
  label: string;
  onPress: () => void;
}

const SIZE_IOS = 44;
const SIZE_ANDROID = 48;

/**
 * The right-hand buttons of a header. iPhone: one glass circle, or two buttons sharing one glass capsule. Android: Material 3
 * tonal round buttons side by side.
 */
export function makeHeaderButtons(theme: HeaderTheme) {
  const fill = headerFills(theme);
  const styles = StyleSheet.create({
    capsule: {
      flexDirection: 'row',
      alignItems: 'center',
      height: SIZE_IOS,
      paddingHorizontal: 2,
      borderRadius: SIZE_IOS / 2,
      backgroundColor: fill.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: fill.glassEdge,
      shadowColor: fill.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    inCapsule: { width: SIZE_IOS, height: SIZE_IOS, alignItems: 'center', justifyContent: 'center' },
    tonalRow: { flexDirection: 'row', gap: 8 },
    tonal: { width: SIZE_ANDROID, height: SIZE_ANDROID, borderRadius: SIZE_ANDROID / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: fill.tonal, overflow: 'hidden' },
    pressed: { opacity: 0.7 },
  });

  return function HeaderButtons({ buttons }: { buttons: readonly HeaderButtonSpec[] }) {
    if (!buttons.length) return null;
    if (isIos()) {
      return (
        <View style={styles.capsule}>
          {buttons.map((b) => (
            <Pressable key={b.label} onPress={b.onPress} accessibilityRole="button" accessibilityLabel={b.label} hitSlop={4} style={({ pressed }) => [styles.inCapsule, pressed && styles.pressed]}>
              <Feather name={b.icon} size={22} color={theme.text} />
            </Pressable>
          ))}
        </View>
      );
    }
    return (
      <View style={styles.tonalRow}>
        {buttons.map((b) => (
          <Pressable key={b.label} onPress={b.onPress} accessibilityRole="button" accessibilityLabel={b.label} android_ripple={{ color: theme.accent + '33', borderless: false }} style={styles.tonal}>
            <Feather name={b.icon} size={24} color={theme.accent} />
          </Pressable>
        ))}
      </View>
    );
  };
}
