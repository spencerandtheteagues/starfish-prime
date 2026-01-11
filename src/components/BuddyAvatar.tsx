import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G, Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { 
  useAnimatedProps, 
  useSharedValue, 
  withTiming, 
  withRepeat, 
  withSequence,
  Easing,
  interpolate,
  useDerivedValue
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export type BuddyEmotion = 'NEUTRAL' | 'HAPPY' | 'SAD' | 'ANGRY' | 'SMUG' | 'THINKING' | 'SURPRISED';

interface BuddyAvatarProps {
  emotion: BuddyEmotion;
  isSpeaking: boolean;
  isProcessing?: boolean;
  size?: number;
}

/**
 * BuddyAvatar - A high-fidelity, emotional AI face component.
 * Features:
 * - Dynamic brow movement (V-shape, arched, worried, smug-lift)
 * - Expressive eye shapes (Squinting, widening, drooping)
 * - Morphing Lip-Sync (Simulated phonemes during speech)
 * - Fluid transitions between emotions using Reanimated
 */
const BuddyAvatar: React.FC<BuddyAvatarProps> = ({ 
  emotion = 'NEUTRAL', 
  isSpeaking = false, 
  isProcessing = false,
  size = 250 
}) => {
  // --- Shared Values for Animation ---
  const browLeftY = useSharedValue(0);
  const browRightY = useSharedValue(0);
  const browLeftRotate = useSharedValue(0);
  const browRightRotate = useSharedValue(0);
  
  const eyeLidUpper = useSharedValue(0); // 0 (open) to 1 (closed)
  const eyeLidLower = useSharedValue(0); 
  const eyeScaleX = useSharedValue(1);
  const eyeScaleY = useSharedValue(1);

  const mouthOpen = useSharedValue(0); // 0 (closed) to 1 (wide open)
  const mouthWidth = useSharedValue(60);
  const mouthCurve = useSharedValue(0); // -20 (frown) to 20 (smile)
  const mouthSkew = useSharedValue(0); // For smug smirk

  const faceScale = useSharedValue(1);

  // --- Emotion Mapping Logic ---
  useEffect(() => {
    switch (emotion) {
      case 'HAPPY':
        browLeftY.value = withTiming(-5);
        browRightY.value = withTiming(-5);
        browLeftRotate.value = withTiming(-10);
        browRightRotate.value = withTiming(10);
        eyeLidUpper.value = withTiming(0.2);
        eyeLidLower.value = withTiming(0.2);
        mouthCurve.value = withTiming(25);
        mouthWidth.value = withTiming(70);
        mouthSkew.value = withTiming(0);
        break;
      case 'SAD':
        browLeftY.value = withTiming(-2);
        browRightY.value = withTiming(-2);
        browLeftRotate.value = withTiming(15);
        browRightRotate.value = withTiming(-15);
        eyeLidUpper.value = withTiming(0.4);
        eyeLidLower.value = withTiming(0);
        mouthCurve.value = withTiming(-15);
        mouthWidth.value = withTiming(50);
        mouthSkew.value = withTiming(0);
        break;
      case 'ANGRY':
        browLeftY.value = withTiming(5);
        browRightY.value = withTiming(5);
        browLeftRotate.value = withTiming(-20);
        browRightRotate.value = withTiming(20);
        eyeLidUpper.value = withTiming(0.5);
        eyeLidLower.value = withTiming(0.5);
        mouthCurve.value = withTiming(-5);
        mouthWidth.value = withTiming(40);
        mouthSkew.value = withTiming(0);
        break;
      case 'SMUG':
        browLeftY.value = withTiming(-8);
        browRightY.value = withTiming(2);
        browLeftRotate.value = withTiming(-5);
        browRightRotate.value = withTiming(5);
        eyeLidUpper.value = withTiming(0.6);
        eyeLidLower.value = withTiming(0.3);
        mouthCurve.value = withTiming(10);
        mouthWidth.value = withTiming(60);
        mouthSkew.value = withTiming(15); // Smirk to the right
        break;
      case 'THINKING':
        browLeftY.value = withTiming(-3);
        browRightY.value = withTiming(-3);
        browLeftRotate.value = withTiming(0);
        browRightRotate.value = withTiming(0);
        eyeLidUpper.value = withTiming(0.2);
        eyeLidLower.value = withTiming(0.2);
        mouthCurve.value = withTiming(0);
        mouthWidth.value = withTiming(20);
        mouthSkew.value = withTiming(-10);
        break;
      case 'SURPRISED':
        browLeftY.value = withTiming(-15);
        browRightY.value = withTiming(-15);
        browLeftRotate.value = withTiming(0);
        browRightRotate.value = withTiming(0);
        eyeLidUpper.value = withTiming(-0.2);
        eyeLidLower.value = withTiming(-0.2);
        mouthCurve.value = withTiming(0);
        mouthWidth.value = withTiming(40);
        mouthSkew.value = withTiming(0);
        break;
      default: // NEUTRAL
        browLeftY.value = withTiming(0);
        browRightY.value = withTiming(0);
        browLeftRotate.value = withTiming(0);
        browRightRotate.value = withTiming(0);
        eyeLidUpper.value = withTiming(0);
        eyeLidLower.value = withTiming(0);
        mouthCurve.value = withTiming(5);
        mouthWidth.value = withTiming(60);
        mouthSkew.value = withTiming(0);
    }
  }, [emotion]);

  // --- Processing / Idle Breath Animation ---
  useEffect(() => {
    if (isProcessing) {
      faceScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.0, { duration: 800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    } else {
      faceScale.value = withTiming(1);
    }
  }, [isProcessing]);

  // --- Lip Sync Simulation ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeaking) {
      // Fast, random mouth movements to simulate speech
      interval = setInterval(() => {
        mouthOpen.value = withTiming(Math.random() * 0.8 + 0.2, { duration: 100 });
      }, 120);
    } else {
      mouthOpen.value = withTiming(0, { duration: 200 });
    }
    return () => clearInterval(interval);
  }, [isSpeaking]);

  // --- Animated Props for Paths ---
  
  const mouthAnimatedProps = useAnimatedProps(() => {
    // Generate a path string for the mouth based on curve, width, open, and skew
    // M cx-w, cy Q cx+skew, cy+curve cx+w, cy
    // For open mouth, we create a loop
    const cx = 100;
    const cy = 130;
    const w = mouthWidth.value / 2;
    const c = mouthCurve.value;
    const s = mouthSkew.value;
    const o = mouthOpen.value * 25;

    if (mouthOpen.value < 0.1) {
      // Just a line/curve when closed
      return {
        d: `M ${cx - w} ${cy} Q ${cx + s} ${cy + c} ${cx + w} ${cy}`
      };
    } else {
      // An elliptical shape for speaking
      return {
        d: `M ${cx - w} ${cy} 
            Q ${cx + s} ${cy + c + o} ${cx + w} ${cy} 
            Q ${cx + s} ${cy + c - o} ${cx - w} ${cy} Z`
      };
    }
  });

  const leftEyeAnimatedProps = useAnimatedProps(() => ({
    ry: Math.max(1, 12 * (1 - eyeLidUpper.value - eyeLidLower.value)),
    cy: 80 + (eyeLidUpper.value * 5)
  }));

  const rightEyeAnimatedProps = useAnimatedProps(() => ({
    ry: Math.max(1, 12 * (1 - eyeLidUpper.value - eyeLidLower.value)),
    cy: 80 + (eyeLidUpper.value * 5)
  }));

  const leftBrowAnimatedProps = useAnimatedProps(() => {
    const x1 = 55, y1 = 60 + browLeftY.value;
    const x2 = 85, y2 = 60 + browLeftY.value + browLeftRotate.value;
    return { d: `M ${x1} ${y1} L ${x2} ${y2}` };
  });

  const rightBrowAnimatedProps = useAnimatedProps(() => {
    const x1 = 115, y1 = 60 + browRightY.value - browRightRotate.value;
    const x2 = 145, y2 = 60 + browRightY.value;
    return { d: `M ${x1} ${y1} L ${x2} ${y2}` };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg viewBox="0 0 200 200" width={size} height={size}>
        <Defs>
          <RadialGradient id="faceGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#FFF9C4" stopOpacity="1" />
            <Stop offset="100%" stopColor="#FBC02D" stopOpacity="1" />
          </RadialGradient>
        </Defs>

        {/* Main Face Circle */}
        <Circle cx="100" cy="100" r="90" fill="url(#faceGrad)" stroke="#F9A825" strokeWidth="3" />

        {/* Eyes */}
        <G>
          {/* Left Eye */}
          <Animated.View style={{ transform: [{ scale: faceScale }] }}>
             <Circle cx="70" cy="80" r="12" fill="white" opacity={0.3} />
             <Animated.Ellipse 
                cx="70" 
                cy="80" 
                rx="10" 
                animatedProps={leftEyeAnimatedProps}
                fill="#37474F" 
              />
          </Animated.View>

          {/* Right Eye */}
          <Animated.View style={{ transform: [{ scale: faceScale }] }}>
            <Circle cx="130" cy="80" r="12" fill="white" opacity={0.3} />
            <Animated.Ellipse 
                cx="130" 
                cy="80" 
                rx="10" 
                animatedProps={rightEyeAnimatedProps}
                fill="#37474F" 
              />
          </Animated.View>
        </G>

        {/* Brows */}
        <AnimatedPath 
          animatedProps={leftBrowAnimatedProps}
          stroke="#37474F" 
          strokeWidth="6" 
          strokeLinecap="round" 
        />
        <AnimatedPath 
          animatedProps={rightBrowAnimatedProps}
          stroke="#37474F" 
          strokeWidth="6" 
          strokeLinecap="round" 
        />

        {/* Mouth / Lips */}
        <AnimatedPath 
          animatedProps={mouthAnimatedProps}
          fill={isSpeaking ? "#C62828" : "none"}
          stroke="#37474F" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />

        {/* Cheeks (Blush) - Only if Happy */}
        {emotion === 'HAPPY' && (
          <G opacity={0.4}>
            <Circle cx="50" cy="110" r="15" fill="#EF9A9A" />
            <Circle cx="150" cy="110" r="15" fill="#EF9A9A" />
          </G>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BuddyAvatar;
