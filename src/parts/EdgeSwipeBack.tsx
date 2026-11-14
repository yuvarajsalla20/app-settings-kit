import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, PanResponder, StyleSheet, useWindowDimensions } from 'react-native';
import { finishesSwipe, isEdgeSwipe, SWIPE_BACK } from '../logic/swipe';

/**
 * Wraps a screen so a swipe from the left edge goes back: the page follows the finger, then slides away or springs back.
 * The Settings screen uses it by default; an app can wrap its own inner screens in it too.
 */
export function EdgeSwipeBack({ onBack, children }: { onBack: () => void; children: ReactNode }) {
  const { width } = useWindowDimensions();
  const [shift] = useState(() => new Animated.Value(0));
  // The latest onBack and width, read when the finger lifts (the responder is made once).
  const latest = useRef({ onBack, width });
  useEffect(() => {
    latest.current = { onBack, width };
  }, [onBack, width]);

  const [responder] = useState(() => {
    const settle = () => Animated.spring(shift, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
    return PanResponder.create({
      // Capture, so a list or text box inside does not take the drag first.
      onMoveShouldSetPanResponderCapture: (_, g) => isEdgeSwipe(g.x0, g.dx, g.dy),
      onPanResponderMove: (_, g) => shift.setValue(Math.max(0, g.dx)),
      onPanResponderRelease: (_, g) => {
        const { onBack: back, width: w } = latest.current;
        if (!finishesSwipe(g.dx, g.vx, w)) return settle();
        Animated.timing(shift, { toValue: w, duration: SWIPE_BACK.slideMs, useNativeDriver: true }).start(() => {
          back();
          // Settings stays on screen when it steps back to its list, so put the page back in place.
          shift.setValue(0);
        });
      },
      onPanResponderTerminate: settle,
      onPanResponderTerminationRequest: () => false,
    });
  });

  return (
    <Animated.View style={[styles.page, { transform: [{ translateX: shift }] }]} {...responder.panHandlers}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({ page: { flex: 1 } });
