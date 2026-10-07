import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JobFilters } from '../types';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface FilterModalProps {
  visible: boolean;
  filters: JobFilters;
  onClose: () => void;
  onApply: (filters: JobFilters) => void;
  onReset: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  filters,
  onClose,
  onApply,
  onReset,
}) => {
  const [localFilters, setLocalFilters] = useState<JobFilters>(filters);

  const employmentTypes = ['All', 'Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'];
  const experienceLevels = ['All', 'Entry', 'Mid', 'Senior', 'Lead'];
  const categories = [
    'All',
    'Mobile Development',
    'Backend Engineering',
    'Frontend Engineering',
    'DevOps',
    'Design',
    'Product Management',
  ];

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Filter Jobs</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {/* Location Filter */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Location</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Remote, San Francisco, New York"
                      placeholderTextColor={COLORS.textMuted}
                      value={localFilters.location || ''}
                      onChangeText={(val) => setLocalFilters({ ...localFilters, location: val })}
                    />
                  </View>
                </View>

                {/* Employment Type */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Employment Type</Text>
                  <View style={styles.chipGrid}>
                    {employmentTypes.map((type) => {
                      const isSelected =
                        (!localFilters.employment_type && type === 'All') ||
                        localFilters.employment_type === type;
                      return (
                        <TouchableOpacity
                          key={type}
                          style={[styles.chip, isSelected && styles.chipActive]}
                          onPress={() =>
                            setLocalFilters({
                              ...localFilters,
                              employment_type: type === 'All' ? undefined : type,
                            })
                          }
                        >
                          <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                            {type}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Experience Level */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Experience Level</Text>
                  <View style={styles.chipGrid}>
                    {experienceLevels.map((lvl) => {
                      const isSelected =
                        (!localFilters.experience && lvl === 'All') ||
                        localFilters.experience === lvl;
                      return (
                        <TouchableOpacity
                          key={lvl}
                          style={[styles.chip, isSelected && styles.chipActive]}
                          onPress={() =>
                            setLocalFilters({
                              ...localFilters,
                              experience: lvl === 'All' ? undefined : lvl,
                            })
                          }
                        >
                          <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                            {lvl}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Category */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Category</Text>
                  <View style={styles.chipGrid}>
                    {categories.map((cat) => {
                      const isSelected =
                        (!localFilters.category && cat === 'All') ||
                        localFilters.category === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[styles.chip, isSelected && styles.chipActive]}
                          onPress={() =>
                            setLocalFilters({
                              ...localFilters,
                              category: cat === 'All' ? undefined : cat,
                            })
                          }
                        >
                          <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              {/* Bottom Actions */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                  <Text style={styles.resetBtnText}>Reset All</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
                  <Text style={styles.applyBtnText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeBtn: {
    padding: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
  },
  scroll: {
    paddingBottom: SPACING.md,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.textInverse,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
});
