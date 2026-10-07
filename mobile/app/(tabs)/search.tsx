import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { jobsApi } from '../../src/services/api';
import { Job, JobFilters } from '../../src/types';
import { JobCard } from '../../src/components/JobCard';
import { FilterModal } from '../../src/components/FilterModal';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';

export default function SearchScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isEmployer = user?.role === 'employer';
  const roleColor = isEmployer ? COLORS.secondary : COLORS.primary;
  const roleLight = isEmployer ? COLORS.secondaryLight : COLORS.primaryLight;

  const searchParams = useLocalSearchParams<{ q?: string }>();

  const [filters, setFilters] = useState<JobFilters>({
    q: searchParams.q || '',
  });
  const [searchInput, setSearchInput] = useState(searchParams.q || '');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Sync when searchParams.q changes from outside (e.g. from Home search bar)
  useEffect(() => {
    if (searchParams.q !== undefined && searchParams.q !== searchInput) {
      setSearchInput(searchParams.q);
      setFilters((prev) => ({ ...prev, q: searchParams.q }));
    }
  }, [searchParams.q]);

  // Live debounced search as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => {
        const trimmed = searchInput.trim();
        if (prev.q === trimmed) return prev;
        return { ...prev, q: trimmed };
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchFilteredJobs = useCallback(async (currentFilters: JobFilters) => {
    setLoading(true);
    try {
      const res = await jobsApi.getJobs(currentFilters);
      setJobs(res.data || []);
    } catch (e) {
      console.warn('Search query error:', e);
      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Update immediately when filters change
  useEffect(() => {
    fetchFilteredJobs(filters);
  }, [filters, fetchFilteredJobs]);

  useFocusEffect(
    useCallback(() => {
      fetchFilteredJobs(filters);
    }, [fetchFilteredJobs, filters])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchFilteredJobs(filters);
  };

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
    setFilters((prev) => ({ ...prev, q: searchInput.trim() }));
  };

  const handleRemoveFilter = (key: keyof JobFilters) => {
    setFilters((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const activeFiltersCount = Object.keys(filters).filter(
    (k) => k !== 'q' && filters[k as keyof JobFilters]
  ).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore & Search Jobs</Text>
        <Text style={styles.headerSubtitle}>
          Filter by title, skills, experience, location, and type
        </Text>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search title, skills (e.g. React Native)..."
            placeholderTextColor={COLORS.textMuted}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchInput ? (
            <TouchableOpacity onPress={() => { setSearchInput(''); setFilters((p) => ({ ...p, q: '' })); }}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFiltersCount > 0 && { backgroundColor: roleColor, borderColor: roleColor },
          ]}
          onPress={() => setIsFilterModalOpen(true)}
        >
          <Ionicons
            name="funnel-outline"
            size={18}
            color={activeFiltersCount > 0 ? COLORS.textInverse : roleColor}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active Filter Chips */}
      {(filters.location || filters.employment_type || filters.experience || filters.category) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeFiltersRow}
        >
          {filters.location && (
            <View style={[styles.activeChip, { borderColor: roleColor }]}>
              <Text style={styles.activeChipText}>📍 {filters.location}</Text>
              <TouchableOpacity onPress={() => handleRemoveFilter('location')}>
                <Ionicons name="close" size={14} color={roleColor} />
              </TouchableOpacity>
            </View>
          )}

          {filters.employment_type && (
            <View style={[styles.activeChip, { borderColor: roleColor }]}>
              <Text style={styles.activeChipText}>💼 {filters.employment_type}</Text>
              <TouchableOpacity onPress={() => handleRemoveFilter('employment_type')}>
                <Ionicons name="close" size={14} color={roleColor} />
              </TouchableOpacity>
            </View>
          )}

          {filters.experience && (
            <View style={[styles.activeChip, { borderColor: roleColor }]}>
              <Text style={styles.activeChipText}>🎯 {filters.experience}</Text>
              <TouchableOpacity onPress={() => handleRemoveFilter('experience')}>
                <Ionicons name="close" size={14} color={roleColor} />
              </TouchableOpacity>
            </View>
          )}

          {filters.category && (
            <View style={[styles.activeChip, { borderColor: roleColor }]}>
              <Text style={styles.activeChipText}>📂 {filters.category}</Text>
              <TouchableOpacity onPress={() => handleRemoveFilter('category')}>
                <Ionicons name="close" size={14} color={roleColor} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Results Header */}
      <View style={styles.resultsMeta}>
        <Text style={styles.resultsCount}>
          {loading ? 'Searching jobs...' : `${jobs.length} position${jobs.length === 1 ? '' : 's'} matching`}
        </Text>
      </View>

      {/* Job list */}
      <ScrollView
        contentContainerStyle={styles.resultsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={roleColor} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={roleColor} style={{ marginTop: 40 }} />
        ) : jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Matching Positions</Text>
            <Text style={styles.emptySubtitle}>
              Try broadening your keywords or resetting your filter criteria.
            </Text>
            <TouchableOpacity
              style={styles.resetSearchBtn}
              onPress={() => {
                setFilters({});
                setSearchInput('');
              }}
            >
              <Text style={[styles.resetSearchBtnText, { color: roleColor }]}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onPress={() => router.push(`/job/${job.id}`)}
              onSaveToggle={isEmployer ? undefined : () => handleToggleSave(job.id, job.is_saved)}
              isSaved={isEmployer ? false : job.is_saved}
            />
          ))
        )}
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={isFilterModalOpen}
        filters={filters}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
        onReset={() => setFilters({ q: searchInput })}
      />
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    gap: 10,
    marginBottom: SPACING.sm,
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
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...SHADOWS.sm,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.full,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  activeFiltersRow: {
    paddingHorizontal: SPACING.md,
    gap: 8,
    paddingVertical: 4,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  activeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  resultsMeta: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginTop: 4,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  resultsList: {
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
    paddingHorizontal: SPACING.lg,
  },
  resetSearchBtn: {
    marginTop: SPACING.md,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  resetSearchBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
});
