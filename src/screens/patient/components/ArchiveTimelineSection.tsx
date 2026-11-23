import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../../theme';
import { formatDate } from '../../../utils/format';

interface TimelineEntry {
  type: string;
  id: number;
  date: string;
  title: string;
  detail?: string;
}

interface Props {
  timeline: TimelineEntry[];
}

export const ArchiveTimelineSection: React.FC<Props> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Clinical Timeline</Text>
      <View style={styles.card}>
        {timeline.map((item, idx) => {
          const isLast = idx === timeline.length - 1;
          return (
            <View key={`${item.type}-${item.id}-${idx}`} style={styles.itemRow}>
              <View style={styles.leftCol}>
                <View style={styles.dot} />
                {!isLast && <View style={styles.line} />}
              </View>
              <View style={styles.rightCol}>
                <Text style={styles.dateLabel}>
                  {item.type.toUpperCase()} • {formatDate(item.date)}
                </Text>
                <Text style={styles.title}>{item.title}</Text>
                {item.detail ? <Text style={styles.detail}>{item.detail}</Text> : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 18,
  },
  itemRow: {
    flexDirection: 'row',
  },
  leftCol: {
    alignItems: 'center',
    width: 20,
    marginRight: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.surfaceContainerHighest,
    marginVertical: 4,
  },
  rightCol: {
    flex: 1,
    paddingBottom: 16,
  },
  dateLabel: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.onSurface,
    marginTop: 2,
  },
  detail: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
});
