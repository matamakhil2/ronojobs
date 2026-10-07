import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { AppLogo } from '../../src/components/AppLogo';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, setDemoUser } = useAuth();

  const [role, setRole] = useState<'candidate' | 'employer'>('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeColor = role === 'candidate' ? COLORS.primary : COLORS.secondary;
  const activeLight = role === 'candidate' ? COLORS.primaryLight : COLORS.secondaryLight;

  const handleRoleChange = (newRole: 'candidate' | 'employer') => {
    setRole(newRole);
    setErrorMessage(null);
    // If the input was previous demo, clear or update
    if (email === 'alex.dev@gmail.com' || email === 'recruiter@techcorp.com') {
      setEmail('');
      setPassword('');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillDemo = () => {
    if (role === 'candidate') {
      setEmail('alex.dev@gmail.com');
      setPassword('Candidate@123');
    } else {
      setEmail('recruiter@techcorp.com');
      setPassword('Employer@123');
    }
    setErrorMessage(null);
  };

  const handleInstantDemoLogin = async () => {
    setDemoLoading(true);
    setErrorMessage(null);
    try {
      await setDemoUser(role);
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={{ marginBottom: 12 }}>
              <AppLogo size={46} />
            </View>
            <Text style={styles.title}>Welcome Back 👋</Text>
            <Text style={styles.subtitle}>
              {role === 'candidate'
                ? 'Sign in to explore tech jobs & track applications'
                : 'Sign in to manage job listings & candidate pipeline'}
            </Text>
          </View>

          {/* Role Selector Tabs (Same style as Create Account) */}
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleTab, role === 'candidate' && styles.roleTabActive]}
              onPress={() => handleRoleChange('candidate')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="person"
                size={18}
                color={role === 'candidate' ? COLORS.primary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.roleTabText,
                  role === 'candidate' && [styles.roleTabTextActive, { color: COLORS.primary }],
                ]}
              >
                Candidate Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleTab, role === 'employer' && styles.roleTabActive]}
              onPress={() => handleRoleChange('employer')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="business"
                size={18}
                color={role === 'employer' ? COLORS.secondary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.roleTabText,
                  role === 'employer' && [styles.roleTabTextActive, { color: COLORS.secondary }],
                ]}
              >
                Employer Sign In
              </Text>
            </TouchableOpacity>
          </View>

          {errorMessage && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {role === 'candidate' ? 'Candidate Email' : 'Work / Company Email'}
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder={
                    role === 'candidate' ? 'alex.dev@gmail.com' : 'recruiter@techcorp.com'
                  }
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: activeColor }, loading && styles.submitBtnDisabled]}
              onPress={handleLogin}
              disabled={loading || demoLoading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textInverse} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {role === 'candidate' ? 'Sign In as Candidate' : 'Sign In as Employer'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Demo Card for Selected Role */}
          <View style={styles.demoCard}>
            <View style={styles.demoCardHeader}>
              <View style={styles.demoBadge}>
                <Ionicons name="flash" size={14} color={activeColor} />
                <Text style={[styles.demoBadgeText, { color: activeColor }]}>
                  {role === 'candidate' ? 'Candidate Demo' : 'Employer Demo'}
                </Text>
              </View>
              <Text style={styles.demoCardSub}>Instant 1-Click Access</Text>
            </View>

            <View style={styles.demoButtonsRow}>
              <TouchableOpacity
                style={[styles.demoFillBtn, { borderColor: activeColor }]}
                onPress={handleAutofillDemo}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={15} color={activeColor} />
                <Text style={[styles.demoFillText, { color: activeColor }]}>
                  Auto-Fill Credentials
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoInstantBtn, { backgroundColor: activeLight, borderColor: activeColor }]}
                onPress={handleInstantDemoLogin}
                disabled={demoLoading}
                activeOpacity={0.8}
              >
                {demoLoading ? (
                  <ActivityIndicator size="small" color={activeColor} />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={15} color={activeColor} />
                    <Text style={[styles.demoInstantText, { color: activeColor }]}>
                      1-Tap Demo Entry
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={[styles.footerLink, { color: activeColor }]}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 4,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  roleTabActive: {
    backgroundColor: COLORS.card,
    ...SHADOWS.sm,
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  roleTabTextActive: {
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    padding: 12,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.danger,
    fontWeight: '500',
    flex: 1,
  },
  form: {
    gap: SPACING.md,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  submitBtn: {
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...SHADOWS.md,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  demoCard: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  demoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  demoCardSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoFillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    backgroundColor: COLORS.surface,
    gap: 6,
  },
  demoFillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  demoInstantBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 6,
  },
  demoInstantText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
