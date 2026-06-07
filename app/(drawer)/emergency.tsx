import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, USSD_CODE, EMERGENCY_CONTACTS } from '../../constants';
import ScreenShell from '../../components/ScreenShell';
import React from 'react';

const USSD_STEPS = [
  { key: '1', label: 'Current gas level', desc: 'Live ppm reading & safe/danger status' },
  { key: '2', label: 'Last 3 readings', desc: 'Recent history without internet on phone' },
  { key: '3', label: 'System status', desc: 'Sensor online & cloud connection' },
  { key: '4', label: 'Emergency contacts', desc: 'Primary number, fire 112, police 113' },
];

export default function EmergencyScreen() {
  const dialUssd = () => {
    Alert.alert(
      `Dial ${USSD_CODE}?`,
      'Opens your phone dialer with the USSD code.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Dial', onPress: () => Linking.openURL(`tel:${encodeURIComponent(USSD_CODE)}`) },
      ],
    );
  };

  const callContact = (label: string, tel: string) => {
    Alert.alert(`Call ${label}?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => Linking.openURL(tel) },
    ]);
  };

  return (
    <ScreenShell title="USSD & Emergency" subtitle="Offline access & emergency contacts">
      <View style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <Ionicons name="keypad" size={32} color={THEME.primary} />
        </View>
        <Text style={styles.heroTitle}>Check gas status offline</Text>
        <Text style={styles.heroSub}>
          Dial {USSD_CODE} on any phone — no smartphone or internet required
        </Text>
        <TouchableOpacity style={styles.dialBtn} onPress={dialUssd}>
          <Ionicons name="call" size={18} color={THEME.bg} />
          <Text style={styles.dialBtnText}>Dial {USSD_CODE}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>USSD MENU OPTIONS</Text>
      {USSD_STEPS.map(step => (
        <View key={step.key} style={styles.stepCard}>
          <View style={styles.stepNum}>
            <Text style={styles.stepNumText}>{step.key}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.stepLabel}>{step.label}</Text>
            <Text style={styles.stepDesc}>{step.desc}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>EMERGENCY CONTACTS</Text>
      {EMERGENCY_CONTACTS.map(c => (
        <TouchableOpacity
          key={c.number}
          style={styles.contactCard}
          onPress={() => callContact(c.label, c.tel)}
        >
          <View style={styles.contactIcon}>
            <Ionicons name="call-outline" size={20} color={THEME.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactLabel}>{c.label}</Text>
            <Text style={styles.contactNumber}>{c.number}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.textMuted} />
        </TouchableOpacity>
      ))}

      <View style={styles.safetyCard}>
        <Ionicons name="information-circle" size={20} color={THEME.warning} />
        <Text style={styles.safetyText}>
          If you smell gas: evacuate immediately, do not use electrical switches,
          call emergency services from outside the building.
        </Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: THEME.surface, borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 24,
    borderWidth: 1, borderColor: THEME.primaryMuted,
  },
  heroIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: THEME.primaryGlow, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, borderWidth: 1, borderColor: THEME.primary,
  },
  heroTitle: { fontSize: 18, fontWeight: '700', color: THEME.text, textAlign: 'center' },
  heroSub: { fontSize: 13, color: THEME.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  dialBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: THEME.primary, borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 14, marginTop: 20,
  },
  dialBtnText: { fontSize: 16, fontWeight: '700', color: THEME.bg },
  sectionTitle: { fontSize: 11, color: THEME.textMuted, letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  stepCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: THEME.surface, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: THEME.border,
  },
  stepNum: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: THEME.primaryGlow, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: THEME.primaryMuted,
  },
  stepNumText: { fontSize: 14, fontWeight: '700', color: THEME.primary },
  stepLabel: { fontSize: 14, fontWeight: '600', color: THEME.text },
  stepDesc: { fontSize: 12, color: THEME.textMuted, marginTop: 2 },
  contactCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: THEME.surface, borderRadius: 14, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: THEME.border,
  },
  contactIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: THEME.primaryGlow, alignItems: 'center', justifyContent: 'center',
  },
  contactLabel: { fontSize: 14, fontWeight: '600', color: THEME.text },
  contactNumber: { fontSize: 16, color: THEME.primary, marginTop: 2, fontWeight: '500' },
  safetyCard: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: 'rgba(251, 191, 36, 0.1)', borderRadius: 12,
    padding: 14, marginTop: 16, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  safetyText: { flex: 1, fontSize: 12, color: THEME.textSecondary, lineHeight: 18 },
});
