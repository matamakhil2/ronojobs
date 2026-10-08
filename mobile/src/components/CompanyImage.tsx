import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View } from 'react-native';
import { RADIUS } from '../constants/theme';

interface CompanyImageProps {
  uri?: string | null;
  companyName?: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
  containerStyle?: any;
  borderRadius?: number;
}

// Curated high-resolution professional company logos
const BRAND_COMPANY_LOGOS: Record<string, string> = {
  'ronojobs': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
  'cloudscale technologies': 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200&auto=format&fit=crop&q=80',
  'paypulse global': 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&auto=format&fit=crop&q=80',
  'google': 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80',
  'microsoft': 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=200&auto=format&fit=crop&q=80',
  'apple': 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&auto=format&fit=crop&q=80',
  'meta': 'https://images.unsplash.com/photo-1633675254053-d96c7668c3b8?w=200&auto=format&fit=crop&q=80',
  'stripe': 'https://images.unsplash.com/photo-1556742049-0a67e557224f?w=200&auto=format&fit=crop&q=80',
  'techcorp': 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200&auto=format&fit=crop&q=80',
};

const DEFAULT_COMPANY_IMAGE =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=80'; // Modern architectural tech corporate headquarters

export const getCompanyImageUri = (uri?: string | null, companyName?: string): string => {
  if (uri && typeof uri === 'string' && uri.trim().length > 0 && uri.startsWith('http')) {
    return uri.trim();
  }

  if (companyName) {
    const key = companyName.trim().toLowerCase();
    if (BRAND_COMPANY_LOGOS[key]) {
      return BRAND_COMPANY_LOGOS[key];
    }
  }

  return DEFAULT_COMPANY_IMAGE;
};

export const CompanyImage: React.FC<CompanyImageProps> = ({
  uri,
  companyName,
  size = 44,
  style,
  containerStyle,
  borderRadius = RADIUS.md,
}) => {
  const [loadFailed, setLoadFailed] = useState(false);

  const initialResolved = getCompanyImageUri(uri, companyName);
  const imageSource = loadFailed ? { uri: DEFAULT_COMPANY_IMAGE } : { uri: initialResolved };

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius,
        },
        containerStyle,
      ]}
    >
      <Image
        source={imageSource}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius,
          },
          style,
        ]}
        resizeMode="cover"
        onError={() => {
          if (!loadFailed) {
            setLoadFailed(true);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    backgroundColor: '#F1F5F9',
  },
});
