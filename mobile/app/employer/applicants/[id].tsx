import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { employerApi, applicationsApi } from '../../../src/services/api';
import { Application, ApplicationStatus } from '../../../src/types';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../../src/constants/theme';

export default function ApplicantsScreen() {
  const router = useRouter();
  const { id: jobId } = useLocalSearchParams<{ id: string }>();

  const [applicants, setApplicants] = useState<Application[]>([]);
  const [jobTitle, setJobTitle] = useState('Job Applicants');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchApplicants = useCallback(async () => {
    try {
      const res = await employerApi.getApplicants(jobId);
      const list = (res.data || []).map((item: any, idx: number) => ({
        ...item,
        id: item.id || item.application_id || `app-${idx}`,
        candidate_name: item.candidate_name || item.full_name || 'Anonymous Candidate',
        candidate_experience: item.candidate_experience || item.experience_years || 0,
        applied_date: item.applied_date || item.applied_at || new Date().toISOString(),
      }));
      setApplicants(list);
      if (res.job?.title) {
        setJobTitle(res.job.title);
      }
    } catch (e) {
      console.warn('Failed to fetch applicants, using fallback demo:', e);
      setApplicants(FALLBACK_APPLICANTS);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useFocusEffect(
    useCallback(() => {
      fetchApplicants();
    }, [fetchApplicants])
  );

  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    setUpdatingId(appId);
    try {
      await applicationsApi.updateStatus(appId, newStatus);
      setApplicants((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      Alert.alert('Status Updated', `Candidate moved to "${newStatus}".`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update application status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusOptions: ApplicationStatus[] = [
    'Applied',
    'Shortlisted',
    'Interview',
    'Selected',
    'Rejected',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {jobTitle}
          </Text>
          <Text style={styles.headerSubtitle}>
            {applicants.length} Candidate Applicant{applicants.length === 1 ? '' : 's'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.secondary} style={{ marginTop: 40 }} />
        ) : applicants.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={54} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Applicants Yet</Text>
            <Text style={styles.emptySubtitle}>
              Applications from qualified candidates will appear here as soon as they submit.
            </Text>
          </View>
        ) : (
          applicants.map((app, idx) => {
            const appId = app.id || (app as any).application_id || `applicant-${idx}`;
            return (
              <View key={appId} style={styles.applicantCard}>
                {/* Top Row: Candidate Name, Headline, Current Status */}
                <View style={styles.topRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(app.candidate_name || 'C').charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.candidateMeta}>
                    <Text style={styles.candidateName}>{app.candidate_name || 'Anonymous Candidate'}</Text>
                    <Text style={styles.candidateHeadline}>{app.headline || 'Full Stack Engineer'}</Text>
                    <Text style={styles.candidateSub}>
                      {app.candidate_email} • {app.candidate_experience || 5} yrs exp
                    </Text>
                  </View>

                  <StatusBadge status={app.status} size="sm" />
                </View>

                {/* Skills badges */}
                {app.candidate_skills && app.candidate_skills.length > 0 && (
                  <View style={styles.skillsRow}>
                    {app.candidate_skills.map((s: string, skillIdx: number) => (
                      <View key={`skill-${skillIdx}`} style={styles.skillTag}>
                        <Text style={styles.skillTagText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Cover note */}
                {app.cover_note && (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteLabel}>Cover Note:</Text>
                    <Text style={styles.noteText}>"{app.cover_note}"</Text>
                  </View>
                )}

                {/* Resume button */}
                {app.resume_url && (
                  <TouchableOpacity
                    style={styles.resumeBtn}
                    onPress={() => Linking.openURL(app.resume_url!).catch(() => Alert.alert('Resume', app.resume_url))}
                  >
                    <Ionicons name="document-attach-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.resumeBtnText}>View Attached Resume / CV</Text>
                    <Ionicons name="open-outline" size={14} color={COLORS.primary} />
                  </TouchableOpacity>
                )}

                {/* Update Status Actions */}
                <View style={styles.statusUpdateSection}>
                  <Text style={styles.statusUpdateLabel}>Move Candidate in Hiring Pipeline:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusButtonsRow}>
                    {statusOptions.map((st) => {
                      const isCurrent = app.status === st;
                      return (
                        <TouchableOpacity
                          key={st}
                          style={[
                            styles.statusChangeBtn,
                            isCurrent && styles.statusChangeBtnActive,
                          ]}
                          onPress={() => handleUpdateStatus(appId, st)}
                          disabled={updatingId === appId}
                        >
                          <Text
                            style={[
                              styles.statusChangeText,
                              isCurrent && styles.statusChangeTextActive,
                            ]}
                          >
                            {st}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const FALLBACK_APPLICANTS: any[] = [
  {
    id: 'app-1',
    job_id: 'f101',
    candidate_name: 'Alex Rivera',
    candidate_email: 'alex.dev@gmail.com',
    headline: 'Senior Full Stack & Mobile Engineer',
    candidate_experience: 5,
    candidate_skills: ['React Native', 'TypeScript', 'Node.js', 'PostgreSQL'],
    status: 'Shortlisted',
    cover_note: 'I have 5 years building React Native and Expo applications with high performance and clean architectures.',
    resume_url: 'https://ronojobs.com/resumes/alex_rivera_cv.pdf',
    applied_date: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'app-2',
    job_id: 'f101',
    candidate_name: 'Sarah Chen',
    candidate_email: 'sarah.ux@gmail.com',
    headline: 'Lead Product & UI/UX Designer',
    candidate_experience: 4,
    candidate_skills: ['Figma', 'UI/UX', 'Design Systems', 'Mobile'],
    status: 'Applied',
    cover_note: 'Excited about shaping the mobile user interface and high fidelity animations.',
    resume_url: 'https://ronojobs.com/resumes/sarah_chen_cv.pdf',
    applied_date: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scroll: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  applicantCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  candidateMeta: {
    marginLeft: 12,
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  candidateHeadline: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
    marginTop: 1,
  },
  candidateSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 8,
  },
  skillTag: {
    backgroundColor: COLORS.surface,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  skillTagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  noteBox: {
    backgroundColor: COLORS.surface,
    padding: 10,
    borderRadius: RADIUS.md,
    marginVertical: 6,
  },
  noteLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryLight,
    padding: 10,
    borderRadius: RADIUS.md,
    gap: 8,
    marginVertical: 6,
  },
  resumeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
    flex: 1,
  },
  statusUpdateSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  statusUpdateLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statusChangeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  statusChangeBtnActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  statusChangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  statusChangeTextActive: {
    color: COLORS.textInverse,
    fontWeight: '700',
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
});
