import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Badge } from '../components/Badge';
import { apiClient } from '../api/client';

export const MyAttendanceScreen = ({ navigation }: { navigation: any }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyAttendance = async () => {
    try {
      const res = await apiClient.get('/attendance/mine/');
      setRecords(res.data.records || []);
    } catch (err) {
      console.warn('Error fetching attendance logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyAttendance();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← BACK</Text>
          </TouchableOpacity>
          <Badge label="MY LOGS" variant="skin" />
        </View>

        <Text style={styles.title}>My Attendance</Text>
        <Text style={styles.subtitle}>
          Verified session check-ins recorded with geofence proximity.
        </Text>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.skinTone} size="large" />
            <Text style={styles.loadingText}>Fetching attendance history...</Text>
          </View>
        ) : records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Attendance Records Yet</Text>
            <Text style={styles.emptySub}>
              Scan an active class QR code from the dashboard to log your first verified attendance.
            </Text>
          </View>
        ) : (
          <FlatList
            data={records}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.skinTone}
              />
            }
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.sessionTitle}>{item.session_title || 'Class Session'}</Text>
                  <Badge
                    label={item.status.toUpperCase()}
                    variant={item.status === 'present' ? 'success' : 'error'}
                  />
                </View>

                <View style={styles.cardBody}>
                  {item.name ? (
                    <Text style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Name: </Text>
                      {item.name}
                    </Text>
                  ) : null}
                  {item.id_number ? (
                    <Text style={styles.metaRow}>
                      <Text style={styles.metaLabel}>ID: </Text>
                      {item.id_number}
                    </Text>
                  ) : null}
                  <Text style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Distance: </Text>
                    {item.distance_m}m from centre
                  </Text>
                  <Text style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Date: </Text>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.bridalLight,
  },
  backBtnText: {
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
    marginBottom: 18,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.skinTone,
    marginTop: 14,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 14,
  },
  emptyTitle: {
    color: Colors.skinTone,
    fontSize: 20,
    fontWeight: '800',
  },
  emptySub: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    padding: 18,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  cardBody: {
    gap: 4,
  },
  metaRow: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
  metaLabel: {
    color: Colors.textMuted,
    fontWeight: '700',
  },
});
