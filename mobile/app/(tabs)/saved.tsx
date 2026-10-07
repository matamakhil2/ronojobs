import React, { useState, useEffect, useCallback } from 'react';
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
import { jobsApi } from '../../src/services/api';
import { Job } from '../../src/types';
import { JobCard } from '../../src/components/JobCard';
import { COLORS, RADIUS, SPACING } from '../../src/constants/theme';

export default function SavedJobsScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSaved = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'candidate') {
      setLoading(false);
      return;
    }

    try {
      const res = await jobsApi.getSavedJobs();
      setSavedJobs(res.data || []);
    } catch (e) {
      console.warn('Failed to load saved jobs:', e);
      setSavedJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, user?.role]);

  useFocusEffect(
    useCallback(() => {
      fetchSaved();
    }, [fetchSaved])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSaved();
  };

  const handleUnsave = async (jobId: string) => {
    setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
    try {
      await jobsApi.unsaveJob(jobId);
    } catch (e) {
      console.warn('Unsave error:', e);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPrompt}>
          <Ionicons name="bookmark-outline" size={54} color={COLORS.primary} />
          <Text style={styles.authTitle}>Save Jobs to Track Later</Text>
          <Text style={styles.authSubtitle}>
            Sign in to bookmark your favorite opportunities and review them on any device.
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

  if (user?.role === 'employer') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPrompt}>
          <Ionicons name="add-circle-outline" size={56} color={COLORS.secondary} />
          <Text style={styles.authTitle}>Post a New Job Opening</Text>
          <Text style={styles.authSubtitle}>
            Create new job listings, define role requirements, set compensation packages, and start receiving applications immediately.
          </Text>
          <TouchableOpacity
            style={[styles.signInBtn, { backgroundColor: COLORS.secondary }]}
            onPress={() => router.push('/employer/post-job')}
          >
            <Text style={styles.signInBtnText}>+ Create New Job Listing</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Jobs 📑</Text>
        <Text style={styles.subtitle}>
          {savedJobs.length} bookmarked position{savedJobs.length === 1 ? '' : 's'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : savedJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Saved Jobs Yet</Text>
            <Text style={styles.emptySubtitle}>
              When you find a position you like, tap the bookmark icon on any job card to save it here.
            </Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.browseBtnText}>Explore Jobs</Text>
            </TouchableOpacity>
          </View>
        ) : (
          savedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={true}
              onPress={() => router.push(`/job/${job.id}`)}
              onSaveToggle={() => handleUnsave(job.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
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
