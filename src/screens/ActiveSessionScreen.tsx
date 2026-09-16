import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../theme/colors';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { apiClient } from '../api/client';

export const ActiveSessionScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { sessionId } = route.params;

  const [session, setSession] = useState<any>(null);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [attendeeCount, setAttendeeCount] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('--:--');
  const [rotationSeconds, setRotationSeconds] = useState<number>(30);
  const [rotationProgress, setRotationProgress] = useState<number>(30);

  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);

  // Attendees inspection sheet
  const [attendeesModalVisible, setAttendeesModalVisible] = useState(false);
  const [attendeesList, setAttendeesList] = useState<any[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const pollIntervalRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  const fetchQR = async () => {
    try {
      const res = await apiClient.get(`/sessions/${sessionId}/qr/`);
      setCurrentCode(res.data.code);
      if (res.data.rotation_seconds) {
        setRotationSeconds(res.data.rotation_seconds);
      }
      setRotationProgress(res.data.rotation_seconds || 30);
    } catch (err: any) {
      console.warn('QR poll error:', err.response?.data);
      if (err.response?.status === 410) {
        Alert.alert('Session Ended', 'This session has expired or ended.');
        navigation.goBack();
      }
    }
  };

  const fetchSessionDetails = async () => {
    try {
      const res = await apiClient.get(`/sessions/${sessionId}/`);
      setSession(res.data.session);
      setAttendeeCount(res.data.attendee_count || 0);
      if (res.data.session.expires_at) {
        setExpiresAt(new Date(res.data.session.expires_at));
      }
    } catch (err) {
      console.warn('Session detail fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionDetails();
    fetchQR();

    // Poll QR code based on rotation_seconds
    const intervalMs = (rotationSeconds || 30) * 1000;
    pollIntervalRef.current = setInterval(() => {
      fetchQR();
      fetchSessionDetails();
    }, intervalMs);

    // Live countdown to expires_at and rotation tick
    timerIntervalRef.current = setInterval(() => {
      setRotationProgress((prev: number) => (prev > 1 ? prev - 1 : rotationSeconds));

      if (expiresAt) {
        const diffMs = expiresAt.getTime() - new Date().getTime();
        if (diffMs <= 0) {
          setTimeLeft('EXPIRED');
        } else {
          const totalSec = Math.floor(diffMs / 1000);
          const mins = Math.floor(totalSec / 60);
          const secs = totalSec % 60;
          setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
        }
      }
    }, 1000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [sessionId, expiresAt, rotationSeconds]);

  const handleEndSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to stop recording attendance? This will invalidate all active QR codes immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Now',
          style: 'destructive',
          onPress: async () => {
            setEnding(true);
            try {
              await apiClient.post(`/sessions/${sessionId}/end/`);
              Alert.alert('Session Ended', 'Attendance collection has closed.');
              navigation.navigate('Dashboard');
            } catch (err: any) {
              Alert.alert('Error', 'Failed to end session.');
            } finally {
              setEnding(false);
            }
          },
        },
      ]
    );
  };

  const handleOpenAttendees = async () => {
    setAttendeesModalVisible(true);
    setLoadingAttendees(true);
    try {
      const res = await apiClient.get(`/sessions/${sessionId}/attendance/`);
      setAttendeesList(res.data.attendees || []);
    } catch (err) {
      Alert.alert('Error', 'Could not load attendees list.');
    } finally {
      setLoadingAttendees(false);
    }
  };

  const qrPayload = currentCode ? `${sessionId}:${currentCode}` : '';

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator color={Colors.skinTone} size="large" />
        <Text style={styles.loadingText}>Initializing Session & QR Broadcast...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>✕ CLOSE</Text>
          </TouchableOpacity>
          <Badge label="BROADCASTING" variant="bridal" />
        </View>

        {/* Title Block */}
        <View style={styles.titleBlock}>
          <Text style={styles.sessionTitle}>{session?.title}</Text>
          <View style={styles.badgeRow}>
            <Badge label="RADIUS" value={`${session?.range_m}m`} variant="skin" />
            <Badge label="ROTATES IN" value={`${rotationProgress}s`} variant="skin" />
          </View>
        </View>

        {/* QR Code Container Card (Skin Tone background for optimal scanning contrast) */}
        <View style={styles.qrCard}>
          <View style={styles.qrWrapper}>
            {qrPayload ? (
              <QRCode
                value={qrPayload}
                size={230}
                color={Colors.bridal}
                backgroundColor={Colors.skinTone}
              />
            ) : (
              <ActivityIndicator color={Colors.bridal} size="large" />
            )}
          </View>

          <View style={styles.qrFooterPill}>
            <Text style={styles.qrFooterText}>ROTATING HMAC CODE: {currentCode || '••••••••'}</Text>
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsRow}>
          <TouchableOpacity
            style={styles.metricCard}
            onPress={handleOpenAttendees}
            activeOpacity={0.8}
          >
            <Text style={styles.metricLabel}>ATTENDEES</Text>
            <Text style={styles.metricValue}>{attendeeCount}</Text>
            <Text style={styles.metricSub}>Tap to view list →</Text>
          </TouchableOpacity>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>CLOSES IN</Text>
            <Text style={[styles.metricValue, { color: Colors.skinTone }]}>{timeLeft}</Text>
            <Text style={styles.metricSub}>Auto-lock timer</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <Button
            title="VIEW ATTENDEE ROSTER"
            variant="outline"
            onPress={handleOpenAttendees}
          />

          <Button
            title="END SESSION NOW"
            variant="primary"
            onPress={handleEndSession}
            loading={ending}
            style={{ backgroundColor: Colors.bridalDark, borderColor: Colors.error }}
            textStyle={{ color: Colors.error }}
          />
        </View>
      </ScrollView>

      {/* Attendee Roster Modal */}
      <Modal
        visible={attendeesModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAttendeesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Attendee Roster</Text>
                <Text style={styles.modalSub}>{attendeesList.length} Verified Present</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAttendeesModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingAttendees ? (
              <ActivityIndicator color={Colors.skinTone} size="large" style={{ marginVertical: 40 }} />
            ) : attendeesList.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>No Scans Yet</Text>
                <Text style={styles.emptySub}>
                  Attendees standing inside your {session?.range_m}m geofence will appear here immediately upon scanning.
                </Text>
              </View>
            ) : (
              <FlatList
                data={attendeesList}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }: { item: any }) => (
                  <View style={styles.attendeeItem}>
                    <View>
                      <Text style={styles.attendeeName}>{item.name || item.attendee_email}</Text>
                      {item.id_number ? (
                        <Text style={styles.attendeeId}>ID: {item.id_number}</Text>
                      ) : null}
                      <Text style={styles.attendeeMeta}>
                        Distance: {item.distance_m}m • {new Date(item.created_at).toLocaleTimeString()}
                      </Text>
                    </View>
                    <Badge label="PRESENT" variant="success" />
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.skinTone,
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  backBtnText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  titleBlock: {
    marginBottom: 20,
  },
  sessionTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  qrCard: {
    backgroundColor: Colors.skinTone,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.bridal,
    shadowColor: Colors.skinTone,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 20,
  },
  qrWrapper: {
    padding: 12,
    backgroundColor: Colors.skinTone,
    borderRadius: 16,
  },
  qrFooterPill: {
    marginTop: 18,
    backgroundColor: Colors.bridal,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  qrFooterText: {
    color: Colors.skinTone,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    padding: 16,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.skinTone,
    marginVertical: 4,
  },
  metricSub: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  buttonGroup: {
    gap: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.skinTone,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bridalDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: Colors.skinTone,
    fontSize: 16,
    fontWeight: '900',
  },
  attendeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  attendeeName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  attendeeId: {
    fontSize: 13,
    color: Colors.skinTone,
    fontWeight: '600',
    marginTop: 2,
  },
  attendeeMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
  },
  emptyTitle: {
    color: Colors.skinTone,
    fontSize: 18,
    fontWeight: '800',
  },
  emptySub: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
});
