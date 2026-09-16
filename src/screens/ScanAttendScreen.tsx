import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Colors } from '../theme/colors';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { apiClient } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.72;

export const ScanAttendScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuth();

  const [permission, requestPermission] = useCameraPermissions();
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Align the session QR within frame');

  // Attendee Info Prompt Modal (if session requires name / id)
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState<string>('');
  const [pendingCode, setPendingCode] = useState<string>('');
  const [pendingLocation, setPendingLocation] = useState<any>(null);

  const [name, setName] = useState(user?.full_name || '');
  const [idNumber, setIdNumber] = useState('');
  const [idLabel, setIdLabel] = useState('ID / UG Number');

  // Debouncing scanner
  const lastScannedPayload = useRef<string | null>(null);
  const lastScannedTime = useRef<number>(0);

  useEffect(() => {
    (async () => {
      const locStatus = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(locStatus.status === 'granted');
    })();
  }, []);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    const now = Date.now();
    // Debounce 4 seconds for identical payload
    if (data === lastScannedPayload.current && now - lastScannedTime.current < 4000) {
      return;
    }

    if (isProcessing) return;

    lastScannedPayload.current = data;
    lastScannedTime.current = now;

    // Expected QR payload format: "<session_id>:<code>"
    const parts = data.trim().split(':');
    if (parts.length !== 2) {
      setStatusMessage('Invalid QR format. Please scan a valid Geo-QR code.');
      return;
    }

    const [sessionId, code] = parts;
    setIsProcessing(true);
    setStatusMessage('Acquiring high-accuracy GPS & anti-mock guard...');

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Android mock location check
      const isMocked = (location as any).mocked === true;

      // Inspect session requirements
      setStatusMessage('Verifying session parameters...');
      const sessionRes = await apiClient.get(`/sessions/${sessionId}/`);
      const sessionData = sessionRes.data.session;

      if (sessionData.id_label) {
        setIdLabel(sessionData.id_label);
      }

      // If session requires name or id, prompt user modal if missing
      const needsName = sessionData.collect_name && !name.trim();
      const needsId = sessionData.collect_id && !idNumber.trim();

      if (needsName || needsId) {
        setPendingSessionId(sessionId);
        setPendingCode(code);
        setPendingLocation(location);
        setIsProcessing(false);
        setInfoModalVisible(true);
        return;
      }

      // Submit attendance directly
      await submitAttendance(sessionId, code, location, name, idNumber);
    } catch (err: any) {
      setIsProcessing(false);
      handleScanError(err);
    }
  };

  const submitAttendance = async (
    sessionId: string,
    code: string,
    location: any,
    attendeeName: string,
    attendeeId: string
  ) => {
    setStatusMessage('Validating geofence & anti-proxy credentials...');
    try {
      const payload = {
        session_id: sessionId,
        code: code,
        latitude: location.coords.latitude.toFixed(6),
        longitude: location.coords.longitude.toFixed(6),
        mocked: (location as any).mocked === true,
        name: attendeeName.trim(),
        id_number: attendeeId.trim(),
      };

      const response = await apiClient.post('/attendance/', payload);
      const record = response.data.attendance;

      setIsProcessing(false);
      navigation.replace('Confirmation', {
        success: true,
        record: record,
      });
    } catch (err: any) {
      setIsProcessing(false);
      handleScanError(err);
    }
  };

  const handleModalSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please provide your full name.');
      return;
    }
    if (!idNumber.trim()) {
      Alert.alert('Required Field', `Please provide your ${idLabel}.`);
      return;
    }

    setInfoModalVisible(false);
    setIsProcessing(true);
    await submitAttendance(pendingSessionId, pendingCode, pendingLocation, name, idNumber);
  };

  const handleScanError = (err: any) => {
    const errData = err.response?.data?.error;
    const errorCode = errData?.code || 'ERROR';
    const message = errData?.message || err.message || 'Verification failed.';

    navigation.replace('Confirmation', {
      success: false,
      errorCode,
      message,
      detail: errData?.detail,
    });
  };

  if (!permission || hasLocationPermission === null) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator color={Colors.skinTone} size="large" />
        <Text style={styles.permissionText}>Checking hardware sensors & permissions...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered, { padding: 24 }]}>
        <Badge label="CAMERA REQUIRED" variant="error" />
        <Text style={styles.noPermTitle}>Camera Permission Required</Text>
        <Text style={styles.noPermSub}>
          Geo-QR Attendance needs camera access to scan rotating QR codes displayed by the session host.
        </Text>
        <Button
          title="GRANT CAMERA ACCESS"
          variant="secondary"
          onPress={requestPermission}
          style={{ marginTop: 20 }}
        />
        <Button
          title="RETURN TO DASHBOARD"
          variant="outline"
          onPress={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>✕ CANCEL</Text>
          </TouchableOpacity>
          <Badge label="GPS PROTECTED" variant="bridal" />
        </View>

        {/* Camera Viewfinder */}
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={isProcessing ? undefined : handleBarcodeScanned}
          />

          {/* Luxury Reticle Scanner Overlay */}
          <View style={styles.overlayCenter}>
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </View>

        {/* Bottom Status Card */}
        <View style={styles.bottomCard}>
          <View style={styles.statusPill}>
            {isProcessing ? (
              <ActivityIndicator color={Colors.bridal} size="small" style={{ marginRight: 8 }} />
            ) : (
              <Text style={styles.statusDot}>●</Text>
            )}
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>

          <Text style={styles.instructionNote}>
            Ensure you are within the classroom geofence radius set by your host.
          </Text>
        </View>
      </View>

      {/* Required Attendee Information Modal */}
      <Modal
        visible={infoModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Attendee Details</Text>
            <Text style={styles.modalSub}>
              This session host requires attendee identification for verified records.
            </Text>

            <Input
              label="Full Name"
              placeholder="e.g. Alex Turner"
              value={name}
              onChangeText={setName}
            />

            <Input
              label={idLabel}
              placeholder="e.g. UG2024-5512"
              value={idNumber}
              onChangeText={setIdNumber}
            />

            <Button
              title="SUBMIT ATTENDANCE"
              variant="secondary"
              onPress={handleModalSubmit}
              style={{ marginTop: 12 }}
            />

            <Button
              title="CANCEL"
              variant="ghost"
              onPress={() => setInfoModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  permissionText: {
    color: Colors.skinTone,
    marginTop: 14,
    fontSize: 14,
  },
  noPermTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.skinTone,
    marginTop: 16,
    textAlign: 'center',
  },
  noPermSub: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  topHeader: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    backgroundColor: 'rgba(26, 7, 13, 0.85)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.skinTone,
  },
  backBtnText: {
    color: Colors.skinTone,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlayCenter: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: Colors.skinTone,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  bottomCard: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.skinTone,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusDot: {
    color: Colors.bridal,
    fontSize: 14,
    marginRight: 8,
  },
  statusText: {
    color: Colors.bridal,
    fontSize: 13,
    fontWeight: '800',
  },
  instructionNote: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.skinTone,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
});
