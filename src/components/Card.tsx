import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'bridal' | 'dark' | 'skinTone';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'dark' }) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'bridal':
        return Colors.bridal;
      case 'skinTone':
        return Colors.skinTone;
      case 'dark':
      default:
        return Colors.card;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'bridal':
        return Colors.skinTone;
      case 'skinTone':
        return Colors.bridal;
      case 'dark':
      default:
        return Colors.cardBorder;
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
});
