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
        <View style={styles.heroContent}>
          <View style={styles.logoBadge}>
            <AppLogo size={56} />
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
        </View>

        {/* Value Proposition Cards (Reflecting the 3 brand logo colors: Purple, Orange, Blue) */}
        <View style={styles.valueSection}>
          <View style={styles.valueCard}>
            <View style={[styles.valueIconBox, { backgroundColor: COLORS.primaryLight }]}>
              <Ionicons name="briefcase" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.valueTextBox}>
              <Text style={styles.valueTitle}>Vetted Tech Opportunities</Text>
              <Text style={styles.valueDesc}>
                Direct roles from innovative startups and global tech leaders.
              </Text>
            </View>
          </View>

          <View style={styles.valueCard}>
            <View style={[styles.valueIconBox, { backgroundColor: COLORS.warningLight }]}>
              <Ionicons name="flash" size={20} color={COLORS.accent} />
            </View>
            <View style={styles.valueTextBox}>
              <Text style={styles.valueTitle}>Real-Time Status Tracking</Text>
              <Text style={styles.valueDesc}>
                Never wonder about your application status with live hiring stages.
              </Text>
            </View>
          </View>

          <View style={styles.valueCard}>
            <View style={[styles.valueIconBox, { backgroundColor: COLORS.secondaryLight }]}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.secondary} />
            </View>
            <View style={styles.valueTextBox}>
              <Text style={styles.valueTitle}>Direct Hiring Pipeline</Text>
              <Text style={styles.valueDesc}>
                Connect directly with verified hiring managers and founders.
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Platform Metrics */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>10k+</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Top Companies</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>98%</Text>
            <Text style={styles.statLabel}>Response Rate</Text>
          </View>
        </View>

        {/* Action Buttons Section */}
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  heroContent: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  logoBadge: {
    width: 84,
    height: 84,
    borderRadius: 22,
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
    paddingHorizontal: SPACING.md,
  },
  valueSection: {
    marginVertical: SPACING.md,
    gap: 10,
  },
  valueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    ...SHADOWS.sm,
  },
  valueIconBox: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueTextBox: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  valueDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  actionsContainer: {
    gap: 10,
    marginTop: 'auto',
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
