import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { AppLogo } from '../src/components/AppLogo';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../src/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, user, setDemoUser } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleStartCandidate = async () => {
    await setDemoUser('candidate');
    router.replace('/(tabs)');
  };

  const handleStartEmployer = async () => {
    await setDemoUser('employer');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Brand Hero */}
      <View style={styles.heroContent}>
        <View style={styles.logoBadge}>
          <AppLogo size={52} />
        </View>

        <Text style={styles.brandTitle}>
          Rono<Text style={{ color: COLORS.primary }}>Jobs</Text>
        </Text>
        <Text style={styles.tagline}>
          Connect with world-class opportunities. The next-generation hiring platform for tech talent and top employers.
        </Text>

        {/* Feature Pills (reflecting the 3 logo colors: Purple, Orange, Blue) */}
        <View style={styles.featureGrid}>
          <View style={styles.featurePill}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
            <Text style={styles.featureText}>Verified Employers</Text>
          </View>
          <View style={styles.featurePill}>
            <Ionicons name="flash" size={16} color={COLORS.accent} />
            <Text style={styles.featureText}>Instant Status Tracking</Text>
          </View>
          <View style={styles.featurePill}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.secondary} />
            <Text style={styles.featureText}>Direct Hiring Pipeline</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Sign In / Get Started</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.textInverse} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>Browse Jobs as Guest</Text>
        </TouchableOpacity>

        {/* Demo Fast Tracks */}
        <View style={styles.demoSection}>
          <Text style={styles.demoLabel}>⚡ Quick Demo Sign-In:</Text>
          <View style={styles.demoRow}>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={handleStartCandidate}
            >
              <Ionicons name="person" size={14} color={COLORS.primary} />
              <Text style={styles.demoBtnText}>Candidate Demo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoBtn, { borderColor: COLORS.secondary, backgroundColor: COLORS.secondaryLight }]}
              onPress={handleStartEmployer}
            >
              <Ionicons name="business" size={14} color={COLORS.secondary} />
              <Text style={[styles.demoBtnText, { color: COLORS.secondary }]}>Employer Demo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  heroContent: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.xl,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
    ...SHADOWS.sm,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: SPACING.md,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    gap: 8,
    ...SHADOWS.md,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  demoSection: {
    marginTop: 8,
    alignItems: 'center',
  },
  demoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    gap: 6,
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
