import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { jobsApi } from '../../src/services/api';
import { Job } from '../../src/types';
import { JobCard } from '../../src/components/JobCard';
import { CategoryChip } from '../../src/components/CategoryChip';
import { AppLogo } from '../../src/components/AppLogo';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    { id: 'all', label: 'All', icon: 'grid-outline' as const },
    { id: 'mobile', label: 'Mobile Development', icon: 'phone-portrait-outline' as const },
    { id: 'backend', label: 'Backend Engineering', icon: 'server-outline' as const },
    { id: 'devops', label: 'DevOps', icon: 'cloud-outline' as const },
    { id: 'design', label: 'Design', icon: 'color-palette-outline' as const },
  ];

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    try {
      const filters = {
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        q: searchQuery.trim() || undefined,
      };
      const res = await jobsApi.getJobs(filters);
      setJobs(res.data || []);
    } catch (err) {
      console.warn('Backend offline or error fetching jobs, using demo fallback:', err);
      // Fallback demo jobs if backend is not started yet
      setJobs(FALLBACK_JOBS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [fetchJobs])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  // Debounced backend fetch when searching
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) return;

    const timer = setTimeout(async () => {
      try {
        const res = await jobsApi.getJobs({
          q,
          category: selectedCategory === 'All' ? undefined : selectedCategory,
        });
        if (res.data && res.data.length > 0) {
          setJobs((prev) => {
            const existingIds = new Set(prev.map((j) => j.id));
            const newItems = res.data.filter((j: any) => !existingIds.has(j.id));
            return [...prev, ...newItems];
          });
        }
      } catch {
        // Fallback local filtering handles it seamlessly
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  // Live client-side filter for instantaneous 60fps search results
  const filteredJobs = useMemo(() => {
    let list = jobs;
    if (selectedCategory && selectedCategory !== 'All') {
      list = list.filter(
        (j) => j.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((j) => {
        const title = j.title?.toLowerCase() || '';
        const company = j.company_name?.toLowerCase() || '';
        const location = j.location?.toLowerCase() || '';
        const empType = j.employment_type?.toLowerCase() || '';
        const skills = Array.isArray(j.skills) ? j.skills.join(' ').toLowerCase() : '';
        const desc = j.description?.toLowerCase() || '';
        return (
          title.includes(q) ||
          company.includes(q) ||
          location.includes(q) ||
          empType.includes(q) ||
          skills.includes(q) ||
          desc.includes(q)
        );
      });
    }
    return list;
  }, [jobs, selectedCategory, searchQuery]);

  const handleToggleSave = async (jobId: string, currentlySaved?: boolean) => {
    // Optimistic UI update
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, is_saved: !currentlySaved } : j))
    );
    try {
      if (currentlySaved) {
        await jobsApi.unsaveJob(jobId);
      } else {
        await jobsApi.saveJob(jobId);
      }
    } catch (e) {
      console.warn('Save toggle failed:', e);
    }
  };

  const handleSearchSubmit = () => {
    // Search is applied live; if user taps keyboard search action, optionally navigate to dedicated search tab
    if (searchQuery.trim() && filteredJobs.length === 0) {
      router.push({
        pathname: '/(tabs)/search',
        params: { q: searchQuery.trim() },
      });
    }
  };

  const isEmployer = user?.role === 'employer';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Header / Greeting */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <AppLogo size={42} />
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting} numberOfLines={1}>
                {user ? `Hello, ${user.role === 'candidate' ? (user.profile as any)?.full_name || 'Candidate' : (user.profile as any)?.name || 'Employer'}` : 'Welcome to RonoJobs 👋'}
              </Text>
              <Text style={styles.headerTitle} numberOfLines={1}>Find Your Dream Opportunity</Text>
            </View>
          </View>

          {isEmployer && (
            <TouchableOpacity
              style={styles.employerBadge}
              onPress={() => router.push('/employer')}
            >
              <Ionicons name="briefcase" size={16} color={COLORS.primary} />
              <Text style={styles.employerBadgeText}>Employer Panel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar Input */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={searchQuery ? COLORS.primary : COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by job title, skills, keyword..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/search',
                params: searchQuery.trim() ? { q: searchQuery.trim() } : {},
              })
            }
          >
            <Ionicons name="options-outline" size={20} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Active Search Indicator */}
        {searchQuery.trim() ? (
          <View style={styles.searchStatusRow}>
            <Text style={styles.searchStatusText}>
              Found <Text style={{ fontWeight: '700', color: COLORS.primary }}>{filteredJobs.length}</Text> jobs matching "{searchQuery.trim()}"
            </Text>
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Text style={styles.clearSearchLink}>Clear</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Categories Carousel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                label={cat.label}
                iconName={cat.icon}
                isSelected={selectedCategory === cat.label}
                onPress={() => setSelectedCategory(cat.label)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Employer Quick Banner (if employer) */}
        {isEmployer && (
          <View style={styles.employerBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.employerBannerTitle}>Hiring Top Talent?</Text>
              <Text style={styles.employerBannerSubtitle}>
                Create and manage job postings, review applicants and conduct interviews.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.postJobBtn}
              onPress={() => router.push('/employer/post-job')}
            >
              <Ionicons name="add" size={18} color={COLORS.textInverse} />
              <Text style={styles.postJobBtnText}>Post Job</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Featured / Recent Jobs List */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {searchQuery.trim()
                ? `Results for "${searchQuery.trim()}"`
                : selectedCategory === 'All'
                ? 'Featured & Recent Jobs'
                : `${selectedCategory} Jobs`}
            </Text>
            <Text style={styles.jobCountText}>{filteredJobs.length} open</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 32 }} />
          ) : filteredJobs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No matching jobs found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery.trim()
                  ? `No jobs match "${searchQuery.trim()}". Try different keywords or clear your search.`
                  : 'Try changing category or clearing filters'}
              </Text>
              {searchQuery.trim() ? (
                <TouchableOpacity
                  style={styles.clearSearchBtn}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.clearSearchBtnText}>Clear Search</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onPress={() => router.push(`/job/${job.id}`)}
                onSaveToggle={() => handleToggleSave(job.id, job.is_saved)}
                isSaved={job.is_saved}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Fallback demo data if backend is starting up or in demo mode
const FALLBACK_JOBS: Job[] = [
  {
    id: 'f101',
    employer_id: 'e222',
    title: 'Senior React Native Developer',
    description: 'We are seeking an experienced React Native developer to spearhead our next-generation mobile client. You will architect cross-platform navigation, offline synchronization, and smooth 60fps gesture animations.',
    category: 'Mobile Development',
    employment_type: 'Remote',
    location: 'Remote (US/EU)',
    experience_level: 'Senior',
    salary_min: 130000,
    salary_max: 165000,
    salary_currency: 'USD',
    skills: ['React Native', 'Expo', 'TypeScript', 'Redux', 'iOS & Android'],
    status: 'open',
    created_at: new Date().toISOString(),
    company_name: 'CloudScale Technologies',
    company_logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200&auto=format&fit=crop&q=80',
    is_saved: false,
    has_applied: false,
  },
  {
    id: 'f102',
    employer_id: 'e223',
    title: 'Backend Node.js & Database Architect',
    description: 'Build high-throughput transaction processing APIs with Node.js, Express, and PostgreSQL. Design idempotent payment workflows and robust database transactions.',
    category: 'Backend Engineering',
    employment_type: 'Full-time',
    location: 'New York, NY',
    experience_level: 'Senior',
    salary_min: 140000,
    salary_max: 180000,
    salary_currency: 'USD',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'TypeScript'],
    status: 'open',
    created_at: new Date().toISOString(),
    company_name: 'PayPulse Global',
    company_logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&auto=format&fit=crop&q=80',
    is_saved: true,
    has_applied: true,
    application_status: 'Shortlisted',
  },
  {
    id: 'f103',
    employer_id: 'e222',
    title: 'DevOps & Cloud Infrastructure Engineer',
    description: 'Help us maintain our Kubernetes multi-region clusters, automate CI/CD pipelines, and maintain 99.99% system reliability.',
    category: 'DevOps',
    employment_type: 'Full-time',
    location: 'San Francisco, CA',
    experience_level: 'Mid',
    salary_min: 120000,
    salary_max: 150000,
    salary_currency: 'USD',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'PostgreSQL'],
    status: 'open',
    created_at: new Date().toISOString(),
    company_name: 'CloudScale Technologies',
    company_logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200&auto=format&fit=crop&q=80',
    is_saved: false,
    has_applied: false,
  },
  {
    id: 'f104',
    employer_id: 'e223',
    title: 'Product Designer (Design Systems)',
    description: 'Lead the mobile and web experience for PayPulse dashboard and merchant checkout surfaces.',
    category: 'Design',
    employment_type: 'Remote',
    location: 'Remote',
    experience_level: 'Mid',
    salary_min: 105000,
    salary_max: 135000,
    salary_currency: 'USD',
    skills: ['Figma', 'UI/UX', 'Mobile Design', 'Design Systems'],
    status: 'open',
    created_at: new Date().toISOString(),
    company_name: 'PayPulse Global',
    company_logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&auto=format&fit=crop&q=80',
    is_saved: false,
    has_applied: false,
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: 4,
  },
  greeting: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  employerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  employerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: SPACING.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  section: {
    marginBottom: SPACING.md,
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
    marginBottom: SPACING.sm,
  },
  jobCountText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  categoryScroll: {
    paddingVertical: 2,
  },
  employerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purpleLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    gap: 12,
  },
  employerBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.purple,
  },
  employerBannerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  postJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  postJobBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  searchStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchStatusText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  clearSearchLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },
  clearSearchBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  clearSearchBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
