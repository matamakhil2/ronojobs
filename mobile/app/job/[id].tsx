import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { jobsApi } from '../../src/services/api';
import { Job } from '../../src/types';
import { useAuth } from '../../src/context/AuthContext';
import { ApplyModal } from '../../src/components/ApplyModal';
import { StatusBadge } from '../../src/components/StatusBadge';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';

export default function JobDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await jobsApi.getJobById(id);
        if (res.data) {
          setJob(res.data);
          setIsSaved(!!res.data.is_saved);
          setHasApplied(!!res.data.has_applied);
        }
      } catch (err) {
        console.warn('Job fetch fallback:', err);
        // Fallback for preview
        setJob({
          id,
          employer_id: 'emp-1',
          title: 'Senior React Native Developer',
          company_name: 'CloudScale Technologies',
          location: 'San Francisco, CA / Remote',
          category: 'Mobile Development',
          employment_type: 'Remote',
          experience_level: 'Senior',
          salary_min: 130000,
          salary_max: 165000,
          salary_currency: 'USD',
          skills: ['React Native', 'Expo', 'TypeScript', 'Redux', 'iOS & Android'],
          description:
            'We are seeking an experienced React Native developer to spearhead our next-generation mobile client.\n\nKey Responsibilities:\n• Architect cross-platform navigation and offline synchronization.\n• Craft smooth 60fps gesture animations and responsive mobile layouts.\n• Integrate with Node.js REST APIs and PostgreSQL backend services.\n• Maintain test coverage with Jest and Detox.\n\nRequirements:\n• 4+ years of professional mobile software engineering experience.\n• Proficiency with TypeScript and React Native modern hooks architecture.\n• Solid understanding of state management and native bridge modules.',
          company_description:
            'CloudScale Technologies builds next-generation distributed developer infrastructure for top tech teams worldwide.',
          company_website: 'https://cloudscale.example.com',
          status: 'open',
          created_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    const previous = isSaved;
    setIsSaved(!previous);
    try {
      if (previous) {
        await jobsApi.unsaveJob(id);
      } else {
        await jobsApi.saveJob(id);
      }
    } catch {
      setIsSaved(previous);
    }
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    if (hasApplied) {
      Alert.alert('Already Applied', 'You have already submitted an application for this position.');
      return;
    }
    setIsApplyModalVisible(true);
  };

  const handleApplySubmit = async (coverNote: string, resumeUrl: string) => {
    await jobsApi.apply(id, { cover_note: coverNote, resume_url: resumeUrl });
    setHasApplied(true);
    Alert.alert('Application Submitted! 🎉', 'The employer has been notified and will review your profile.');
  };

  const formatSalary = () => {
    if (job?.salary_min && job?.salary_max) {
      return `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()} / year`;
    }
    if (job?.salary_min) {
      return `From $${job.salary_min.toLocaleString()} / year`;
    }
    return 'Competitive compensation';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Job posting not found.</Text>
      </View>
    );
  }

  const isEmployer = user?.role === 'employer';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Header Card */}
        <View style={styles.heroCard}>
          <View style={styles.companyRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>
                {job.company_name ? job.company_name.charAt(0).toUpperCase() : 'J'}
              </Text>
            </View>

            <View style={styles.heroMeta}>
              <Text style={styles.companyName}>{job.company_name}</Text>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.locationText}>{job.location}</Text>
              </View>
            </View>
          </View>

          {/* Badges / Highlights */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="briefcase-outline" size={14} color={COLORS.primary} />
              <Text style={styles.badgeText}>{job.employment_type}</Text>
            </View>

            <View style={styles.badge}>
              <Ionicons name="ribbon-outline" size={14} color={COLORS.purple} />
              <Text style={[styles.badgeText, { color: COLORS.purple }]}>{job.experience_level}</Text>
            </View>

            <View style={styles.badge}>
              <Ionicons name="cash-outline" size={14} color={COLORS.success} />
              <Text style={[styles.badgeText, { color: COLORS.success }]}>{formatSalary()}</Text>
            </View>
          </View>

          {job.application_status && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Your Application Status:</Text>
              <StatusBadge status={job.application_status} />
            </View>
          )}
        </View>

        {/* Required Skills Section */}
        {job.skills && job.skills.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Required Skills</Text>
            <View style={styles.skillsGrid}>
              {job.skills.map((skill, index) => (
                <View key={index} style={styles.skillChip}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Job Description */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.bodyText}>{job.description}</Text>
        </View>

        {/* Company Overview */}
        {job.company_description && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>About {job.company_name}</Text>
            <Text style={styles.bodyText}>{job.company_description}</Text>
            {job.company_website && (
              <Text style={styles.websiteText}>🌐 {job.company_website}</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Actions Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveActionBtn, isSaved && styles.saveActionBtnActive]}
          onPress={handleToggleSave}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={isSaved ? COLORS.textInverse : COLORS.text}
          />
        </TouchableOpacity>

        {hasApplied ? (
          <View style={styles.alreadyAppliedBtn}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.alreadyAppliedText}>Application Submitted</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.applyActionBtn}
            onPress={handleApplyClick}
            activeOpacity={0.88}
          >
            <Text style={styles.applyActionText}>Apply Now</Text>
            <Ionicons name="paper-plane" size={18} color={COLORS.textInverse} />
          </TouchableOpacity>
        )}
      </View>

      {/* Apply Modal */}
      {isApplyModalVisible && (
        <ApplyModal
          visible={isApplyModalVisible}
          job={job}
          candidateResumeUrl={(user?.profile as any)?.resume_url}
          onClose={() => setIsApplyModalVisible(false)}
          onSubmit={handleApplySubmit}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
  },
  scroll: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  companyRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },
  heroMeta: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  skillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  bodyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  websiteText: {
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 10,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    gap: 12,
    ...SHADOWS.md,
  },
  saveActionBtn: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveActionBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  applyActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  applyActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  alreadyAppliedBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: RADIUS.md,
    gap: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  alreadyAppliedText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.success,
  },
});
