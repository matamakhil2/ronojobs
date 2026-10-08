import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Application, ApplicationStatus } from '../types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { StatusBadge } from './StatusBadge';
import { CompanyImage } from './CompanyImage';

interface ApplicationCardProps {
  application: Application;
  onPress?: () => void;
  activeColor?: string;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onPress,
  activeColor = COLORS.primary,
}) => {
  const steps: ApplicationStatus[] = ['Applied', 'Shortlisted', 'Interview', 'Selected'];
  const isRejected = application.status === 'Rejected';

  const getStepState = (step: ApplicationStatus) => {
    if (isRejected) {
      if (step === 'Applied') return 'completed';
      return 'inactive';
    }

    const order: Record<ApplicationStatus, number> = {
      Applied: 1,
      Shortlisted: 2,
      Interview: 3,
      Selected: 4,
      Rejected: 0,
    };

    const currentOrder = order[application.status] || 1;
    const thisOrder = order[step];

    if (thisOrder < currentOrder) return 'completed';
    if (thisOrder === currentOrder) return 'active';
    return 'upcoming';
  };

  const formattedDate = new Date(application.applied_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const displayTitle =
    application.job_title || (application as any).candidate_name || 'Job Opportunity';
  const displaySubtitle =
    [application.company_name, application.job_location].filter(Boolean).join(' • ') ||
    (application as any).headline ||
    (application as any).candidate_email ||
    'Application Submission';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.companyRow}>
          <CompanyImage
            uri={application.company_logo}
            companyName={application.company_name}
            size={42}
            borderRadius={RADIUS.md}
          />
          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {displayTitle}
            </Text>
            <Text style={styles.companyName} numberOfLines={1}>
              {displaySubtitle}
            </Text>
          </View>
        </View>

        <StatusBadge status={application.status} />
      </View>

      {/* Date & Note Info */}
      <View style={styles.metaRow}>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.textSecondary} />
          <Text style={styles.dateText}>Applied on {formattedDate}</Text>
        </View>

        {application.employment_type && (
          <Text style={[styles.typeText, { color: activeColor }]}>
            {application.employment_type}
          </Text>
        )}
      </View>

      {/* Visual Stepper Tracker */}
      <View style={styles.stepperContainer}>
        {steps.map((step, index) => {
          const state = getStepState(step);
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step}>
              <View style={styles.stepNode}>
                <View
                  style={[
                    styles.stepDot,
                    state === 'completed' && styles.stepDotCompleted,
                    state === 'active' && [styles.stepDotActive, { backgroundColor: activeColor }],
                    state === 'upcoming' && styles.stepDotUpcoming,
                  ]}
                >
                  {state === 'completed' ? (
                    <Ionicons name="checkmark" size={10} color={COLORS.textInverse} />
                  ) : state === 'active' ? (
                    <View style={styles.activeInnerDot} />
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    state === 'active' && [styles.stepLabelActive, { color: activeColor }],
                    state === 'completed' && styles.stepLabelCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {step}
                </Text>
              </View>

              {!isLast && (
                <View
                  style={[
                    styles.stepLine,
                    state === 'completed' && [
                      styles.stepLineFilled,
                      { backgroundColor: activeColor },
                    ],
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Rejection Notice if applicable */}
      {isRejected && (
        <View style={styles.rejectedBanner}>
          <Ionicons name="alert-circle" size={14} color={COLORS.danger} />
          <Text style={styles.rejectedText}>Application not proceeding at this time</Text>
        </View>
      )}

      {application.cover_note && (
        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Your Note:</Text>
          <Text style={styles.noteContent} numberOfLines={2}>
            "{application.cover_note}"
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
    gap: 10,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  companyName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  typeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginVertical: 4,
  },
  stepNode: {
    alignItems: 'center',
    width: 60,
  },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.success,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepDotUpcoming: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textInverse,
  },
  stepLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  stepLabelCompleted: {
    color: COLORS.success,
    fontWeight: '600',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: -4,
    marginBottom: 16,
  },
  stepLineFilled: {
    backgroundColor: COLORS.primary,
  },
  rejectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    gap: 6,
    marginTop: 8,
  },
  rejectedText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '500',
  },
  noteBox: {
    backgroundColor: COLORS.surface,
    padding: 10,
    borderRadius: RADIUS.md,
    marginTop: 8,
  },
  noteTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  noteContent: {
    fontSize: 12,
    color: COLORS.text,
    fontStyle: 'italic',
  },
});
