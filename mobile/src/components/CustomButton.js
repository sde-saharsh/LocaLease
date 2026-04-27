import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/AppContext';
import { BorderRadius, FontSize, FontWeight, Spacing, Shadow } from '../constants';

export default function CustomButton({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'md', // sm, md, lg
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
  gradient = true,
}) {
  const colors = useTheme();

  const getButtonStyle = () => {
    const base = {
      borderRadius: BorderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    };

    const sizes = {
      sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, minHeight: 36 },
      md: { paddingVertical: Spacing.md + 2, paddingHorizontal: Spacing.xl, minHeight: 48 },
      lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxl, minHeight: 56 },
    };

    const variants = {
      primary: {
        backgroundColor: colors.primary,
      },
      secondary: {
        backgroundColor: colors.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      danger: {
        backgroundColor: colors.error,
      },
    };

    return [base, sizes[size], variants[variant], fullWidth && { width: '100%' }];
  };

  const getTextStyle = () => {
    const sizes = {
      sm: { fontSize: FontSize.sm },
      md: { fontSize: FontSize.lg },
      lg: { fontSize: FontSize.xl },
    };

    const variants = {
      primary: { color: '#FFFFFF' },
      secondary: { color: '#FFFFFF' },
      outline: { color: colors.primary },
      ghost: { color: colors.primary },
      danger: { color: '#FFFFFF' },
    };

    return [
      {
        fontWeight: FontWeight.semibold,
        letterSpacing: 0.3,
      },
      sizes[size],
      variants[variant],
    ];
  };

  const getGradientColors = () => {
    if (!gradient) return null;
    switch (variant) {
      case 'primary':
        return colors.gradient.primary;
      case 'secondary':
        return colors.gradient.secondary;
      case 'danger':
        return ['#EF4444', '#DC2626'];
      default:
        return null;
    }
  };

  const gradientColors = getGradientColors();
  const opacity = disabled || loading ? 0.6 : 1;

  const content = (
    <View style={[styles.contentContainer, { opacity }]}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFF'}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={size === 'sm' ? 16 : 20}
              color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFF'}
              style={{ marginRight: Spacing.sm }}
            />
          )}
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={size === 'sm' ? 16 : 20}
              color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFF'}
              style={{ marginLeft: Spacing.sm }}
            />
          )}
        </>
      )}
    </View>
  );

  if (gradientColors && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[{ borderRadius: BorderRadius.lg, overflow: 'hidden' }, fullWidth && { width: '100%' }, Shadow.md, style]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[...getButtonStyle(), { width: '100%' }]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[...getButtonStyle(), variant !== 'ghost' && Shadow.sm, { opacity }, style]}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
