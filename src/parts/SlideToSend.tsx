import Feather from '@expo/vector-icons/Feather';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, PanResponder, Platform, View, type LayoutChangeEvent } from 'react-native';
import type { AccountTheme } from 'app-account-kit';
import type { ComponentType } from 'react';

const KNOB = 52;
const PAD = 6;
const HEIGHT = KNOB + PAD * 2;
/** How far along the track the knob must travel to send. */
export const SLIDE_SEND_AT = 0.85;

export interface SlideToSendProps {
  theme: Pick<AccountTheme, 'accent' | 'ink' | 'text' | 'muted' | 'field' | 'border'>;
  label: string;
  /** What screen readers hear after the label, e.g., "Double-tap to send the message." */
  hint: string;
  disabled?: boolean;
  busy?: boolean;
  onSend: () => void;
  Text: ComponentType<{ style?: unknown; numberOfLines?: number; children?: unknown }>;
}

/** Whether a release at `dx` of a track `max` points long sends. Pure, for tests. */
export const slideSends = (dx: number, max: number) => max > 0 && dx >= max * SLIDE_SEND_AT;

/**
 * 15.0.0: Slide to Send. A round knob with the send mark sits at the start of a pill-shaped track; sliding it to the end
 * sends, and letting go early returns it to the start, so a message is never sent by an accidental tap. Screen readers
 * hear one button, "Slide to Send", and a double-tap sends. With reduced motion the knob returns without a spring.
 */
export function SlideToSend({ theme, label, hint, disabled, busy, onSend, Text }: SlideToSendProps) {
  const x = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);
  const max = Math.max(0, width - KNOB - PAD * 2);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => live && setReduceMotion(!!v)).catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  const state = useRef({ max, disabled: !!(disabled || busy), onSend, reduceMotion });
  state.current = { max, disabled: !!(disabled || busy), onSend, reduceMotion };
  const home = () => {
    if (state.current.reduceMotion) x.setValue(0);
    else Animated.spring(x, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
  };
  useEffect(() => {
    if (!busy) x.setValue(0);
  }, [busy, x]);
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !state.current.disabled,
        onMoveShouldSetPanResponder: (_e, g) => !state.current.disabled && Math.abs(g.dx) > 4,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_e, g) => x.setValue(Math.min(Math.max(0, g.dx), state.current.max)),
        onPanResponderRelease: (_e, g) => {
          if (slideSends(g.dx, state.current.max)) {
            x.setValue(state.current.max);
            state.current.onSend();
          } else home();
        },
        onPanResponderTerminate: () => home(),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [x],
  );
  const off = !!(disabled || busy);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  return (
    <View
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: off, busy: !!busy }}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={(e: { nativeEvent: { actionName: string } }) => {
        if (e.nativeEvent.actionName === 'activate' && !off) onSend();
      }}
      onLayout={onLayout}
      style={{
        height: HEIGHT,
        borderRadius: HEIGHT / 2,
        backgroundColor: theme.field,
        borderWidth: Platform.OS === 'ios' ? 1 : 0,
        borderColor: theme.border,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <Text style={{ color: theme.text, fontSize: 17, fontWeight: '700', marginLeft: KNOB / 2 }} numberOfLines={1}>
        {label}
      </Text>
      <View style={{ position: 'absolute', right: 20 }} importantForAccessibility="no-hide-descendants">
        <Feather name="chevrons-right" size={20} color={theme.muted} />
      </View>
      <Animated.View
        {...pan.panHandlers}
        style={{
          position: 'absolute',
          left: PAD,
          top: PAD,
          width: KNOB,
          height: KNOB,
          borderRadius: KNOB / 2,
          backgroundColor: disabled ? theme.muted : theme.accent,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ translateX: x }],
        }}
      >
        <Feather name={busy ? 'loader' : 'send'} size={22} color={theme.ink} />
      </Animated.View>
    </View>
  );
}
