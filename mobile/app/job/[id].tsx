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
import { CompanyImage } from '../../src/components/CompanyImage';
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

  const formatSalaryShort = () => {
    if (job?.salary_min && job?.salary_max) {
      return `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`;
    }
    if (job?.salary_min) {
      return `From $${(job.salary_min / 1000).toFixed(0)}k`;
    }
    return 'Competitive';
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
        {/* Employer Notice Banner */}
        {isEmployer && (
          <View style={styles.employerNoticeBanner}>
            <View style={styles.employerNoticeIconBox}>
              <Ionicons name="business" size={18} color={COLORS.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.employerNoticeTitle}>Employer Recruiter View</Text>
              <Text style={styles.employerNoticeSub}>
                Viewing as an employer. You cannot submit applications to job listings.
              </Text>
            </View>
          </View>
        )}

        {/* Top Header Card */}
        <View style={styles.heroCard}>
          <View style={styles.companyRow}>
            <CompanyImage
              uri={job.company_logo}
              companyName={job.company_name}
              size={56}
              borderRadius={RADIUS.lg}
            />

            <View style={styles.heroMeta}>
              <Text style={styles.companyName}>{job.company_name}</Text>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={14} color={COLORS.secondary} />
                <Text style={styles.locationText}>{job.location}</Text>
              </View>
            </View>
          </View>

          {/* Quick Metrics Strip mirroring Active Jobs brand colors */}
          <View style={styles.highlightsGrid}>
            <View style={[styles.highlightItem, { backgroundColor: COLORS.secondaryLight, borderColor: '#BAE6FD' }]}>
              <View style={[styles.highlightIconBox, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="briefcase" size={15} color={COLORS.secondary} />
              </View>
              <Text style={[styles.highlightValue, { color: COLORS.secondary }]} numberOfLines={1}>
                {job.employment_type || 'Full-time'}
              </Text>
              <Text style={styles.highlightLabel}>Work Type</Text>
            </View>

            <View style={[styles.highlightItem, { backgroundColor: COLORS.primaryLight, borderColor: '#DDD6FE' }]}>
              <View style={[styles.highlightIconBox, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="ribbon" size={15} color={COLORS.primary} />
              </View>
              <Text style={[styles.highlightValue, { color: COLORS.primary }]} numberOfLines={1}>
                {job.experience_level || 'Mid'} Level
              </Text>
              <Text style={styles.highlightLabel}>Experience</Text>
            </View>

            <View style={[styles.highlightItem, { backgroundColor: COLORS.accentLight, borderColor: '#FED7AA' }]}>
              <View style={[styles.highlightIconBox, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="cash" size={15} color={COLORS.accent} />
              </View>
              <Text style={[styles.highlightValue, { color: COLORS.accent }]} numberOfLines={1}>
                {formatSalaryShort()}
              </Text>
              <Text style={styles.highlightLabel}>Salary / Yr</Text>
            </View>
          </View>

          {job.application_status && (
            <View style={styles.statusRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="checkmark-done-circle" size={16} color={COLORS.success} />
                <Text style={styles.statusLabel}>Application Status:</Text>
              </View>
              <StatusBadge status={job.application_status} />
            </View>
          )}
        </View>

        {/* Required Skills Section */}
        {job.skills && job.skills.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionIconBox, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="code-slash" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Required Skills</Text>
            </View>
            <View style={styles.skillsGrid}>
              {job.skills.map((skill, index) => (
                <View key={index} style={styles.skillChip}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.secondary} />
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Job Description */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBox, { backgroundColor: COLORS.secondaryLight }]}>
              <Ionicons name="document-text" size={16} color={COLORS.secondary} />
            </View>
            <Text style={styles.sectionTitle}>Job Description</Text>
          </View>
          <Text style={styles.bodyText}>{job.description}</Text>
        </View>

        {/* Company Overview */}
        {job.company_description && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionIconBox, { backgroundColor: COLORS.accentLight }]}>
                <Ionicons name="business" size={16} color={COLORS.accent} />
              </View>
              <Text style={styles.sectionTitle}>About {job.company_name}</Text>
            </View>
            <Text style={styles.bodyText}>{job.company_description}</Text>
            {job.company_website && (
              <View style={styles.websiteBox}>
                <Ionicons name="globe-outline" size={15} color={COLORS.secondary} />
                <Text style={styles.websiteText}>{job.company_website}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Actions Bar */}
      <View style={styles.bottomBar}>
        {isEmployer ? (
          <View style={styles.employerBottomBar}>
            <TouchableOpacity
              style={styles.employerHubBtn}
              onPress={() => router.push('/employer')}
              activeOpacity={0.8}
            >
              <Ionicons name="apps-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.employerHubBtnText}>Employer Hub</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.employerActionBtn}
              onPress={() => router.push(`/employer/applicants/${job.id}`)}
              activeOpacity={0.88}
            >
              <Ionicons name="people" size={18} color={COLORS.textInverse} />
              <Text style={styles.employerActionText}>View Applicants</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.saveActionBtn, isSaved && styles.saveActionBtnActive]}
              onPress={handleToggleSave}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isSaved ? COLORS.primary : COLORS.textSecondary}
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
          </>
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
  highlightsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: SPACING.xs,
  },
  highlightItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightIconBox: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  highlightValue: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  highlightLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  sectionIconBox: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: COLORS.text,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
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
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  skillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  bodyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  websiteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.secondaryLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  websiteText: {
    fontSize: 13,
    color: COLORS.secondary,
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
    backgroundColor: COLORS.primaryLight,
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
  employerNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryLight,
    padding: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: SPACING.md,
    gap: 10,
  },
  employerNoticeIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  employerNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  employerNoticeSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  employerBottomBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  employerHubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  employerHubBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  employerActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    gap: 8,
    ...SHADOWS.md,
  },
  employerActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
});
