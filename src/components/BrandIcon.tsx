import React from 'react';
import { Image, StyleSheet, View, ViewStyle, ImageStyle } from 'react-native';

interface BrandIconProps {
  size?: number;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
}

export const BrandIcon: React.FC<BrandIconProps> = ({
  size = 40,
  style,
  imageStyle,
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={require('../../assets/icon.png')}
        style={[
          styles.image,
          { width: size, height: size },
          imageStyle,
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    // Transparent icon
  },
});
