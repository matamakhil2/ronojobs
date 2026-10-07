import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Job } from '../types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { StatusBadge } from './StatusBadge';

interface JobCardProps {
  job: Job;
  onPress: () => void;
  onSaveToggle?: () => void;
  isSaved?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onPress,
  onSaveToggle,
  isSaved = false,
}) => {
  const formatSalary = () => {
    if (job.salary_min && job.salary_max) {
      return `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`;
    }
    if (job.salary_min) {
      return `From $${(job.salary_min / 1000).toFixed(0)}k`;
    }
    return 'Competitive';
  };

  const companyInitial = job.company_name ? job.company_name.charAt(0).toUpperCase() : 'J';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Header: Company Logo, Title, Bookmark */}
      <View style={styles.header}>
        <View style={styles.companyRow}>
          {job.company_logo ? (
            <Image
              source={{ uri: job.company_logo }}
              style={styles.logo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.logoFallback}>
              <Text style={styles.logoFallbackText}>{companyInitial}</Text>
            </View>
          )}

          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {job.title}
            </Text>
            <Text style={styles.companyName} numberOfLines={1}>
              {job.company_name || 'Verified Employer'}
            </Text>
          </View>
        </View>

        {onSaveToggle && (
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={onSaveToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isSaved || job.is_saved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isSaved || job.is_saved ? COLORS.primary : COLORS.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Tags row: Location, Type, Experience */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {job.location}
          </Text>
        </View>

        <View style={styles.badgePill}>
          <Text style={styles.badgePillText}>{job.employment_type}</Text>
        </View>

        <View style={[styles.badgePill, { backgroundColor: COLORS.surface }]}>
          <Text style={[styles.badgePillText, { color: COLORS.textSecondary }]}>
            {job.experience_level}
          </Text>
        </View>
      </View>

      {/* Skills tags preview */}
      {job.skills && job.skills.length > 0 && (
        <View style={styles.skillsRow}>
          {job.skills.slice(0, 3).map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {job.skills.length > 3 && (
            <Text style={styles.moreSkills}>+{job.skills.length - 3} more</Text>
          )}
        </View>
      )}

      {/* Footer: Salary + Applied Status / Action */}
      <View style={styles.footer}>
        <Text style={styles.salary}>{formatSalary()}</Text>

        {job.has_applied ? (
          <View style={styles.appliedIndicator}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.appliedText}>Applied</Text>
          </View>
        ) : job.application_status ? (
          <StatusBadge status={job.application_status} size="sm" />
        ) : (
          <View style={styles.applyHint}>
            <Text style={styles.applyHintText}>View Details</Text>
            <Ionicons name="arrow-forward" size={13} color={COLORS.primary} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  logoFallback: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFallbackText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  titleContainer: {
    marginLeft: SPACING.sm + 4,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  companyName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  saveBtn: {
    padding: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
    maxWidth: 140,
  },
  badgePill: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.full,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  skillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  skillTag: {
    backgroundColor: COLORS.surface,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  skillText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  moreSkills: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  salary: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  appliedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  appliedText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  applyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  applyHintText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
