import React, { useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

interface Props {
  onSwipe?: () => void;
  label?: string;
}

const SWIPE_THRESHOLD = 0.6; // 60% of width

export const SwipeCheckIn: React.FC<Props> = ({ onSwipe, label }) => {
  const { t } = useTranslation();
  const computedLabel = label ?? t('swipe_to_check_in');
  const [width, setWidth] = useState(1);
  const translateX = useRef(new Animated.Value(0)).current;

  const onGestureEvent = Animated.event<PanGestureHandlerGestureEvent>(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true },
  );

  const handleStateChange = useCallback(
    ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
      if (nativeEvent.state === State.END) {
        const dragged = nativeEvent.translationX / width;
        if (dragged > SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onSwipe?.());
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      }
    },
    [onSwipe, width, translateX],
  );

  return (
    <View
      style={styles.container}
      onLayout={e => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityRole="button"
      accessibilityLabel={computedLabel}
    >
      <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={handleStateChange}>
        <Animated.View style={[styles.slider, { transform: [{ translateX }] }]}>
          <Text style={styles.text}>{computedLabel}</Text>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eee',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  slider: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#2196f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SwipeCheckIn;
