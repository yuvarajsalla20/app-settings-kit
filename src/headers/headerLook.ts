import type { AccountTheme } from 'app-account-kit';
import { Platform } from 'react-native';

/**
 * The colors the shared headers read. Every name but the first four is optional, so a theme made for the Back button alone
 * still works; the full app-account-kit theme (what Settings already takes) fills them all.
 */
export type HeaderTheme = Pick<AccountTheme, 'accent' | 'ink' | 'text' | 'muted'> &
  Partial<Pick<AccountTheme, 'surface' | 'border' | 'line' | 'menu' | 'danger'>> & {
    shadow?: string;
    /** Android: the soft fill of a tonal button and the selected filter chip. Default: the surface color. */
    soft?: string;
  };

/** The kit's limit on buttons at the right end of a header. More are not drawn (development names the extras). */
export const MAX_HEADER_BUTTONS = 2;

/** iPhone draws Liquid Glass shapes; Android draws Material 3 tonal shapes. */
export const isIos = () => Platform.OS === 'ios';

/** The see-through fill of a glass shape on iPhone, and the tonal fill on Android. */
export function headerFills(theme: HeaderTheme) {
  const surface = theme.surface ?? theme.ink;
  return {
    glass: theme.menu ?? surface,
    glassEdge: theme.border ?? theme.line ?? theme.muted,
    tonal: theme.soft ?? surface,
    outline: theme.line ?? theme.border ?? theme.muted,
    shadow: theme.shadow ?? theme.text,
  };
}

/** Keeps the first two buttons and names any extra in development. */
export function limitButtons<T>(buttons: readonly T[] | undefined, where: string): readonly T[] {
  const list = buttons ?? [];
  if (list.length > MAX_HEADER_BUTTONS && typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(`app-settings-kit: ${where} shows at most ${MAX_HEADER_BUTTONS} buttons; ${list.length - MAX_HEADER_BUTTONS} more were left out.`);
  }
  return list.slice(0, MAX_HEADER_BUTTONS);
}
