import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, View } from 'react-native';
import { headerFills, type HeaderTheme } from './headerLook';

/** 21.0.0: the size of the ✕ and ✓ circles, the same as the Back button. */
export const CONFIRM_SIZE = 44;

export interface ConfirmPairProps {
  /** ✕: leaves without saving. */
  onCancel: () => void;
  /** ✓ (or the bin, with `kind: 'delete'`). Leave out for ✕ alone. */
  onConfirm?: () => void;
  /** ✓ is faded and does nothing while true (e.g., a required field is empty, or it is saving). */
  confirmDisabled?: boolean;
  /** 'save' (default) draws ✓ in the accent; 'delete' draws the bin in red, to confirm a delete. */
  kind?: 'save' | 'delete';
  /** What screen readers hear. Defaults: "Cancel" and "Save" (or "Delete"). */
  cancelLabel?: string;
  confirmLabel?: string;
}

/**
 * 21.0.0: the one way to save or cancel, in every app and on every platform: a red ✕ on the left and a ✓ on the right,
 * icons only. The sheet header uses it, and an app uses it for any edit inside a page (e.g., renaming a list entry), so
 * there is never a second style for the same action.
 *
 *   export const ConfirmPair = makeConfirmPair(ACCOUNT_THEME);
 *   <ConfirmPair onCancel={close} onConfirm={save} confirmDisabled={!name} />
 */
export function makeConfirmPair(theme: HeaderTheme) {
  const fill = headerFills(theme);
  // The theme's danger red; an app theme without one gets its text color (the kit holds no color of its own).
  const red = theme.danger ?? theme.text;
  const circle = { width: CONFIRM_SIZE, height: CONFIRM_SIZE, borderRadius: CONFIRM_SIZE / 2, alignItems: 'center' as const, justifyContent: 'center' as const };
  const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cancel: { ...circle, backgroundColor: fill.glass, borderWidth: StyleSheet.hairlineWidth, borderColor: fill.glassEdge },
    confirm: { ...circle, backgroundColor: theme.accent, shadowColor: theme.accent, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    danger: { backgroundColor: red, shadowColor: red },
    disabled: { opacity: 0.4 },
    pressed: { opacity: 0.75 },
  });

  /** ✕ alone, red: the sheet header's Close. */
  function CancelButton({ onPress, label = 'Cancel' }: { onPress: () => void; label?: string }) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
        <Feather name="x" size={22} color={red} />
      </Pressable>
    );
  }

  /** ✓ (or the red bin) alone: the sheet header's confirm. */
  function ConfirmButton({ onPress, label, disabled, kind = 'save' }: { onPress: () => void; label?: string; disabled?: boolean; kind?: 'save' | 'delete' }) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label ?? (kind === 'delete' ? 'Delete' : 'Save')}
        accessibilityState={{ disabled: !!disabled }}
        hitSlop={8}
        style={({ pressed }) => [styles.confirm, kind === 'delete' && styles.danger, disabled && styles.disabled, pressed && styles.pressed]}
      >
        <Feather name={kind === 'delete' ? 'trash-2' : 'check'} size={kind === 'delete' ? 19 : 22} color={theme.ink} />
      </Pressable>
    );
  }

  function ConfirmPair({ onCancel, onConfirm, confirmDisabled, kind = 'save', cancelLabel, confirmLabel }: ConfirmPairProps) {
    return (
      <View style={styles.row}>
        <CancelButton onPress={onCancel} label={cancelLabel} />
        {onConfirm ? <ConfirmButton onPress={onConfirm} label={confirmLabel} disabled={confirmDisabled} kind={kind} /> : null}
      </View>
    );
  }

  return Object.assign(ConfirmPair, { CancelButton, ConfirmButton });
}
