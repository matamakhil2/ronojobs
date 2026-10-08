import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { jobsApi } from '../../src/services/api';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';

export default function PostJobScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Mobile Development');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [experienceLevel, setExperienceLevel] = useState('Mid');
  const [location, setLocation] = useState('Remote (Worldwide)');
  const [salaryMin, setSalaryMin] = useState('110000');
  const [salaryMax, setSalaryMax] = useState('145000');
  const [skillsStr, setSkillsStr] = useState('React Native, TypeScript, Expo, REST APIs');
  const [description, setDescription] = useState(
    'We are looking for a motivated developer to join our product team.\n\nKey Responsibilities:\n• Build features and write maintainable clean code.\n• Collaborate with product managers and designers.\n• Conduct code reviews and ensure testing standard compliance.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Mobile Development',
    'Backend Engineering',
    'Frontend Engineering',
    'DevOps',
    'Design',
    'Product Management',
  ];

  const types = ['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'];
  const levels = ['Entry', 'Mid', 'Senior', 'Lead'];

  const handleSubmit = async () => {
    if (!title || !description || !location) {
      Alert.alert('Missing Fields', 'Please fill in job title, description, and location.');
      return;
    }

    setIsSubmitting(true);
    try {
      const skills = skillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await jobsApi.createJob({
        title: title.trim(),
        category,
        employment_type: employmentType,
        experience_level: experienceLevel,
        location: location.trim(),
        salary_min: parseInt(salaryMin, 10) || null,
        salary_max: parseInt(salaryMax, 10) || null,
        salary_currency: 'USD',
        skills,
        description: description.trim(),
      });

      Alert.alert('Job Published! 🎉', 'Your job posting is now live and accepting candidates.', [
        {
          text: 'View Dashboard',
          onPress: () => router.replace('/employer'),
        },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to post job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Job Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Job Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Lead React Native Engineer"
            placeholderTextColor={COLORS.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Category Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, category === c && styles.chipActive]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Employment Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Employment Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {types.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, employmentType === t && styles.chipActive]}
                onPress={() => setEmploymentType(t)}
              >
                <Text style={[styles.chipText, employmentType === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Experience Level */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Experience Level</Text>
          <View style={styles.chipRow}>
            {levels.map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[styles.chip, experienceLevel === lvl && styles.chipActive]}
                onPress={() => setExperienceLevel(lvl)}
              >
                <Text style={[styles.chipText, experienceLevel === lvl && styles.chipTextActive]}>
                  {lvl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location / Work Mode *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Remote, San Francisco, CA, Hybrid"
            placeholderTextColor={COLORS.textMuted}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Salary Range */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Annual Salary Range (USD)</Text>
          <View style={styles.salaryRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Min (e.g. 100000)"
              placeholderTextColor={COLORS.textMuted}
              value={salaryMin}
              onChangeText={setSalaryMin}
              keyboardType="numeric"
            />
            <Text style={styles.salaryDivider}>to</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Max (e.g. 150000)"
              placeholderTextColor={COLORS.textMuted}
              value={salaryMax}
              onChangeText={setSalaryMax}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Skills */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Required Skills (comma separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="React Native, TypeScript, Node.js"
            placeholderTextColor={COLORS.textMuted}
            value={skillsStr}
            onChangeText={setSkillsStr}
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Job Description & Responsibilities *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.textInverse} size="small" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Publish Job Opportunity</Text>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.textInverse} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
    ...SHADOWS.sm,
  },
  textArea: {
    minHeight: 140,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.card,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.textInverse,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  salaryDivider: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    gap: 8,
    marginTop: SPACING.sm,
    ...SHADOWS.md,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
});
