import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Job } from '../types';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface ApplyModalProps {
  visible: boolean;
  job: Job;
  candidateResumeUrl?: string;
  onClose: () => void;
  onSubmit: (coverNote: string, resumeUrl: string) => Promise<void>;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  visible,
  job,
  candidateResumeUrl,
  onClose,
  onSubmit,
}) => {
  const [coverNote, setCoverNote] = useState('');
  const [resumeUrl, setResumeUrl] = useState(candidateResumeUrl || 'https://ronojobs.com/resumes/my_resume.pdf');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmit(coverNote, resumeUrl);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalContent}
            >
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Apply for Position</Text>
                  <Text style={styles.subtitle}>{job.title} at {job.company_name}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {errorMsg && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              {/* Resume Section */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Resume / CV Link</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="document-text-outline" size={18} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={resumeUrl}
                    onChangeText={setResumeUrl}
                    placeholder="https://..."
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
                <Text style={styles.helperText}>
                  Your attached profile resume link will be sent to the hiring manager.
                </Text>
              </View>

              {/* Cover Note Section */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Cover Note / Introduction (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={coverNote}
                  onChangeText={setCoverNote}
                  placeholder="Share a brief message about why you are a great fit..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Actions */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={COLORS.textInverse} size="small" />
                  ) : (
                    <>
                      <Text style={styles.submitBtnText}>Submit Application</Text>
                      <Ionicons name="paper-plane" size={16} color={COLORS.textInverse} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    padding: 10,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '500',
    flex: 1,
  },
  fieldGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    backgroundColor: COLORS.surface,
    minHeight: 100,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: SPACING.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
});
