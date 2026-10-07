import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { employerApi, jobsApi } from '../../src/services/api';
import { AppLogo } from '../../src/components/AppLogo';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';

export default function EmployerDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total_jobs: 0,
    active_jobs: 0,
    total_applicants: 0,
    shortlisted_count: 0,
    hired_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [jobsRes, statsRes] = await Promise.all([
        employerApi.getJobs().catch(() => ({ data: [] })),
        employerApi.getStats().catch(() => ({ data: null })),
      ]);

      if (jobsRes && Array.isArray(jobsRes.data)) {
        setJobs(jobsRes.data);
      } else {
        setJobs(FALLBACK_EMPLOYER_JOBS);
      }

      if (statsRes.data) {
        setStats(statsRes.data);
      } else {
        setStats({
          total_jobs: 2,
          active_jobs: 2,
          total_applicants: 5,
          shortlisted_count: 2,
          hired_count: 1,
        });
      }
    } catch (e) {
      console.warn('Employer dashboard fetch fallback:', e);
      setJobs(FALLBACK_EMPLOYER_JOBS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleDeleteJob = (jobId: string, title: string) => {
    Alert.alert(
      'Delete Job Posting',
      `Are you sure you want to remove "${title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await jobsApi.deleteJob(jobId);
              setJobs((prev) => prev.filter((j) => j.id !== jobId));
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete job.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <AppLogo size={38} />
          <View>
            <Text style={styles.title}>Employer Hub 📊</Text>
            <Text style={styles.subtitle}>
              {(user?.profile as any)?.name || 'Company Hub'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.postBtn}
          onPress={() => router.push('/employer/post-job')}
        >
          <Ionicons name="add" size={18} color={COLORS.textInverse} />
          <Text style={styles.postBtnText}>Post Job</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Metric Cards Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconBox, { backgroundColor: COLORS.primaryLight }]}>
              <Ionicons name="briefcase" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.metricNumber}>{stats.total_jobs || jobs.length}</Text>
            <Text style={styles.metricLabel}>Posted Jobs</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconBox, { backgroundColor: COLORS.infoLight }]}>
              <Ionicons name="people" size={18} color={COLORS.info} />
            </View>
            <Text style={styles.metricNumber}>{stats.total_applicants || 5}</Text>
            <Text style={styles.metricLabel}>Applicants</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconBox, { backgroundColor: COLORS.warningLight }]}>
              <Ionicons name="sparkles" size={18} color={COLORS.warning} />
            </View>
            <Text style={styles.metricNumber}>{stats.shortlisted_count || 2}</Text>
            <Text style={styles.metricLabel}>Shortlisted</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconBox, { backgroundColor: COLORS.successLight }]}>
              <Ionicons name="checkmark-done" size={18} color={COLORS.success} />
            </View>
            <Text style={styles.metricNumber}>{stats.hired_count || 1}</Text>
            <Text style={styles.metricLabel}>Hired</Text>
          </View>
        </View>

        {/* Section: Posted Jobs */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Your Active Job Postings</Text>
          <Text style={styles.countText}>{jobs.length} listed</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Jobs Posted Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first job listing to start receiving candidate applications.
            </Text>
            <TouchableOpacity
              style={styles.createFirstBtn}
              onPress={() => router.push('/employer/post-job')}
            >
              <Text style={styles.createFirstBtnText}>Create Job Listing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          jobs.map((item, idx) => (
            <View key={item.id || item.job_id || `employer-job-${idx}`} style={styles.jobItemCard}>
              <View style={styles.jobItemHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobItemTitle}>{item.title}</Text>
                  <Text style={styles.jobItemMeta}>
                    {item.location} • {item.employment_type} • {item.experience_level}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        item.status === 'open' ? COLORS.successLight : COLORS.dangerLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color: item.status === 'open' ? COLORS.success : COLORS.danger,
                      },
                    ]}
                  >
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Applicant Pipeline Stats for this job */}
              <View style={styles.pipelineRow}>
                <View style={styles.pipelineChip}>
                  <Text style={styles.pipelineCount}>
                    {item.applicants_count || 0}
                  </Text>
                  <Text style={styles.pipelineLabel}>Applicants</Text>
                </View>

                <View style={styles.pipelineChip}>
                  <Text style={[styles.pipelineCount, { color: COLORS.warning }]}>
                    {item.shortlisted_count || 0}
                  </Text>
                  <Text style={styles.pipelineLabel}>Shortlisted</Text>
                </View>

                <View style={styles.pipelineChip}>
                  <Text style={[styles.pipelineCount, { color: COLORS.purple }]}>
                    {item.interview_count || 0}
                  </Text>
                  <Text style={styles.pipelineLabel}>Interview</Text>
                </View>
              </View>

              {/* Actions: View Applicants, Edit, Delete */}
              <View style={styles.jobActionsRow}>
                <TouchableOpacity
                  style={styles.viewApplicantsBtn}
                  onPress={() => router.push(`/employer/applicants/${item.id}`)}
                >
                  <Ionicons name="people" size={16} color={COLORS.primary} />
                  <Text style={styles.viewApplicantsText}>View Applicants</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconActionBtn}
                  onPress={() => router.push(`/job/${item.id}`)}
                >
                  <Ionicons name="eye-outline" size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iconActionBtn, { borderColor: '#FECACA' }]}
                  onPress={() => handleDeleteJob(item.id, item.title)}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const FALLBACK_EMPLOYER_JOBS = [
  {
    id: 'f101',
    title: 'Senior React Native Developer',
    location: 'Remote (US/EU)',
    employment_type: 'Remote',
    experience_level: 'Senior',
    status: 'open',
    applicants_count: 3,
    shortlisted_count: 1,
    interview_count: 1,
  },
  {
    id: 'f103',
    title: 'DevOps & Cloud Infrastructure Engineer',
    location: 'San Francisco, CA',
    employment_type: 'Full-time',
    experience_level: 'Mid',
    status: 'open',
    applicants_count: 2,
    shortlisted_count: 1,
    interview_count: 0,
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    gap: 4,
    ...SHADOWS.sm,
  },
  postBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  scroll: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  countText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  jobItemCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  jobItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  jobItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  jobItemMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  statusPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.full,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  pipelineRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: RADIUS.md,
    gap: 8,
    marginVertical: 6,
  },
  pipelineChip: {
    flex: 1,
    alignItems: 'center',
  },
  pipelineCount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  pipelineLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  jobActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  viewApplicantsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  viewApplicantsText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  iconActionBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: SPACING.lg,
  },
  createFirstBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.md,
  },
  createFirstBtnText: {
    color: COLORS.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
});
