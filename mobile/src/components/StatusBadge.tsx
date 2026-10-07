import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ApplicationStatus } from '../types';
import { COLORS, RADIUS } from '../constants/theme';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Applied':
        return { bg: COLORS.infoLight, text: COLORS.info, border: '#BAE6FD' };
      case 'Shortlisted':
        return { bg: COLORS.warningLight, text: COLORS.warning, border: '#FED7AA' };
      case 'Interview':
        return { bg: COLORS.purpleLight, text: COLORS.purple, border: '#E9D5FF' };
      case 'Selected':
        return { bg: COLORS.successLight, text: COLORS.success, border: '#A7F3D0' };
      case 'Rejected':
        return { bg: COLORS.dangerLight, text: COLORS.danger, border: '#FECACA' };
      default:
        return { bg: COLORS.surface, text: COLORS.textSecondary, border: COLORS.border };
    }
  };

  const current = getBadgeStyle();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: current.bg,
          borderColor: current.border,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 8 : 12,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: current.text,
            fontSize: isSm ? 11 : 12,
            fontWeight: '600',
          },
        ]}
      >
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    letterSpacing: 0.3,
  },
});
