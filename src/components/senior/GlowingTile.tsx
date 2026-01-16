/**
 * GlowingTile - Stunning, hi-tech tile with glow effects and animations
 *
 * Features:
 * - Animated glow on press
 * - Gradient backgrounds
 * - Soft shadows with depth
 * - Pulsing animations for important items
 * - Glass morphism effects
 */

import React, { useCallback, useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SeniorColors } from '../../design/colors';
import {
  TouchTargets,
  HapticFeedback,
  createAccessibilityProps,
  scaledFontSize,
} from '../../design/accessibility';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GlowingTileProps {
  title: string;
  icon: string;
  gradientColors: string[];
  iconColor: string;
  onPress: () => void;
  badge?: number;
  isPulsing?: boolean;
  disabled?: boolean;
  fontScale?: number;
  accessibilityHint?: string;
  testID?: string;
}

const GlowingTile: React.FC<GlowingTileProps> = ({
  title,
  icon,
  gradientColors,
  iconColor,
  onPress,
  badge,
  isPulsing = false,
  disabled = false,
  fontScale = 1.2,
  accessibilityHint,
  testID,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  // Pulsing animation for important tiles
  useEffect(() => {
    if (isPulsing) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isPulsing, pulseAnim]);

  // Shine animation across the tile
  useEffect(() => {
    const shine = Animated.loop(
      Animated.sequence([
        Animated.delay(3000),
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    shine.start();
    return () => shine.stop();
  }, [shineAnim]);

  const handlePressIn = useCallback(() => {
    HapticFeedback.light();
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, glowAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 5,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, glowAnim]);

  const handlePress = useCallback(() => {
    if (!disabled) {
      HapticFeedback.medium();
      onPress();
    }
  }, [disabled, onPress]);

  const accessibilityLabel = badge
    ? `${title}. ${badge} new notification${badge > 1 ? 's' : ''}.`
    : title;

  const accessibilityProps = createAccessibilityProps(accessibilityLabel, 'button', {
    hint: accessibilityHint,
    disabled,
  });

  // Animated glow color
  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.3)'],
  });

  // Animated shadow
  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.35],
  });

  // Shine position
  const shinePosition = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, SCREEN_WIDTH],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) },
          ],
          shadowOpacity,
        },
      ]}
    >
      <TouchableOpacity
        {...accessibilityProps}
        style={styles.touchable}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        testID={testID}
      >
        {/* Gradient Background */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Glow Overlay */}
          <Animated.View
            style={[
              styles.glowOverlay,
              { backgroundColor: glowColor },
            ]}
          />

          {/* Shine Effect */}
          <Animated.View
            style={[
              styles.shineOverlay,
              { transform: [{ translateX: shinePosition }] },
            ]}
          />

          {/* Pattern Overlay */}
          <View style={styles.patternOverlay}>
            {/* Subtle dot pattern */}
            {Array.from({ length: 8 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.patternDot,
                  {
                    top: 20 + (i % 4) * 40,
                    left: 20 + Math.floor(i / 4) * 60,
                    opacity: 0.1,
                  },
                ]}
              />
            ))}
          </View>

          {/* Badge */}
          {badge !== undefined && badge > 0 && (
            <View style={styles.badgeContainer}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.badge}
              >
                <Text style={styles.badgeText}>
                  {badge > 99 ? '99+' : badge}
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            {/* Icon with soft glow */}
            <View style={styles.iconContainer}>
              <View style={[styles.iconGlow, { backgroundColor: iconColor }]} />
              <Icon name={icon} size={68} color={iconColor} />
            </View>

            {/* Title */}
            <Text
              style={[
                styles.title,
                {
                  fontSize: scaledFontSize(28, fontScale),
                  color: iconColor,
                },
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {title}
            </Text>
          </View>

          {/* Bottom highlight bar */}
          <View style={[styles.bottomBar, { backgroundColor: iconColor }]} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  touchable: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    height: 180,
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ skewX: '-20deg' }],
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  patternDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  badge: {
    borderRadius: 18,
    minWidth: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  iconGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: -40,
    marginLeft: -40,
    opacity: 0.15,
  },
  title: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    opacity: 0.6,
  },
});

export default GlowingTile;
