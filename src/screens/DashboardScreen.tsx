import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Badge } from '../components/Badge';
import { BrandIcon } from '../components/BrandIcon';
import { useAuth } from '../auth/AuthContext';

export const DashboardScreen = ({ navigation }: { navigation: any }) => {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top App Bar with Brand Icon */}
        <View style={styles.topBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <BrandIcon size={36} />
            <View>
              <Text style={styles.appTitle}>GEO-QR</Text>
              <Text style={styles.greetingText}>
                Hello, {user?.full_name || user?.email?.split('@')[0] || 'Scholar'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>LOG OUT</Text>
          </TouchableOpacity>
        </View>

        {/* User Card Pill */}
        <View style={styles.userBadgeCard}>
          <View style={styles.userBadgeLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>
                {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userRole}>Verified Account</Text>
            </View>
          </View>
          <Badge label="ACTIVE" variant="success" />
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeading}>
          <Text style={styles.headingTitle}>CHOOSE ACTION</Text>
          <Text style={styles.headingSubtitle}>Dual Anti-Proxy Attendance Protocol</Text>
        </View>

        {/* Hero Card 1: HOST A SESSION (Bridal Luxe Theme) */}
        <TouchableOpacity
          style={styles.hostCard}
          onPress={() => navigation.navigate('HostSetup')}
          activeOpacity={0.85}
        >
          <View style={styles.cardHeaderRow}>
            <Badge label="HOST ROLE" variant="skin" />
            <Text style={styles.cardArrow}>→</Text>
          </View>
          <Text style={styles.hostCardTitle}>Host a Session</Text>
          <Text style={styles.hostCardDescription}>
            Broadcast a rotating session QR code and establish a high-accuracy GPS geofence boundary around your lecture venue.
          </Text>
          <View style={styles.cardFooterTags}>
            <View style={styles.tagPill}>
              <Text style={styles.tagPillText}>📍 Dynamic Geofence</Text>
            </View>
            <View style={styles.tagPill}>
              <Text style={styles.tagPillText}>⏱ Rotating HMAC QR</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Hero Card 2: SCAN TO ATTEND (Skin Tone Warm Luxe Theme) */}
        <TouchableOpacity
          style={styles.scanCard}
          onPress={() => navigation.navigate('ScanAttend')}
          activeOpacity={0.85}
        >
          <View style={styles.cardHeaderRow}>
            <Badge label="STUDENT ATTENDEE" variant="bridal" />
            <Text style={styles.scanCardArrow}>→</Text>
          </View>
          <Text style={styles.scanCardTitle}>Scan to Attend</Text>
          <Text style={styles.scanCardDescription}>
            Scan the rotating class QR code with your camera while inside the geofence radius to record your verified presence.
          </Text>
          <View style={styles.cardFooterTags}>
            <View style={styles.scanTagPill}>
              <Text style={styles.scanTagPillText}>📷 Camera Scanner</Text>
            </View>
            <View style={styles.scanTagPill}>
              <Text style={styles.scanTagPillText}>🛡 Mock GPS Guard</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Link: My Attendance */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('MyAttendance')}
          activeOpacity={0.8}
        >
          <Text style={styles.historyButtonText}>📋 VIEW MY ATTENDANCE LOGS</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.skinTone,
    letterSpacing: 1.5,
  },
  greetingText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: Colors.bridalLight,
    backgroundColor: Colors.card,
  },
  logoutText: {
    color: Colors.skinTone,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  userBadgeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 24,
  },
  userBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.bridal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.skinTone,
  },
  avatarLetter: {
    color: Colors.skinTone,
    fontWeight: '900',
    fontSize: 18,
  },
  userEmail: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  userRole: {
    color: Colors.skinTone,
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeading: {
    marginBottom: 14,
  },
  headingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.skinTone,
    letterSpacing: 1.5,
  },
  headingSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  hostCard: {
    backgroundColor: Colors.bridal,
    borderRadius: 26,
    padding: 24,
    borderWidth: 1.5,
    borderColor: Colors.skinTone,
    marginBottom: 16,
    shadowColor: Colors.bridal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardArrow: {
    color: Colors.skinTone,
    fontSize: 24,
    fontWeight: '800',
  },
  hostCardTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.skinTone,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  hostCardDescription: {
    fontSize: 14,
    color: Colors.skinToneLight,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    backgroundColor: 'rgba(255, 198, 168, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 198, 168, 0.3)',
  },
  tagPillText: {
    color: Colors.skinTone,
    fontSize: 12,
    fontWeight: '700',
  },
  scanCard: {
    backgroundColor: Colors.skinTone,
    borderRadius: 26,
    padding: 24,
    borderWidth: 1.5,
    borderColor: Colors.bridal,
    marginBottom: 20,
    shadowColor: Colors.skinTone,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  scanCardArrow: {
    color: Colors.bridal,
    fontSize: 24,
    fontWeight: '800',
  },
  scanCardTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.bridal,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  scanCardDescription: {
    fontSize: 14,
    color: '#3B0D18',
    lineHeight: 20,
    marginBottom: 16,
  },
  scanTagPill: {
    backgroundColor: 'rgba(116, 26, 47, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(116, 26, 47, 0.3)',
  },
  scanTagPillText: {
    color: Colors.bridal,
    fontSize: 12,
    fontWeight: '700',
  },
  historyButton: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyButtonText: {
    color: Colors.skinTone,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
