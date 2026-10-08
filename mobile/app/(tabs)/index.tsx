import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { jobsApi, employerApi } from '../../src/services/api';
import { Job, CandidateProfile } from '../../src/types';
import { JobCard } from '../../src/components/JobCard';
import { CategoryChip } from '../../src/components/CategoryChip';
import { AppLogo } from '../../src/components/AppLogo';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const { user } = useAuth();
  const isEmployer = user?.role === 'employer';
  const isCandidateLoggedIn = !!user && !isEmployer;

  const sliderRef = useRef<ScrollView>(null);
  const [sliderScrollX, setSliderScrollX] = useState(0);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Employer specific state
  const [employerTab, setEmployerTab] = useState<'my_jobs' | 'market'>('my_jobs');
  const [employerJobs, setEmployerJobs] = useState<any[]>(FALLBACK_EMPLOYER_JOBS);
  const [employerStats, setEmployerStats] = useState<any>({
    total_jobs: 2,
    active_jobs: 2,
    total_applicants: 5,
    shortlisted_count: 2,
  });

  const categories = [
    { id: 'all', label: 'All', icon: 'grid-outline' as const },
    { id: 'mobile', label: 'Mobile Development', icon: 'phone-portrait-outline' as const },
    { id: 'backend', label: 'Backend Engineering', icon: 'server-outline' as const },
    { id: 'devops', label: 'DevOps', icon: 'cloud-outline' as const },
    { id: 'design', label: 'Design', icon: 'color-palette-outline' as const },
  ];

  // Fetch candidate/market jobs
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
      setJobs(FALLBACK_JOBS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  // Fetch employer postings and pipeline stats
  const fetchEmployerData = useCallback(async () => {
    if (!isEmployer) return;
    try {
      const [jobsRes, statsRes] = await Promise.all([
        employerApi.getJobs().catch(() => ({ data: [] })),
        employerApi.getStats().catch(() => ({ data: null })),
      ]);
      if (jobsRes?.data && Array.isArray(jobsRes.data) && jobsRes.data.length > 0) {
        setEmployerJobs(jobsRes.data);
      } else {
        setEmployerJobs(FALLBACK_EMPLOYER_JOBS);
      }
      if (statsRes?.data) {
        setEmployerStats(statsRes.data);
      }
    } catch {
      setEmployerJobs(FALLBACK_EMPLOYER_JOBS);
    }
  }, [isEmployer]);

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
      if (isEmployer) {
        fetchEmployerData();
      }
    }, [fetchJobs, fetchEmployerData, isEmployer])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
    if (isEmployer) {
      fetchEmployerData();
    }
  };

  // Debounced backend fetch when searching in market
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || (isEmployer && employerTab === 'my_jobs')) return;

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
  }, [searchQuery, selectedCategory, isEmployer, employerTab]);

  // Live client-side filter for market jobs
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

  // Filter for employer's own posted jobs
  const filteredEmployerJobs = useMemo(() => {
    let list = employerJobs;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((j) => {
        const title = j.title?.toLowerCase() || '';
        const loc = j.location?.toLowerCase() || '';
        const empType = j.employment_type?.toLowerCase() || '';
        const expLevel = j.experience_level?.toLowerCase() || '';
        return title.includes(q) || loc.includes(q) || empType.includes(q) || expLevel.includes(q);
      });
    }
    return list;
  }, [employerJobs, searchQuery]);

  // Responsive card width and scroll step for Section 1 Slider
  const sliderCardWidth = useMemo(() => {
    if (windowWidth >= 1024) return 360;
    if (windowWidth >= 768) return 330;
    return Math.min(320, windowWidth * 0.82);
  }, [windowWidth]);

  const sliderStep = sliderCardWidth + 12;

  const handleSlideLeft = () => {
    const targetX = Math.max(0, sliderScrollX - sliderStep);
    sliderRef.current?.scrollTo({ x: targetX, animated: true });
  };

  const handleSlideRight = () => {
    const targetX = sliderScrollX + sliderStep;
    sliderRef.current?.scrollTo({ x: targetX, animated: true });
  };

  // SECTION 1: "Jobs You Might Like" (Horizontal Slider)
  const sliderJobs = useMemo(() => {
    if (!isCandidateLoggedIn || jobs.length === 0) return [];

    const candidateProfile = user?.profile as CandidateProfile | undefined;
    const candidateSkills = (candidateProfile?.skills || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
    const candidateHeadline = candidateProfile?.headline?.toLowerCase().trim() || '';

    // Prioritize jobs by simple matching or top positions
    const sorted = [...jobs].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      if (candidateSkills.length > 0) {
        if (Array.isArray(a.skills)) {
          scoreA += a.skills.filter((s) => candidateSkills.some((cs) => s.toLowerCase().includes(cs))).length;
        }
        if (Array.isArray(b.skills)) {
          scoreB += b.skills.filter((s) => candidateSkills.some((cs) => s.toLowerCase().includes(cs))).length;
        }
      }
      if (candidateHeadline) {
        if (a.title && candidateHeadline.includes(a.title.toLowerCase())) scoreA += 2;
        if (b.title && candidateHeadline.includes(b.title.toLowerCase())) scoreB += 2;
      }
      return scoreB - scoreA;
    });

    return sorted.slice(0, 6);
  }, [jobs, isCandidateLoggedIn, user]);

  // SECTION 2: "Jobs Related to Your Profile" (Preserved existing vertical list logic)
  const jobsRelatedToProfile = useMemo(() => {
    if (!isCandidateLoggedIn || jobs.length === 0) return [];

    const candidateProfile = user?.profile as CandidateProfile | undefined;
    const candidateSkills = (candidateProfile?.skills || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
    const candidateHeadline = candidateProfile?.headline?.toLowerCase().trim() || '';
    const candidateLocation = candidateProfile?.location?.toLowerCase().trim() || '';

    if (candidateSkills.length > 0 || candidateHeadline || candidateLocation) {
      const matched = jobs.filter((job) => {
        // 1. Skill overlap
        if (Array.isArray(job.skills) && candidateSkills.length > 0) {
          const hasSkill = job.skills.some((js) => {
            const lowerJs = js.toLowerCase();
            return candidateSkills.some((cs) => lowerJs.includes(cs) || cs.includes(lowerJs));
          });
          if (hasSkill) return true;
        }

        // 2. Role / title match with candidate headline
        if (candidateHeadline) {
          const title = job.title?.toLowerCase() || '';
          const category = job.category?.toLowerCase() || '';
          const headlineWords = candidateHeadline.split(/\s+/).filter((w) => w.length > 3);
          const hasTitleMatch = headlineWords.some((w) => title.includes(w));
          if (hasTitleMatch || (category && candidateHeadline.includes(category))) {
            return true;
          }
        }

        // 3. Location match (or Remote)
        if (candidateLocation && job.location) {
          const jobLoc = job.location.toLowerCase();
          if (jobLoc.includes(candidateLocation) || candidateLocation.includes(jobLoc)) {
            return true;
          }
        }

        return false;
      });

      if (matched.length > 0) {
        return matched.slice(0, 3);
      }
    }

    // Fallback: select a reasonable subset from existing jobs
    return jobs.slice(0, 3);
  }, [jobs, isCandidateLoggedIn, user]);

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
    if (searchQuery.trim() && filteredJobs.length === 0 && (!isEmployer || employerTab === 'market')) {
      router.push({
        pathname: '/(tabs)/search',
        params: { q: searchQuery.trim() },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isEmployer ? COLORS.secondary : COLORS.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Header / Greeting */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <AppLogo size={42} />
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting} numberOfLines={1}>
                {user ? (
                  isEmployer
                    ? `Welcome back, ${(user.profile as any)?.name || (user as any)?.companyName || (user.email ? user.email.split('@')[0] : 'Employer')} 🏢`
                    : `Hello, ${(user.profile as any)?.full_name || (user as any)?.fullName || (user as any)?.name || (user.email ? user.email.split('@')[0] : 'Candidate')} 👋`
                ) : (
                  'Welcome to RonoJobs 👋'
                )}
              </Text>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {isEmployer ? 'Recruiter & Hiring Hub' : 'Find Your Dream Opportunity'}
              </Text>
            </View>
          </View>

          {isEmployer ? (
            <TouchableOpacity
              style={styles.headerPostBtn}
              onPress={() => router.push('/employer/post-job')}
            >
              <Ionicons name="add" size={16} color={COLORS.textInverse} />
              <Text style={styles.headerPostBtnText}>Post Job</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Employer Segmented Tab Switcher */}
        {isEmployer && (
          <View style={styles.employerSegmentRow}>
            <TouchableOpacity
              style={[
                styles.employerSegmentBtn,
                employerTab === 'my_jobs' && styles.employerSegmentBtnActive,
              ]}
              onPress={() => setEmployerTab('my_jobs')}
            >
              <Ionicons
                name="briefcase"
                size={16}
                color={employerTab === 'my_jobs' ? COLORS.secondary : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.employerSegmentText,
                  employerTab === 'my_jobs' && styles.employerSegmentTextActive,
                ]}
              >
                My Posted Jobs ({employerJobs.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.employerSegmentBtn,
                employerTab === 'market' && styles.employerSegmentBtnActive,
              ]}
              onPress={() => setEmployerTab('market')}
            >
              <Ionicons
                name="globe-outline"
                size={16}
                color={employerTab === 'market' ? COLORS.secondary : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.employerSegmentText,
                  employerTab === 'market' && styles.employerSegmentTextActive,
                ]}
              >
                Market Overview
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ===== EMPLOYER "MY POSTED JOBS" VIEW ===== */}
        {isEmployer && employerTab === 'my_jobs' ? (
          <View>
            {/* Quick Metrics Bar */}
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {employerStats?.active_jobs ?? employerJobs.length}
                </Text>
                <Text style={styles.metricLabel}>Active Listings</Text>
              </View>
              <View style={[styles.metricCard, { borderColor: '#DEF7EC' }]}>
                <Text style={[styles.metricValue, { color: COLORS.secondary }]}>
                  {employerStats?.total_applicants ?? 5}
                </Text>
                <Text style={styles.metricLabel}>Total Applicants</Text>
              </View>
              <View style={[styles.metricCard, { borderColor: '#DEF7EC' }]}>
                <Text style={[styles.metricValue, { color: COLORS.secondary }]}>
                  {employerStats?.shortlisted_count ?? 2}
                </Text>
                <Text style={styles.metricLabel}>Shortlisted</Text>
              </View>
            </View>

            {/* Search Bar for Employer Jobs */}
            <View style={styles.searchSection}>
              <View style={styles.searchBar}>
                <Ionicons
                  name="search"
                  size={20}
                  color={searchQuery ? COLORS.secondary : COLORS.textSecondary}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Filter your posted jobs by title, location..."
                  placeholderTextColor={COLORS.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
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
            </View>

            {/* Employer Hub Card Box */}
            <TouchableOpacity
              style={styles.employerHubCard}
              onPress={() => router.push('/employer')}
              activeOpacity={0.88}
            >
              <View style={styles.employerHubIconContainer}>
                <Ionicons name="bar-chart" size={22} color={COLORS.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.employerHubTitle}>Employer Hub</Text>
                  <View style={styles.employerHubBadge}>
                    <Text style={styles.employerHubBadgeText}>Full Panel</Text>
                  </View>
                </View>
                <Text style={styles.employerHubSubtitle}>
                  Track candidate applicants, review analytics, and manage hiring workflows.
                </Text>
              </View>
              <View style={styles.employerHubLinkBtn}>
                <Text style={styles.employerHubLinkText}>Hub</Text>
                <Ionicons name="arrow-forward" size={14} color={COLORS.textInverse} />
              </View>
            </TouchableOpacity>

            {/* Employer Postings Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  {searchQuery.trim()
                    ? `Results for "${searchQuery.trim()}"`
                    : 'Your Job Postings & Pipeline'}
                </Text>
                <TouchableOpacity onPress={() => router.push('/employer')}>
                  <Text style={styles.viewAllLink}>Full Panel →</Text>
                </TouchableOpacity>
              </View>

              {filteredEmployerJobs.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="briefcase-outline" size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyTitle}>No job listings found</Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery.trim()
                      ? `No postings match "${searchQuery.trim()}".`
                      : 'You have not posted any jobs yet. Create your first opening today!'}
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyCtaBtn}
                    onPress={() => router.push('/employer/post-job')}
                  >
                    <Ionicons name="add-circle-outline" size={18} color={COLORS.textInverse} />
                    <Text style={styles.emptyCtaBtnText}>Post a New Job</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                filteredEmployerJobs.map((item) => (
                  <View key={item.id} style={styles.employerJobCard}>
                    <View style={styles.employerJobHeader}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.employerJobTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.employerJobMeta}>
                          {item.location || 'Remote'} • {item.employment_type || 'Full-time'}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              (item.status || 'open') === 'open'
                                ? COLORS.secondaryLight
                                : COLORS.surface,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            {
                              color:
                                (item.status || 'open') === 'open'
                                ? COLORS.secondary
                                : COLORS.textMuted,
                            },
                          ]}
                        >
                          {(item.status || 'open').toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {/* Applicant Pipeline Stats Bar */}
                    <View style={styles.pipelineBar}>
                      <View style={styles.pipelineStat}>
                        <Ionicons name="people-outline" size={15} color={COLORS.secondary} />
                        <Text style={styles.pipelineStatText}>
                          <Text style={{ fontWeight: '700', color: COLORS.text }}>
                            {item.applicants_count ?? 3}
                          </Text>{' '}
                          Applicants
                        </Text>
                      </View>
                      <View style={styles.pipelineStat}>
                        <Ionicons name="star-outline" size={15} color={COLORS.accent} />
                        <Text style={styles.pipelineStatText}>
                          <Text style={{ fontWeight: '700', color: COLORS.text }}>
                            {item.shortlisted_count ?? 1}
                          </Text>{' '}
                          Shortlisted
                        </Text>
                      </View>
                    </View>

                    {/* Card Actions */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        style={styles.viewApplicantsBtn}
                        onPress={() => router.push(`/employer/applicants/${item.id}`)}
                      >
                        <Ionicons name="people" size={16} color={COLORS.secondary} />
                        <Text style={styles.viewApplicantsBtnText}>View Applicants</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.previewBtn}
                        onPress={() => router.push(`/job/${item.id}`)}
                      >
                        <Ionicons name="eye-outline" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.previewBtnText}>Job Details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        ) : (
          /* ===== CANDIDATE OR EMPLOYER MARKET OVERVIEW ===== */
          <View>
            {/* Search Bar Input */}
            <View style={styles.searchSection}>
              <View style={styles.searchBar}>
                <Ionicons
                  name="search"
                  size={20}
                  color={searchQuery ? COLORS.primary : COLORS.textSecondary}
                />
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
                  Found{' '}
                  <Text style={{ fontWeight: '700', color: COLORS.primary }}>
                    {filteredJobs.length}
                  </Text>{' '}
                  jobs matching "{searchQuery.trim()}"
                </Text>
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
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

            {/* SECTION 1: Jobs You Might Like (Horizontal Slider) */}
            {isCandidateLoggedIn && !searchQuery.trim() && sliderJobs.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.sectionTitle}>Jobs You Might Like ✨</Text>
                    <Text style={styles.sectionSubtitle}>
                      Explore handpicked opportunities tailored for you
                    </Text>
                  </View>
                  <View style={styles.sliderControls}>
                    <TouchableOpacity
                      style={[
                        styles.sliderNavBtn,
                        sliderScrollX <= 5 && styles.sliderNavBtnDisabled,
                      ]}
                      onPress={handleSlideLeft}
                      disabled={sliderScrollX <= 5}
                      accessibilityLabel="Previous jobs"
                    >
                      <Ionicons
                        name="chevron-back"
                        size={18}
                        color={sliderScrollX <= 5 ? COLORS.textMuted : COLORS.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.sliderNavBtn}
                      onPress={handleSlideRight}
                      accessibilityLabel="Next jobs"
                    >
                      <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView
                  ref={sliderRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.sliderContent}
                  snapToInterval={sliderStep}
                  decelerationRate="fast"
                  onScroll={(e) => setSliderScrollX(e.nativeEvent.contentOffset.x)}
                  scrollEventThrottle={16}
                >
                  {sliderJobs.map((job) => (
                    <View
                      key={`slider-${job.id}`}
                      style={{ width: sliderCardWidth, marginRight: 12 }}
                    >
                      <JobCard
                        job={job}
                        onPress={() => router.push(`/job/${job.id}`)}
                        onSaveToggle={() => handleToggleSave(job.id, job.is_saved)}
                        isSaved={job.is_saved}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* SECTION 2: Jobs Related to Your Profile (Preserved layout, renamed) */}
            {isCandidateLoggedIn && !searchQuery.trim() && jobsRelatedToProfile.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>Jobs Related to Your Profile</Text>
                    <Text style={styles.sectionSubtitle}>
                      Curated roles based on your profile & skills
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
                    <Text style={styles.viewAllLink}>View All</Text>
                  </TouchableOpacity>
                </View>

                {jobsRelatedToProfile.map((job) => (
                  <JobCard
                    key={`profile-rel-${job.id}`}
                    job={job}
                    onPress={() => router.push(`/job/${job.id}`)}
                    onSaveToggle={() => handleToggleSave(job.id, job.is_saved)}
                    isSaved={job.is_saved}
                  />
                ))}
              </View>
            )}

            {/* Featured / Recent Jobs List */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  {searchQuery.trim()
                    ? `Results for "${searchQuery.trim()}"`
                    : selectedCategory === 'All'
                    ? isEmployer
                      ? 'All Market Postings (Recruiter View)'
                      : 'Featured & Recent Jobs'
                    : `${selectedCategory} Jobs`}
                </Text>
                <Text style={styles.jobCountText}>{filteredJobs.length} open</Text>
              </View>

              {loading ? (
                <ActivityIndicator
                  size="large"
                  color={COLORS.primary}
                  style={{ marginVertical: 32 }}
                />
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
                    onSaveToggle={
                      isEmployer ? undefined : () => handleToggleSave(job.id, job.is_saved)
                    }
                    isSaved={isEmployer ? false : job.is_saved}
                  />
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Fallback employer data for demo or offline mode
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

// Fallback market jobs data
const FALLBACK_JOBS: Job[] = [
  {
    id: 'f101',
    employer_id: 'e222',
    title: 'Senior React Native Developer',
    description:
      'We are seeking an experienced React Native developer to spearhead our next-generation mobile client. You will architect cross-platform navigation, offline synchronization, and smooth 60fps gesture animations.',
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
    company_logo:
      'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200&auto=format&fit=crop&q=80',
    is_saved: false,
    has_applied: false,
  },
  {
    id: 'f102',
    employer_id: 'e223',
    title: 'Backend Node.js & Database Architect',
    description:
      'Build high-throughput transaction processing APIs with Node.js, Express, and PostgreSQL. Design idempotent payment workflows and robust database transactions.',
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
    company_logo:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&auto=format&fit=crop&q=80',
    is_saved: true,
    has_applied: true,
    application_status: 'Shortlisted',
  },
  {
    id: 'f103',
    employer_id: 'e222',
    title: 'DevOps & Cloud Infrastructure Engineer',
    description:
      'Help us maintain our Kubernetes multi-region clusters, automate CI/CD pipelines, and maintain 99.99% system reliability.',
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
    company_logo:
      'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200&auto=format&fit=crop&q=80',
    is_saved: false,
    has_applied: false,
  },
  {
    id: 'f104',
    employer_id: 'e223',
    title: 'Product Designer (Design Systems)',
    description:
      'Lead the mobile and web experience for PayPulse dashboard and merchant checkout surfaces.',
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
    company_logo:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&auto=format&fit=crop&q=80',
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
  headerPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    gap: 4,
    ...SHADOWS.sm,
  },
  headerPostBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  employerSegmentRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.md,
    gap: 4,
  },
  employerSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  employerSegmentBtnActive: {
    backgroundColor: COLORS.card,
    ...SHADOWS.sm,
  },
  employerSegmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  employerSegmentTextActive: {
    color: COLORS.secondary,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
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
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sliderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  sliderNavBtnDisabled: {
    opacity: 0.45,
    backgroundColor: COLORS.surface,
  },
  sliderContent: {
    paddingVertical: 4,
    paddingRight: SPACING.xs,
  },
  jobCountText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  viewAllLink: {
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  categoryScroll: {
    paddingVertical: 6,
  },
  employerHubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: 12,
    ...SHADOWS.sm,
  },
  employerHubIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  employerHubTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  employerHubBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  employerHubBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  employerHubSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  employerHubLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  employerHubLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
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
  },
  emptyCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  emptyCtaBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  employerJobCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  employerJobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  employerJobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  employerJobMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pipelineBar: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginVertical: 8,
    gap: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pipelineStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pipelineStatText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  viewApplicantsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondaryLight,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  viewApplicantsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  previewBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
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
