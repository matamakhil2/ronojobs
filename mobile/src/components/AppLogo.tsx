import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, ImageStyle, TextStyle } from 'react-native';
import { COLORS } from '../constants/theme';

interface AppLogoProps {
  size?: number;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 40, style, containerStyle }) => {
  return (
    <View style={containerStyle}>
      <Image
        source={require('../../assets/logo.png')}
        style={[{ width: size, height: size }, style]}
        resizeMode="contain"
      />
    </View>
  );
};

interface AppBrandProps {
  logoSize?: number;
  fontSize?: number;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  subtitle?: string;
}

export const AppBrand: React.FC<AppBrandProps> = ({
  logoSize = 36,
  fontSize = 22,
  containerStyle,
  textStyle,
  subtitle,
}) => {
  return (
    <View style={[styles.brandContainer, containerStyle]}>
      <AppLogo size={logoSize} />
      <View style={styles.textColumn}>
        <Text style={[styles.brandText, { fontSize }, textStyle]}>
          Rono<Text style={{ color: COLORS.primary }}>Jobs</Text>
        </Text>
        {subtitle ? <Text style={styles.brandSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brandText: {
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: -2,
  },
});
