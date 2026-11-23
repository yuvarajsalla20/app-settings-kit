import Feather from '@expo/vector-icons/Feather';
import type { ComponentType } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text as PlainText, View, type TextProps } from 'react-native';
import { makeHeaderButtons, type HeaderButtonSpec } from './HeaderButton';
import { limitButtons, type HeaderTheme } from './headerLook';

export interface HomeHeaderProps {
  /** The nickname from the account. The greeting is "Hi <nickname>"; without one it shows `fallbackName` (the app's name). */
  name?: string | null;
  fallbackName: string;
  /** 13.2.0: the sign-in email. Without a nickname the letter is the email's, the same letter as the avatar in Settings. */
  email?: string | null;
  /** The profile photo (the account's, else the sign-in provider's). Without one the kit draws the first letter. */
  photo?: string | null;
  /** Opens Profile (or Settings). */
  onOpenProfile: () => void;
  /** What VoiceOver says for the photo. Default "Profile". */
  profileLabel?: string;
  /** One optional button beside the photo, e.g., Search. */
  button?: HeaderButtonSpec;
}

type TextLike = ComponentType<TextProps>;

/** The greeting the header shows: "Hi <nickname>" on one line, or the app's name when there is no nickname. */
export const homeGreeting = (name: string | null | undefined, fallbackName: string) => {
  const n = (name ?? '').trim();
  return n ? `Hi ${n}` : fallbackName;
};

/** The letter shown when there is no photo: the first letter of the nickname, else of the email (13.2.0), else of the app's name. */
export const homeInitial = (name: string | null | undefined, fallbackName: string, email?: string | null) =>
  Array.from((name ?? '').trim() || (email ?? '').trim() || fallbackName)[0]?.toUpperCase() ?? '';

/**
 * 13.1.0: the Home header every app shows: "Hi <nickname>" on one line, an optional button and the profile photo on the right.
 * Tapping the photo opens Profile. Make it once, with the app's theme and its Text:
 *
 *   export const HomeHeader = makeHomeHeader(ACCOUNT_THEME, { Text });
 *   <HomeHeader name={profile.name} fallbackName={APP_NAME} photo={profile.photo} onOpenProfile={openSettings} />
 */
export function makeHomeHeader(theme: HeaderTheme, components: { Text?: TextLike } = {}) {
  const HeaderButtons = makeHeaderButtons(theme);
  const Text: TextLike = components.Text ?? PlainText;
  const ios = Platform.OS === 'ios';
  const size = ios ? 46 : 48;
  const styles = StyleSheet.create({
    row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: ios ? 12 : 10, marginBottom: 14 },
    hello: { flex: 1, color: theme.text, fontSize: ios ? 32 : 34, fontWeight: '800', letterSpacing: ios ? -0.6 : -0.8 },
    photo: {
      width: size,
      height: size,
      borderRadius: size / 2,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accent,
      // iPhone: a thin glass ring and a soft shadow; Android: flat, as Material draws an avatar.
      ...(ios ? { borderWidth: 2, borderColor: theme.surface ?? theme.accent, shadowColor: theme.shadow ?? theme.text, shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } } : {}),
    },
    image: { width: size, height: size },
    initial: { color: theme.ink, fontSize: Math.round(size * 0.42), fontWeight: '800' },
    pressed: { opacity: 0.8 },
  });

  return function HomeHeader({ name, fallbackName, email, photo, onOpenProfile, profileLabel = 'Profile', button }: HomeHeaderProps) {
    const greeting = homeGreeting(name, fallbackName);
    const buttons = limitButtons(button ? [button] : [], 'HomeHeader').slice(0, 1);
    return (
      <View style={styles.row}>
        <Text style={styles.hello} numberOfLines={1} accessibilityRole="header">
          {greeting}
        </Text>
        <HeaderButtons buttons={buttons} />
        <Pressable onPress={onOpenProfile} accessibilityRole="button" accessibilityLabel={profileLabel} hitSlop={8} style={({ pressed }) => [styles.photo, pressed && styles.pressed]}>
          {photo ? <Image source={{ uri: photo }} style={styles.image} accessibilityIgnoresInvertColors /> : name || fallbackName ? <Text style={styles.initial}>{homeInitial(name, fallbackName, email)}</Text> : <Feather name="user" size={22} color={theme.ink} />}
        </Pressable>
      </View>
    );
  };
}
