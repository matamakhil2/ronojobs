import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { profileApi } from '../../src/services/api';
import { CandidateProfile, CompanyProfile } from '../../src/types';
import { AppLogo, AppBrand } from '../../src/components/AppLogo';
import { CompanyImage } from '../../src/components/CompanyImage';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../src/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, setDemoUser, updateUser } = useAuth();

  const isCandidate = user?.role === 'candidate';
  const isEmployer = user?.role === 'employer';
  const roleColor = isEmployer ? COLORS.secondary : COLORS.primary;
  const roleLight = isEmployer ? COLORS.secondaryLight : COLORS.primaryLight;

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const profileScrollRef = useRef<ScrollView>(null);

  // Auto-scroll to top whenever tab is clicked/focused
  useFocusEffect(
    useCallback(() => {
      profileScrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  // Candidate fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState('0');
  const [education, setEducation] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [skillsStr, setSkillsStr] = useState('');

  // Employer fields
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');

  useEffect(() => {
    if (user) {
      if (isCandidate) {
        const cp = user.profile as CandidateProfile | undefined;
        setFullName(cp?.full_name || (user as any)?.fullName || (user as any)?.name || '');
        setPhone(cp?.phone || '');
        setLocation(cp?.location || '');
        setHeadline(cp?.headline || '');
        setBio(cp?.bio || '');
        setExperienceYears(String(cp?.experience_years || 0));
        setEducation(cp?.education || '');
        setResumeUrl(cp?.resume_url || '');
        setSkillsStr(Array.isArray(cp?.skills) ? cp.skills.join(', ') : '');
      } else if (isEmployer) {
        const comp = user.profile as CompanyProfile | undefined;
        setCompanyName(comp?.name || (user as any)?.companyName || (user as any)?.name || '');
        setCompanyWebsite(comp?.website || '');
        setCompanyLocation(comp?.location || '');
        setCompanyIndustry(comp?.industry || '');
        setCompanyDesc(comp?.description || '');
      }
    }
  }, [user, isCandidate, isEmployer]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (isCandidate) {
        const skillsArr = skillsStr
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        const payload = {
          full_name: fullName,
          phone,
          location,
          headline,
          bio,
          experience_years: parseInt(experienceYears, 10) || 0,
          education,
          resume_url: resumeUrl,
          skills: skillsArr,
        };

        const res = await profileApi.updateProfile(payload);
        updateUser({ profile: res.data });
      } else if (isEmployer) {
        const payload = {
          name: companyName,
          website: companyWebsite,
          location: companyLocation,
          industry: companyIndustry,
          description: companyDesc,
        };
        const res = await profileApi.updateProfile(payload);
        updateUser({ profile: res.data });
      }
      setIsEditing(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPrompt}>
          <AppLogo size={64} containerStyle={{ marginBottom: 12 }} />
          <Text style={styles.authTitle}>Your RonoJobs Profile</Text>
          <Text style={styles.authSubtitle}>
            Sign in to build your professional profile, showcase your skills, and apply to jobs in one click.
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
      <ScrollView
        ref={profileScrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            {isCandidate ? (
              <View style={[styles.avatar, { backgroundColor: roleLight }]}>
                <Ionicons name="person" size={26} color={roleColor} />
              </View>
            ) : (
              <CompanyImage
                uri={(user?.profile as CompanyProfile)?.logo_url}
                companyName={companyName}
                size={54}
                borderRadius={RADIUS.full}
              />
            )}

            <View style={styles.avatarMeta}>
              <Text style={styles.profileName}>
                {isCandidate
                  ? fullName || (user?.profile as any)?.full_name || (user as any)?.fullName || (user?.email ? user.email.split('@')[0] : 'Candidate')
                  : companyName || (user?.profile as any)?.name || (user as any)?.companyName || 'Company'}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleLight }]}>
                <Ionicons
                  name={isCandidate ? 'person' : 'business'}
                  size={12}
                  color={roleColor}
                />
                <Text style={[styles.roleBadgeText, { color: roleColor }]}>
                  {user?.role?.toUpperCase()} ACCOUNT
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.editToggleBtn, { backgroundColor: roleColor }]}
            onPress={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.textInverse} />
            ) : (
              <>
                <Ionicons
                  name={isEditing ? 'checkmark' : 'create-outline'}
                  size={16}
                  color={COLORS.textInverse}
                />
                <Text style={styles.editToggleBtnText}>
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Profile Details Sections */}
        {isCandidate ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Professional Information</Text>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Headline</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={headline}
                  onChangeText={setHeadline}
                  placeholder="e.g. Senior Mobile Engineer"
                />
              ) : (
                <Text style={styles.fieldValue}>{headline || 'Not specified'}</Text>
              )}
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Location</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g. San Francisco, CA / Remote"
                />
              ) : (
                <Text style={styles.fieldValue}>{location || 'Not specified'}</Text>
              )}
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Phone</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+1 (555) 000-0000"
                />
              ) : (
                <Text style={styles.fieldValue}>{phone || 'Not specified'}</Text>
              )}
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Years of Experience</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={experienceYears}
                  onChangeText={setExperienceYears}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.fieldValue}>{experienceYears} Years</Text>
              )}
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Education</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={education}
                  onChangeText={setEducation}
                  placeholder="Degree, University"
                />
              ) : (
                <Text style={styles.fieldValue}>{education || 'Not specified'}</Text>
              )}
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Skills (comma separated)</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={skillsStr}
                  onChangeText={setSkillsStr}
                  placeholder="React Native, Node.js, TypeScript"
                />
              ) : (
                <View style={styles.skillsTagRow}>
                  {skillsStr ? (
                    skillsStr.split(',').map((s, idx) => (
                      <View key={idx} style={styles.skillTag}>
                        <Text style={styles.skillTagText}>{s.trim()}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.fieldValue}>No skills listed</Text>
                  )}
                </View>
              )}
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Resume Link</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={resumeUrl}
                  onChangeText={setResumeUrl}
                  placeholder="https://..."
                />
              ) : (
                <Text style={[styles.fieldValue, { color: COLORS.primary }]}>
                  {resumeUrl || 'Not uploaded'}
                </Text>
              )}
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Bio</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, styles.fieldTextArea]}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={3}
                />
              ) : (
                <Text style={styles.fieldValue}>{bio || 'No bio provided'}</Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Company Profile</Text>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Company Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={companyName}
                  onChangeText={setCompanyName}
                />
              ) : (
                <Text style={styles.fieldValue}>{companyName || 'Not specified'}</Text>
              )}
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Industry</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={companyIndustry}
                  onChangeText={setCompanyIndustry}
                />
              ) : (
                <Text style={styles.fieldValue}>{companyIndustry || 'Not specified'}</Text>
              )}
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Headquarters / Location</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={companyLocation}
                  onChangeText={setCompanyLocation}
                />
              ) : (
                <Text style={styles.fieldValue}>{companyLocation || 'Not specified'}</Text>
              )}
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Website</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={companyWebsite}
                  onChangeText={setCompanyWebsite}
                />
              ) : (
                <Text style={[styles.fieldValue, { color: roleColor }]}>
                  {companyWebsite || 'Not specified'}
                </Text>
              )}
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Description</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, styles.fieldTextArea]}
                  value={companyDesc}
                  onChangeText={setCompanyDesc}
                  multiline
                  numberOfLines={3}
                />
              ) : (
                <Text style={styles.fieldValue}>{companyDesc || 'No description provided'}</Text>
              )}
            </View>
          </View>
        )}

        {/* Demo Switcher shortcuts */}
        <View style={styles.demoCard}>
          <Text style={styles.demoHeader}>⚡ Switch Demo Account Mode</Text>
          <View style={styles.demoRow}>
            <TouchableOpacity
              style={[
                styles.demoBtn,
                isCandidate && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
              ]}
              onPress={() => setDemoUser('candidate')}
            >
              <Text style={[styles.demoBtnText, isCandidate && styles.demoBtnTextActive]}>
                Candidate View
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.demoBtn,
                isEmployer && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
              ]}
              onPress={() => setDemoUser('employer')}
            >
              <Text style={[styles.demoBtnText, isEmployer && styles.demoBtnTextActive]}>
                Employer View
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Branding Footer */}
        <AppBrand
          containerStyle={{ alignSelf: 'center', marginTop: SPACING.xl, marginBottom: SPACING.md, opacity: 0.8 }}
          logoSize={24}
          fontSize={16}
          subtitle="Version 1.0.0 • Official Release"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  avatarMeta: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  profileEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  editToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    gap: 6,
  },
  editToggleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  fieldItem: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  fieldInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  fieldTextArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  skillsTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
  },
  skillTagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  demoCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  demoHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  demoBtnTextActive: {
    color: COLORS.textInverse,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.dangerLight,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    gap: 8,
    marginBottom: SPACING.lg,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
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
