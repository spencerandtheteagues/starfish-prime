/**
 * SunnyOrb - 3D Animated Pulsating Orb like ChatGPT Voice Mode
 *
 * A beautiful, organic 3D orb that responds to audio and state changes
 * with fluid animations, glow effects, and particle systems
 */

import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop, G, Ellipse } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SunnyOrbProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
  size?: number;
  audioLevel?: number; // 0-1 audio amplitude for waveform response
}

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

const SunnyOrb: React.FC<SunnyOrbProps> = ({
  state = 'idle',
  size = 200,
  audioLevel = 0,
}) => {
  // Core animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  // Ring animations
  const ring1Anim = useRef(new Animated.Value(0)).current;
  const ring2Anim = useRef(new Animated.Value(0)).current;
  const ring3Anim = useRef(new Animated.Value(0)).current;

  // Particle animations
  const particles = useMemo(() =>
    Array.from({ length: 8 }).map(() => ({
      anim: new Animated.Value(0),
      angle: Math.random() * Math.PI * 2,
      distance: 0.6 + Math.random() * 0.3,
    })), []
  );

  // State-based color schemes
  const colorSchemes = {
    idle: {
      primary: ['#7C3AED', '#A78BFA', '#C4B5FD'],
      glow: '#A78BFA',
      rings: 'rgba(167, 139, 250, 0.3)',
    },
    listening: {
      primary: ['#3B82F6', '#60A5FA', '#93C5FD'],
      glow: '#60A5FA',
      rings: 'rgba(96, 165, 250, 0.4)',
    },
    thinking: {
      primary: ['#F59E0B', '#FBBF24', '#FCD34D'],
      glow: '#FBBF24',
      rings: 'rgba(251, 191, 36, 0.4)',
    },
    speaking: {
      primary: ['#10B981', '#34D399', '#6EE7B7'],
      glow: '#34D399',
      rings: 'rgba(52, 211, 153, 0.4)',
    },
  };

  const colors = colorSchemes[state];

  // Continuous rotation
  useEffect(() => {
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotate.start();
    return () => rotate.stop();
  }, [rotateAnim]);

  // Breathing animation
  useEffect(() => {
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    breathe.start();
    return () => breathe.stop();
  }, [breatheAnim]);

  // State-based pulse animation
  useEffect(() => {
    pulseAnim.stopAnimation();

    let animation: Animated.CompositeAnimation;

    switch (state) {
      case 'listening':
        // Fast, responsive pulse
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 300,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        break;
      case 'thinking':
        // Slow, contemplative pulse
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.08,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 0.95,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        break;
      case 'speaking':
        // Energetic, varying pulse
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 150,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1.12,
              duration: 180,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 200,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        break;
      default: // idle
        // Gentle, calm pulse
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.03,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
    }

    animation.start();
    return () => animation.stop();
  }, [state, pulseAnim]);

  // Glow intensity based on state
  useEffect(() => {
    const targetGlow = {
      idle: 0.5,
      listening: 0.7,
      thinking: 0.6,
      speaking: 0.9,
    };

    Animated.timing(glowAnim, {
      toValue: targetGlow[state],
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [state, glowAnim]);

  // Expanding ring animations
  useEffect(() => {
    const createRingAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = [
      createRingAnimation(ring1Anim, 0),
      createRingAnimation(ring2Anim, 700),
      createRingAnimation(ring3Anim, 1400),
    ];

    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, [ring1Anim, ring2Anim, ring3Anim]);

  // Particle animations
  useEffect(() => {
    const animations = particles.map(particle => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(Math.random() * 2000),
          Animated.timing(particle.anim, {
            toValue: 1,
            duration: 2000 + Math.random() * 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(particle.anim, {
            toValue: 0,
            duration: 2000 + Math.random() * 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    });

    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, [particles]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const innerRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const renderRing = (anim: Animated.Value, index: number) => {
    const scale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2],
    });
    const opacity = anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 0.3, 0],
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: colors.rings,
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
    );
  };

  const renderParticle = (particle: { anim: Animated.Value; angle: number; distance: number }, index: number) => {
    const x = Math.cos(particle.angle) * (size / 2) * particle.distance;
    const y = Math.sin(particle.angle) * (size / 2) * particle.distance;

    const particleOpacity = particle.anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.6, 0],
    });

    const particleScale = particle.anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 1, 0.5],
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.particle,
          {
            backgroundColor: colors.glow,
            transform: [
              { translateX: x },
              { translateY: y },
              { scale: particleScale },
            ],
            opacity: particleOpacity,
          },
        ]}
      />
    );
  };

  return (
    <View style={[styles.container, { width: size * 2, height: size * 2 }]}>
      {/* Expanding Rings */}
      {state !== 'idle' && (
        <>
          {renderRing(ring1Anim, 0)}
          {renderRing(ring2Anim, 1)}
          {renderRing(ring3Anim, 2)}
        </>
      )}

      {/* Outer Glow */}
      <Animated.View
        style={[
          styles.outerGlow,
          {
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: size * 0.75,
            backgroundColor: colors.glow,
            opacity: glowAnim,
            transform: [{ scale: breatheAnim }],
          },
        ]}
      />

      {/* Main Orb Container */}
      <Animated.View
        style={[
          styles.orbContainer,
          {
            width: size,
            height: size,
            transform: [
              { scale: Animated.multiply(pulseAnim, breatheAnim) },
              { rotate: rotation },
            ],
          },
        ]}
      >
        {/* 3D Orb with SVG */}
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="orbGradient" cx="30%" cy="30%" r="70%">
              <Stop offset="0%" stopColor={colors.primary[2]} />
              <Stop offset="50%" stopColor={colors.primary[1]} />
              <Stop offset="100%" stopColor={colors.primary[0]} />
            </RadialGradient>
            <RadialGradient id="highlightGradient" cx="25%" cy="25%" r="40%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Main sphere */}
          <Circle cx="50" cy="50" r="45" fill="url(#orbGradient)" />

          {/* Highlight for 3D effect */}
          <Ellipse cx="35" cy="35" rx="20" ry="15" fill="url(#highlightGradient)" />

          {/* Secondary highlight */}
          <Ellipse cx="65" cy="70" rx="10" ry="8" fill="#FFFFFF" opacity="0.15" />
        </Svg>

        {/* Inner rotating gradient layer */}
        <Animated.View
          style={[
            styles.innerLayer,
            {
              width: size * 0.7,
              height: size * 0.7,
              borderRadius: size * 0.35,
              transform: [{ rotate: innerRotation }],
            },
          ]}
        >
          <LinearGradient
            colors={[colors.primary[1], colors.primary[0], colors.primary[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.innerGradient}
          />
        </Animated.View>
      </Animated.View>

      {/* Floating Particles */}
      <View style={[styles.particlesContainer, { width: size * 2, height: size * 2 }]}>
        {particles.map((particle, index) => renderParticle(particle, index))}
      </View>

      {/* Audio waveform rings when speaking */}
      {state === 'speaking' && (
        <View style={styles.waveformContainer}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.waveformRing,
                {
                  width: size * (1.2 + i * 0.15),
                  height: size * (1.2 + i * 0.15),
                  borderRadius: size * (0.6 + i * 0.075),
                  borderColor: colors.glow,
                  opacity: 0.3 - i * 0.1,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outerGlow: {
    position: 'absolute',
  },
  innerLayer: {
    position: 'absolute',
    overflow: 'hidden',
    opacity: 0.4,
  },
  innerGradient: {
    flex: 1,
    borderRadius: 1000,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
  },
  particlesContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  waveformContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformRing: {
    position: 'absolute',
    borderWidth: 2,
  },
});

export default SunnyOrb;
