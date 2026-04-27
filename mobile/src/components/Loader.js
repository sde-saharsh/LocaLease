import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../context/AppContext';
import { BorderRadius, Spacing } from '../constants';

function SkeletonItem({ width, height, style }) {
  const colors = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: colors.skeleton,
          borderRadius: BorderRadius.sm,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function CardSkeleton() {
  const colors = useTheme();
  return (
    <View style={[styles.cardSkeleton, { backgroundColor: colors.card }]}>
      <SkeletonItem width="100%" height={200} style={{ borderRadius: 0 }} />
      <View style={styles.cardContent}>
        <SkeletonItem width="80%" height={20} />
        <SkeletonItem width="60%" height={14} style={{ marginTop: 8 }} />
        <View style={styles.cardBottom}>
          <SkeletonItem width={80} height={24} />
          <SkeletonItem width={60} height={20} />
        </View>
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </View>
  );
}

export function Loader({ size = 'md' }) {
  const colors = useTheme();
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.2, duration: 600, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.8, duration: 600, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.5, duration: 600, useNativeDriver: true }),
        ]),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const sizes = { sm: 30, md: 50, lg: 70 };

  return (
    <View style={styles.loaderContainer}>
      <Animated.View
        style={[
          styles.loaderDot,
          {
            width: sizes[size],
            height: sizes[size],
            borderRadius: sizes[size] / 2,
            backgroundColor: colors.primary,
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardSkeleton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  cardContent: {
    padding: Spacing.lg,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  loaderDot: {},
});
