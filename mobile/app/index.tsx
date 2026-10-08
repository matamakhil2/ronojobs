import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { AppLogo } from '../src/components/AppLogo';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../src/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Brand Hero */}
        <View style={styles.heroSection}>
          <View style={styles.logoBadge}>
            <AppLogo size={60} />
          </View>

          <Text style={styles.brandTitle}>
            Rono<Text style={{ color: COLORS.primary }}>Jobs</Text>
          </Text>

          <Text style={styles.heroHeadline}>
            Where Tech Talent Meets World-Class Teams
          </Text>

          <Text style={styles.tagline}>
            Explore thousands of verified engineering, design, and remote roles from top tech employers.
          </Text>

          {/* Clean minimal highlight pills */}
          <View style={styles.pillRow}>
            <View style={styles.pillBadge}>
              <Ionicons name="flash" size={13} color={COLORS.accent} />
              <Text style={styles.pillText}>Fast-Track Hiring</Text>
            </View>
            <View style={styles.pillBadge}>
              <Ionicons name="shield-checkmark" size={13} color={COLORS.secondary} />
              <Text style={styles.pillText}>Verified Companies</Text>
            </View>
            <View style={styles.pillBadge}>
              <Ionicons name="globe-outline" size={13} color={COLORS.primary} />
              <Text style={styles.pillText}>Remote Friendly</Text>
            </View>
          </View>
        </View>

        {/* Prominent Active Jobs & Market Stats Card (User's preferred focal point) */}
        <View style={styles.metricsCard}>
          <View style={styles.metricsHeader}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE MARKETPLACE</Text>
            </View>
            <Text style={styles.metricsHeaderSub}>Updated in real-time</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>10k+</Text>
              <Text style={styles.statLabel}>Active Jobs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.secondary }]}>500+</Text>
              <Text style={styles.statLabel}>Top Companies</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.accent }]}>98%</Text>
              <Text style={styles.statLabel}>Response Rate</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>Sign In / Get Started</Text>
            <View style={styles.arrowCircle}>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.85}
          >
            <Ionicons name="compass-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.secondaryBtnText}>Browse Jobs as Guest</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Free for all job seekers • No credit card required
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -1,
  },
  heroHeadline: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: SPACING.sm,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    paddingHorizontal: SPACING.sm,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.lg,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    gap: 6,
    ...SHADOWS.sm,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  metricsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  metricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.success,
    letterSpacing: 0.5,
  },
  metricsHeaderSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },
  actionsContainer: {
    gap: 10,
    marginTop: 0,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
    ...SHADOWS.md,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textInverse,
    letterSpacing: 0.2,
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  footerNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
