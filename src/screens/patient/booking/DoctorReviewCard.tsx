import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing } from '../../../theme';
import { PrimaryButton } from '../../../components';
import { ApiError, patientService, Review } from '../../../api';
import { formatDate } from '../../../utils/format';

interface Props {
  appointmentId: number;
  canReview: boolean;
  existingReview?: Review | null;
  onReviewed: () => void;
}

export const DoctorReviewCard: React.FC<Props> = ({
  appointmentId,
  canReview,
  existingReview,
  onReviewed,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (existingReview) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <MaterialIcons name="rate-review" size={20} color={Colors.primary} />
          <Text style={styles.title}>Your Review</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <MaterialIcons
                key={s}
                name={s <= existingReview.rating ? 'star' : 'star-border'}
                size={18}
                color="#d97706"
              />
            ))}
          </View>
        </View>
        {existingReview.comment ? (
          <Text style={styles.existingComment}>{existingReview.comment}</Text>
        ) : (
          <Text style={styles.existingMeta}>Rated {existingReview.rating} out of 5 stars</Text>
        )}
        {existingReview.createdAt ? (
          <Text style={styles.dateText}>Submitted on {formatDate(existingReview.createdAt)}</Text>
        ) : null}
      </View>
    );
  }

  if (!canReview) {
    return null;
  }

  const handleSubmitReview = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Invalid Rating', 'Please select a star rating between 1 and 5.');
      return;
    }
    setSubmitting(true);
    try {
      await patientService.reviewDoctor(appointmentId, rating, comment.trim() || undefined);
      Alert.alert('Thank You!', 'Your feedback has been submitted.');
      onReviewed();
    } catch (err: any) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err?.message || 'Could not submit your review.';
      Alert.alert('Review Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Rate Your Consultation</Text>
      <Text style={styles.subtitle}>
        How was your experience with the doctor? Your review helps other patients.
      </Text>

      <View style={styles.starPickerRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starBtn}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={star <= rating ? 'star' : 'star-border'}
              size={34}
              color="#d97706"
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Share your experience (optional)..."
        placeholderTextColor={Colors.outlineVariant}
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <PrimaryButton
        title="Submit Review"
        onPress={handleSubmitReview}
        loading={submitting}
        style={{ marginTop: Spacing.sm }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
    flex: 1,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    marginBottom: 12,
  },
  starsRow: { flexDirection: 'row', gap: 2 },
  existingComment: {
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    marginTop: 4,
    lineHeight: 20,
  },
  existingMeta: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  dateText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 6,
  },
  starPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 10,
  },
  starBtn: {
    padding: 4,
  },
  input: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
    color: Colors.onSurface,
    marginBottom: 8,
  },
});
