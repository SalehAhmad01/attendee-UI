import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../theme/colors';

interface BadgeProps {
  label: string;
  value?: string;
  variant?: 'skin' | 'bridal' | 'neutral' | 'success' | 'error';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  value,
  variant = 'skin',
  style,
  textStyle,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'bridal':
        return {
          bg: Colors.bridal,
          border: Colors.skinTone,
          text: Colors.skinTone,
        };
      case 'success':
        return {
          bg: Colors.successBg,
          border: Colors.success,
          text: Colors.success,
        };
      case 'error':
        return {
          bg: Colors.errorBg,
          border: Colors.error,
          text: Colors.error,
        };
      case 'neutral':
        return {
          bg: 'rgba(255, 255, 255, 0.08)',
          border: 'rgba(255, 255, 255, 0.2)',
          text: Colors.textPrimary,
        };
      case 'skin':
      default:
        return {
          bg: Colors.pillBg,
          border: Colors.skinTone,
          text: Colors.skinTone,
        };
    }
  };

  const c = getColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: c.bg, borderColor: c.border },
        style,
      ]}
    >
      <Text style={[styles.labelText, { color: c.text }, textStyle]}>
        {label}
        {value ? ` → ${value}` : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.2,
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
