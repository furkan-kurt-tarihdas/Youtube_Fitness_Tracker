import { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withDelay,
  withSequence,
} from 'react-native-reanimated';

export function useMascotAnimation() {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(150);
  const translateY = useSharedValue(200);
  const rotate = useSharedValue(20);

  const mascotStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ]
  }));

  const triggerAnimation = () => {
    opacity.value = withSequence(
      withSpring(1),
      withDelay(2500, withTiming(0, { duration: 500 }))
    );
    translateX.value = withSequence(
      withSpring(-20),
      withDelay(2500, withTiming(150, { duration: 500 }))
    );
    translateY.value = withSequence(
      withSpring(-20),
      withDelay(2500, withTiming(200, { duration: 500 }))
    );
    rotate.value = withSequence(
      withSpring(-5),
      withDelay(2500, withTiming(20, { duration: 500 }))
    );
  };

  return {
    mascotStyle,
    triggerAnimation
  };
}
