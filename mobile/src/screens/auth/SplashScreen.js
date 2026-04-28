import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const { isAuthenticated, role } = useApp();
  const useNativeDriver = Platform.OS !== 'web';
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(30)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textTranslate, {
          toValue: 0,
          duration: 500,
          useNativeDriver,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver,
        }),
      ]),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        const target = role === 'admin' ? 'AdminTabs' : role === 'lender' ? 'LenderTabs' : 'UserTabs';
        navigation.reset({ index: 0, routes: [{ name: target }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, role, navigation]);

  return (
    <LinearGradient colors={['#4F46E5', '#312E81']} style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <Ionicons name="cube-outline" size={48} color="#4F46E5" />
          </View>
        </Animated.View>

        <Animated.Text
          style={[
            styles.title,
            {
              transform: [{ translateY: textTranslate }],
              opacity: textOpacity,
            },
          ]}
        >
          LocaLease
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          Rent Anything, Anywhere
        </Animated.Text>
      </View>

      <View style={styles.bottomDots}>
        {[0, 1, 2].map((i) => (
          <LoadingDot key={i} delay={i * 200} />
        ))}
      </View>
    </LinearGradient>
  );
}

function LoadingDot({ delay }) {
  const useNativeDriver = Platform.OS !== 'web';
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver }),
          Animated.timing(opacity, { toValue: 0.3, duration: 500, useNativeDriver }),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[styles.dot, { opacity }]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    letterSpacing: 1,
  },
  bottomDots: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});
