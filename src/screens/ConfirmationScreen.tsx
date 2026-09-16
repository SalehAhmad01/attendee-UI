import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const ConfirmationScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { success, record, errorCode, message, detail } = route.params || {};

  const getFriendlyErrorTitle = () => {
    switch (errorCode) {
      case 'OUTSIDE_GEOFENCE':
        return 'Outside Class Geofence';
      case 'INVALID_CODE':
        return 'Expired or Invalid QR';
      case 'ALREADY_MARKED':
        return 'Attendance Already Marked';
      case 'MOCK_LOCATION':
        return 'Mock GPS Detected';
      case 'SESSION_CLOSED':
        return 'Session Expired or Ended';
      case 'MISSING_FIELDS':
        return 'Required Information Missing';
      default:
        return 'Verification Failed';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Header Badge */}
        <View style={styles.header}>
          <Badge
            label={success ? 'PRESENCE CONFIRMED' : 'REJECTED'}
            variant={success ? 'success' : 'error'}
          />
        </View>

        {success ? (
          /* Success Card */
          <Card variant="bridal" style={styles.mainCard}>
            <View style={styles.iconCircleSuccess}>
              <Text style={styles.iconText}>✓</Text>
            </View>

            <Text style={styles.successTitle}>Attendance Recorded</Text>
            <Text style={styles.successSub}>
              Your physical presence and rotating token have been verified by the server.
            </Text>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>SESSION</Text>
              <Text style={styles.detailValue}>{record?.session_title || 'Class Session'}</Text>
            </View>

            {record?.name ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ATTENDEE</Text>
                <Text style={styles.detailValue}>{record?.name}</Text>
              </View>
            ) : null}

            {record?.id_number ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ID NUMBER</Text>
                <Text style={styles.detailValue}>{record?.id_number}</Text>
              </View>
            ) : null}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>GEOFENCE DISTANCE</Text>
              <Text style={styles.detailValue}>{record?.distance_m}m from centre</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>TIMESTAMP</Text>
              <Text style={styles.detailValue}>
                {new Date(record?.created_at || Date.now()).toLocaleTimeString()}
              </Text>
            </View>

            <View style={styles.verificationPill}>
              <Text style={styles.verificationText}>🔒 Anti-Proxy Multi-Factor Verified</Text>
            </View>
          </Card>
        ) : (
          /* Failure Card */
          <Card variant="dark" style={styles.mainCard}>
            <View style={styles.iconCircleError}>
              <Text style={styles.iconText}>✕</Text>
            </View>

            <Text style={styles.errorTitle}>{getFriendlyErrorTitle()}</Text>
            <Text style={styles.errorSub}>{message}</Text>

            {detail?.distance_m && (
              <View style={styles.distanceAlert}>
                <Text style={styles.distanceAlertTitle}>Distance Diagnostic</Text>
                <Text style={styles.distanceAlertText}>
                  Measured Distance: {detail.distance_m}m{'\n'}
                  Allowed Radius: {detail.range_m}m
                </Text>
              </View>
            )}

            <View style={styles.helpBox}>
              <Text style={styles.helpTitle}>How to resolve:</Text>
              {errorCode === 'OUTSIDE_GEOFENCE' ? (
                <Text style={styles.helpText}>
                  • Move closer to the classroom or instructor.{'\n'}
                  • Ensure Wi-Fi and location accuracy are turned on.{'\n'}
                  • Ask host if the geofence range needs adjusting.
                </Text>
              ) : errorCode === 'INVALID_CODE' ? (
                <Text style={styles.helpText}>
                  • The host QR rotates every 30 seconds.{'\n'}
                  • Scan the currently active code on screen.
                </Text>
              ) : errorCode === 'MOCK_LOCATION' ? (
                <Text style={styles.helpText}>
                  • Turn off "Allow Mock Locations" in developer settings.
                </Text>
              ) : (
                <Text style={styles.helpText}>
                  • Check with your session host for session status.
                </Text>
              )}
            </View>
          </Card>
        )}

        {/* Navigation Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="RETURN TO DASHBOARD"
            variant={success ? 'secondary' : 'outline'}
            onPress={() => navigation.navigate('Dashboard')}
          />
          {!success && (
            <Button
              title="RETRY SCAN"
              variant="secondary"
              onPress={() => navigation.navigate('ScanAttend')}
            />
          )}
          {success && (
            <Button
              title="VIEW MY ATTENDANCE LOG"
              variant="outline"
              onPress={() => navigation.navigate('MyAttendance')}
            />
          )}
        </View>
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
    alignItems: 'center',
  },
  header: {
    marginVertical: 12,
  },
  mainCard: {
    width: '100%',
    alignItems: 'center',
    padding: 24,
  },
  iconCircleSuccess: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.skinTone,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconCircleError: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.errorBg,
    borderWidth: 2,
    borderColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.bridal,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.skinTone,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 14,
    color: Colors.skinToneLight,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  errorSub: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 198, 168, 0.25)',
    marginVertical: 18,
  },
  detailRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    color: Colors.skinToneDark,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  detailValue: {
    color: Colors.skinTone,
    fontSize: 14,
    fontWeight: '700',
  },
  verificationPill: {
    marginTop: 18,
    backgroundColor: 'rgba(255, 198, 168, 0.15)',
    borderWidth: 1,
    borderColor: Colors.skinTone,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  verificationText: {
    color: Colors.skinTone,
    fontSize: 12,
    fontWeight: '700',
  },
  distanceAlert: {
    backgroundColor: 'rgba(255, 90, 121, 0.12)',
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 16,
    padding: 14,
    width: '100%',
    marginVertical: 14,
  },
  distanceAlertTitle: {
    color: Colors.error,
    fontWeight: '800',
    fontSize: 13,
  },
  distanceAlertText: {
    color: Colors.textPrimary,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  helpBox: {
    width: '100%',
    backgroundColor: '#1E070F',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  helpTitle: {
    color: Colors.skinTone,
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 6,
  },
  helpText: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  actionButtons: {
    width: '100%',
    gap: 8,
    marginTop: 20,
  },
});
