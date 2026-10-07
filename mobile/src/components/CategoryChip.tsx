import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface CategoryChipProps {
  label: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  isSelected?: boolean;
  onPress: () => void;
  count?: number;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  iconName = 'briefcase-outline',
  isSelected = false,
  onPress,
  count,
}) => {
  return (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={iconName}
        size={15}
        color={isSelected ? COLORS.textInverse : COLORS.primary}
        style={styles.icon}
      />
      <Text style={[styles.label, isSelected && styles.labelSelected]}>
        {label}
      </Text>
      {count !== undefined && (
        <Text style={[styles.count, isSelected && styles.countSelected]}>
          ({count})
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  labelSelected: {
    color: COLORS.textInverse,
  },
  count: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  countSelected: {
    color: '#F3E8FF',
  },
});
