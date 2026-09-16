import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { Colors } from '../theme/colors';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { apiClient } from '../api/client';

export const HostSetupScreen = ({ navigation }: { navigation: any }) => {
  const [title, setTitle] = useState('');
  const [rangeM, setRangeM] = useState('50');
  const [timeoutMinutes, setTimeoutMinutes] = useState('60');
  const [rotationSeconds, setRotationSeconds] = useState('30');
  const [collectName, setCollectName] = useState(true);
  const [collectId, setCollectId] = useState(true);
  const [idLabel, setIdLabel] = useState('ID / UG number');

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const presetRanges = ['25', '50', '100', '250', '500'];

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please specify a title for the attendance session.');
      return;
    }

    const rangeVal = parseInt(rangeM, 10);
    if (isNaN(rangeVal) || rangeVal < 5 || rangeVal > 1000) {
      Alert.alert('Invalid Range', 'Please enter a valid geofence radius between 5 and 1000 metres.');
      return;
    }

    const timeoutVal = parseInt(timeoutMinutes, 10);
    if (isNaN(timeoutVal) || timeoutVal < 1) {
      Alert.alert('Invalid Time-out', 'Please enter a session time-out of at least 1 minute.');
      return;
    }

    setLoading(true);
    setStatusMessage('Requesting GPS location permission...');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Denied',
          'GPS location access is required to define the classroom geofence centre.'
        );
        setLoading(false);
        setStatusMessage(null);
        return;
      }

      setStatusMessage('Acquiring high-accuracy GPS coordinates...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setStatusMessage('Creating session on server...');
      const payload = {
        title: title.trim(),
        range_m: rangeVal,
        timeout_minutes: timeoutVal,
        rotation_seconds: parseInt(rotationSeconds, 10) || 30,
        collect_name: collectName,
        collect_id: collectId,
        id_label: idLabel.trim() || 'ID / UG number',
        latitude: location.coords.latitude.toFixed(6),
        longitude: location.coords.longitude.toFixed(6),
      };

      const response = await apiClient.post('/sessions/', payload);
      const createdSession = response.data.session;

      navigation.replace('ActiveSession', { sessionId: createdSession.id });
    } catch (err: any) {
      console.error('Session creation error:', err);
      const errMsg =
        err.response?.data?.error?.message ||
        'Failed to create session. Please ensure your device GPS is active and the server is reachable.';
      Alert.alert('Creation Failed', errMsg);
    } finally {
      setLoading(false);
      setStatusMessage(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← BACK</Text>
          </TouchableOpacity>
          <Badge label="HOST SETUP" variant="skin" />
        </View>

        <Text style={styles.title}>Host a Session</Text>
        <Text style={styles.subtitle}>
          Configure your class parameters. Your current GPS position will be anchored as the geofence centre.
        </Text>

        {/* Form Fields */}
        <View style={styles.card}>
          <Input
            label="Class or Session Title *"
            placeholder="e.g. CS101 Lecture 12"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.fieldLabel}>GEOFENCE RADIUS (METRES)</Text>
          <View style={styles.presetRow}>
            {presetRanges.map((val) => (
              <TouchableOpacity
                key={val}
                style={[
                  styles.presetPill,
                  rangeM === val && styles.presetPillActive,
                ]}
                onPress={() => setRangeM(val)}
              >
                <Text
                  style={[
                    styles.presetPillText,
                    rangeM === val && styles.presetPillTextActive,
                  ]}
                >
                  {val}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Input
            placeholder="Custom metres (e.g. 75)"
            value={rangeM}
            onChangeText={setRangeM}
            keyboardType="numeric"
          />

          <View style={styles.rowInputs}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Timeout (mins)"
                placeholder="60"
                value={timeoutMinutes}
                onChangeText={setTimeoutMinutes}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="QR Rotation (sec)"
                placeholder="30"
                value={rotationSeconds}
                onChangeText={setRotationSeconds}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Attendee Requirements */}
          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
            DATA TO COLLECT FROM ATTENDEES
          </Text>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>Collect Full Name</Text>
              <Text style={styles.switchSub}>Requires attendee's legal name</Text>
            </View>
            <Switch
              value={collectName}
              onValueChange={setCollectName}
              trackColor={{ false: '#3A131C', true: Colors.bridalLight }}
              thumbColor={collectName ? Colors.skinTone : '#7A5059'}
            />
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>Collect Student / Staff ID</Text>
              <Text style={styles.switchSub}>Requires official identifier</Text>
            </View>
            <Switch
              value={collectId}
              onValueChange={setCollectId}
              trackColor={{ false: '#3A131C', true: Colors.bridalLight }}
              thumbColor={collectId ? Colors.skinTone : '#7A5059'}
            />
          </View>

          {collectId && (
            <Input
              label="ID Field Label"
              placeholder="e.g. Matric / Student Number"
              value={idLabel}
              onChangeText={setIdLabel}
            />
          )}
        </View>

        {statusMessage && (
          <View style={styles.statusBox}>
            <ActivityIndicator color={Colors.skinTone} size="small" style={{ marginRight: 10 }} />
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        )}

        <Button
          title="START SESSION & GENERATE QR"
          variant="secondary"
          onPress={handleSubmit}
          loading={loading}
          style={{ marginTop: 16 }}
        />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.bridalLight,
  },
  backButtonText: {
    color: Colors.skinTone,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.skinTone,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    padding: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.skinTone,
    letterSpacing: 1,
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  presetPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: Colors.bridalLight,
    alignItems: 'center',
    backgroundColor: '#1E070F',
  },
  presetPillActive: {
    backgroundColor: Colors.skinTone,
    borderColor: Colors.bridal,
  },
  presetPillText: {
    color: Colors.skinTone,
    fontSize: 12,
    fontWeight: '700',
  },
  presetPillTextActive: {
    color: Colors.bridal,
  },
  rowInputs: {
    flexDirection: 'row',
    width: '100%',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  switchTitle: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  switchSub: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 198, 168, 0.1)',
    borderWidth: 1,
    borderColor: Colors.skinTone,
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  statusText: {
    color: Colors.skinTone,
    fontSize: 13,
    fontWeight: '600',
  },
});
