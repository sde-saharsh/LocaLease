import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/AppContext';
import { FontSize, FontWeight, Spacing, Shadow } from '../constants';

export default function Header({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  rightIcon2,
  onLeftPress,
  onRightPress,
  onRight2Press,
  transparent = false,
  centerTitle = false,
}) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing.sm,
          backgroundColor: transparent ? 'transparent' : colors.background,
        },
        !transparent && Shadow.sm,
      ]}
    >
      <View style={styles.content}>
        {leftIcon ? (
          <TouchableOpacity onPress={onLeftPress} style={styles.iconBtn}>
            <Ionicons name={leftIcon} size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}

        <View style={[styles.titleContainer, centerTitle && { alignItems: 'center' }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          )}
        </View>

        <View style={styles.rightContainer}>
          {rightIcon2 && (
            <TouchableOpacity onPress={onRight2Press} style={styles.iconBtn}>
              <Ionicons name={rightIcon2} size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          {rightIcon ? (
            <TouchableOpacity onPress={onRightPress} style={styles.iconBtn}>
              <Ionicons name={rightIcon} size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconPlaceholder} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 40,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
