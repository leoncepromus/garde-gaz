import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants';
import { fetchIncidents, type Incident } from '../../services/firebase';
import ScreenShell from '../../components/ScreenShell';
import React from 'react';

export default function IncidentsScreen() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await fetchIncidents(50);
    setIncidents(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const active = incidents.filter(i => i.status === 'active').length;
  const resolved = incidents.filter(i => i.status === 'resolved').length;

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleString('en-RW', {
        timeZone: 'Africa/Kigali',
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { return ts; }
  };

  const duration = (start: string, end?: string | null) => {
    if (!end) return 'Ongoing';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.round(ms / 60000);
    if (mins < 1) return '< 1 min';
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  return (
    <ScreenShell
      title="Incidents"
      subtitle="Leak events and alert log"
      sensorOnline
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load(); }}
    >
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNum}>{incidents.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={[styles.summaryCard, active > 0 && styles.summaryActive]}>
          <Text style={[styles.summaryNum, active > 0 && { color: THEME.danger }]}>{active}</Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNum, { color: THEME.success }]}>{resolved}</Text>
          <Text style={styles.summaryLabel}>Resolved</Text>
        </View>
      </View>

      {incidents.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="shield-checkmark" size={40} color={THEME.primary} />
          <Text style={styles.emptyTitle}>No incidents recorded</Text>
          <Text style={styles.emptyText}>Leak events will appear here automatically</Text>
        </View>
      ) : (
        incidents.map((inc, i) => (
          <View
            key={inc.id ?? i}
            style={[styles.card, inc.status === 'active' && styles.cardActive]}
          >
            <View style={styles.cardHeader}>
              <View style={[
                styles.statusDot,
                { backgroundColor: inc.status === 'active' ? THEME.danger : THEME.primary },
              ]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>
                  Gas leak {inc.status === 'active' ? '(ACTIVE)' : '(resolved)'}
                </Text>
                <Text style={styles.cardTime}>{formatTime(inc.startTime)}</Text>
              </View>
              <View style={[styles.peakBadge, inc.status === 'active' && styles.peakActive]}>
                <Text style={styles.peakText}>{inc.peakPpm} ppm</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Meta icon="time-outline" label="Duration" value={duration(inc.startTime, inc.endTime)} />
              <Meta icon="analytics-outline" label="Peak" value={`${inc.peakPpm} ppm`} />
              <Meta
                icon="hand-left-outline"
                label="Ack"
                value={
                  inc.acknowledged
                    ? `${inc.ackChannel ?? 'yes'}`
                    : inc.status === 'active' ? 'Pending' : '—'
                }
              />
            </View>

            {(inc.escalationLevel ?? 0) > 0 && (
              <Text style={styles.escalationNote}>
                Escalations sent: {inc.escalationLevel}
              </Text>
            )}

            {inc.channels && (
              <View style={styles.actionsRow}>
                {Object.entries(inc.channels)
                  .filter(([, sent]) => sent)
                  .map(([ch]) => (
                    <View key={ch} style={styles.actionChip}>
                      <Text style={styles.actionText}>{ch.toUpperCase()}</Text>
                    </View>
                  ))}
              </View>
            )}
          </View>
        ))
      )}
    </ScreenShell>
  );
}

function Meta({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon as any} size={14} color={THEME.textMuted} />
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: THEME.bg, alignItems: 'center', justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  summaryCard: {
    flex: 1, backgroundColor: THEME.surface, borderRadius: 12,
    padding: 12, alignItems: 'center', borderWidth: 1, borderColor: THEME.border,
  },
  summaryActive: { borderColor: THEME.dangerBorder, backgroundColor: THEME.dangerBg },
  summaryNum: { fontSize: 22, fontWeight: '700', color: THEME.text },
  summaryLabel: { fontSize: 10, color: THEME.textMuted, marginTop: 4 },
  emptyBox: {
    backgroundColor: THEME.surface, borderRadius: 16, padding: 40,
    alignItems: 'center', borderWidth: 1, borderColor: THEME.border, gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: THEME.text, marginTop: 8 },
  emptyText: { fontSize: 13, color: THEME.textMuted, textAlign: 'center' },
  card: {
    backgroundColor: THEME.surface, borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: THEME.border,
  },
  cardActive: { borderColor: THEME.dangerBorder, backgroundColor: THEME.dangerBg },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: THEME.text },
  cardTime: { fontSize: 11, color: THEME.textMuted, marginTop: 2 },
  peakBadge: {
    backgroundColor: THEME.primaryGlow, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: THEME.border,
  },
  peakActive: { backgroundColor: THEME.dangerBg, borderColor: THEME.dangerBorder },
  peakText: { fontSize: 13, fontWeight: '700', color: THEME.text },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: THEME.border },
  escalationNote: { fontSize: 11, color: THEME.warning, marginTop: 8 },
  meta: { flex: 1 },
  metaLabel: { fontSize: 10, color: THEME.textMuted, marginTop: 4 },
  metaValue: { fontSize: 13, color: THEME.textSecondary, fontWeight: '500', marginTop: 2 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  actionChip: {
    backgroundColor: THEME.bgSecondary, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1, borderColor: THEME.border,
  },
  actionText: { fontSize: 9, color: THEME.textMuted, fontWeight: '600', letterSpacing: 0.5 },
});
