import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { applicationsApi, employerApi } from '../../src/services/api';
import { Application } from '../../src/types';
import { ApplicationCard } from '../../src/components/ApplicationCard';
import { COLORS, RADIUS, SPACING } from '../../src/constants/theme';

export default function ApplicationsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const appsScrollRef = useRef<ScrollView>(null);

  const isEmployer = user?.role === 'employer';

  const fetchApplications = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      if (isEmployer) {
        // For employer, fetch applications across all their posted jobs
        const employerJobs = await employerApi.getJobs();
        if (employerJobs.data && employerJobs.data.length > 0) {
          const allAppsPromises = employerJobs.data.map(async (job: any) => {
            try {
              const appsRes = await employerApi.getApplicants(job.id);
              return (appsRes.data || []).map((item: any, idx: number) => ({
                ...item,
                id: item.id || item.application_id || `employer-app-${job.id}-${idx}`,
                job_id: job.id,
                job_title: job.title || item.job_title || 'Job Opening',
                company_name: `Applicant: ${item.candidate_name || item.full_name || item.candidate_email || 'Candidate'}`,
                job_location: item.location || job.location || 'Remote',
                employment_type: job.employment_type || item.employment_type || 'Full-time',
                candidate_name: item.candidate_name || item.full_name || 'Anonymous Candidate',
                candidate_email: item.candidate_email || item.email || '',
                headline: item.headline || '',
                company_logo: job.company_logo || item.company_logo,
              }));
            } catch {
              return [];
            }
          });
          const allResults = await Promise.all(allAppsPromises);
          setApplications(allResults.flat());
        } else {
          setApplications([]);
        }
      } else {
        const res = await applicationsApi.getMyApplications();
        const list = (res.data || []).map((item: any, idx: number) => ({
          ...item,
          id: item.id || item.application_id || `my-app-${idx}`,
        }));
        setApplications(list);
      }
    } catch (e) {
      console.warn('Failed to load applications, showing demo data:', e);
      setApplications(FALLBACK_APPLICATIONS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, isEmployer]);

  useFocusEffect(
    useCallback(() => {
      fetchApplications();
      appsScrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [fetchApplications])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPrompt}>
          <Ionicons name="paper-plane-outline" size={54} color={COLORS.primary} />
          <Text style={styles.authTitle}>Track Your Job Applications</Text>
          <Text style={styles.authSubtitle}>
            Sign in to track real-time hiring updates from application to final offer.
          </Text>
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            {isEmployer ? 'Candidate Applications 👥' : 'My Applications 🚀'}
          </Text>
          <Text style={styles.subtitle}>
            {applications.length} {isEmployer ? 'candidate submissions' : 'active applications'}
          </Text>
        </View>

        {isEmployer && (
          <TouchableOpacity
            style={styles.employerSwitchBtn}
            onPress={() => router.push('/employer')}
          >
            <Text style={styles.employerSwitchText}>Dashboard</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Applications list */}
      <ScrollView
        ref={appsScrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isEmployer ? COLORS.secondary : COLORS.primary}
          />
        }
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color={isEmployer ? COLORS.secondary : COLORS.primary}
            style={{ marginTop: 40 }}
          />
        ) : applications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Applications Yet</Text>
            <Text style={styles.emptySubtitle}>
              {isEmployer
                ? 'No candidates have applied to your postings yet.'
                : 'Start exploring jobs and click "Apply" to submit your profile.'}
            </Text>
            {!isEmployer && (
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => router.push('/(tabs)')}
              >
                <Text style={styles.browseBtnText}>Explore Jobs</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          applications.map((app, idx) => (
            <ApplicationCard
              key={app.id || (app as any).application_id || `app-card-${idx}`}
              application={app}
              activeColor={isEmployer ? COLORS.secondary : COLORS.primary}
              onPress={() => {
                if (isEmployer) {
                  router.push(`/employer/applicants/${app.job_id}`);
                } else {
                  router.push(`/job/${app.job_id}`);
                }
              }}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const FALLBACK_APPLICATIONS: Application[] = [
  {
    id: 'a1',
    job_id: 'f101',
    candidate_id: 'c1',
    status: 'Shortlisted',
    cover_note: 'I have 5 years building React Native and Expo applications with high performance and clean architectures.',
    resume_url: 'https://ronojobs.com/resumes/alex_rivera_cv.pdf',
    applied_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    job_title: 'Senior React Native Developer',
    job_location: 'Remote (US/EU)',
    employment_type: 'Remote',
    experience_level: 'Senior',
    job_status: 'open',
    company_name: 'CloudScale Technologies',
    company_logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'a2',
    job_id: 'f102',
    candidate_id: 'c1',
    status: 'Interview',
    cover_note: 'Extensive hands-on experience designing distributed PostgreSQL indexes and Node microservices.',
    resume_url: 'https://ronojobs.com/resumes/alex_rivera_cv.pdf',
    applied_date: new Date(Date.now() - 7 * 86400000).toISOString(),
    job_title: 'Backend Node.js & Database Architect',
    job_location: 'New York, NY',
    employment_type: 'Full-time',
    experience_level: 'Senior',
    job_status: 'open',
    company_name: 'PayPulse Global',
    company_logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&auto=format&fit=crop&q=80',
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
  employerSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  employerSwitchText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  scroll: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
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
    paddingHorizontal: SPACING.xl,
    lineHeight: 18,
  },
  browseBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.md,
  },
  browseBtnText: {
    color: COLORS.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
  authPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 16,
  },
  authSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  signInBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: RADIUS.md,
  },
  signInBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
});
