import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { Colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashProps {
  onFinish?: () => void;
  children: React.ReactNode;
}

export const AnimatedSplash: React.FC<AnimatedSplashProps> = ({ onFinish, children }) => {
  const [splashFinished, setSplashFinished] = useState(false);

  // Animation values
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Enter animation: Scale up and fade in
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 1000,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Subtle heartbeat pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.08,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 }
      ).start();

      // 3. Exit animation after duration
      setTimeout(() => {
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          setSplashFinished(true);
          if (onFinish) onFinish();
        });
      }, 1600);
    });
  }, []);

  return (
    <View style={styles.root}>
      {children}

      {!splashFinished && (
        <Animated.View
          pointerEvents="none"
          style={[styles.splashContainer, { opacity: containerOpacity }]}
        >
          <StatusBar barStyle="light-content" backgroundColor="#120407" />

          {/* Animated Background Pulse Ring */}
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseScale }],
              },
            ]}
          />

          {/* Center Splash Image */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Image
              source={require('../../assets/splash.png')}
              style={styles.splashImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Subtitle / Brand info */}
          <Animated.View style={[styles.textBlock, { opacity: textOpacity }]}>
            <Text style={styles.brandTitle}>GEO-QR</Text>
            <View style={styles.pillTag}>
              <Text style={styles.pillText}>GEO-FENCED • ANTI-PROXY</Text>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splashContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#120407',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  pulseRing: {
    position: 'absolute',
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
    borderWidth: 2,
    borderColor: 'rgba(255, 198, 168, 0.25)',
    backgroundColor: 'rgba(116, 26, 47, 0.25)',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.skinTone,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  splashImage: {
    width: width * 0.65,
    height: height * 0.45,
  },
  textBlock: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  brandTitle: {
    color: Colors.skinTone,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 8,
  },
  pillTag: {
    backgroundColor: 'rgba(116, 26, 47, 0.6)',
    borderWidth: 1.2,
    borderColor: Colors.skinTone,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  pillText: {
    color: Colors.skinTone,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
});
