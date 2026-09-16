import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { Colors } from '../theme/colors';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { BrandIcon } from '../components/BrandIcon';

export const HomeScreen = ({ navigation }: { navigation: any }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.container}>
        {/* Top Half: Skin Tone Warm Luxe Section */}
        <View style={styles.topSection}>
          <View style={styles.headerPillRow}>
            <Text style={styles.miniLabel}>GEO-FENCED VERIFICATION</Text>
            <Badge label="ANTI-PROXY" variant="bridal" />
          </View>

          <View style={styles.brandTitleContainer}>
            <Text style={styles.heroTitle}>GEO-QR</Text>
            <Text style={styles.heroSubtitle}>ATTENDANCE</Text>
          </View>

          <View style={styles.pillRow}>
            <Badge label="HEX" value="#FFC6A8" variant="bridal" />
            <Badge label="RADIUS" value="GPS" variant="bridal" />
          </View>
        </View>

        {/* Center Circular Badge with Brand Icon */}
        <View style={styles.centerCircle}>
          <BrandIcon size={48} />
          <Text style={styles.centerCircleText}>PRESENCE</Text>
        </View>

        {/* Bottom Half: Bridal Wine Section */}
        <View style={styles.bottomSection}>
          <View style={styles.contentContainer}>
            <Text style={styles.tagline}>
              Attendance recorded only when QR rotation and physical GPS proximity align.
            </Text>

            <View style={styles.buttonGroup}>
              <Button
                title="GET STARTED — SIGN UP"
                variant="secondary"
                onPress={() => navigation.navigate('SignUp')}
              />
              <Button
                title="I ALREADY HAVE AN ACCOUNT"
                variant="outline"
                onPress={() => navigation.navigate('Login')}
              />
            </View>

            <View style={styles.footerRow}>
              <Badge label="HEX" value="#741A2F" variant="skin" />
              <Text style={styles.footerNote}>Expo Go Ready</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.skinTone,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  topSection: {
    flex: 1.1,
    backgroundColor: Colors.skinTone,
    paddingHorizontal: 24,
    paddingTop: 30,
    justifyContent: 'space-between',
    paddingBottom: 50,
  },
  headerPillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: Colors.bridal,
  },
  brandTitleContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  heroTitle: {
    fontSize: 52,
    fontWeight: '900',
    color: Colors.bridal,
    letterSpacing: -1,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.bridal,
    letterSpacing: 6,
    textAlign: 'center',
  },
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  centerCircle: {
    position: 'absolute',
    top: '48%',
    left: '50%',
    marginLeft: -60,
    marginTop: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0F0306',
    borderWidth: 3,
    borderColor: Colors.skinTone,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  centerCircleText: {
    color: Colors.skinTone,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  centerCircleSub: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  bottomSection: {
    flex: 1.2,
    backgroundColor: Colors.bridal,
    paddingHorizontal: 24,
    paddingTop: 65,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  tagline: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.skinToneLight,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  buttonGroup: {
    width: '100%',
    gap: 4,
    marginVertical: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerNote: {
    color: Colors.skinTone,
    fontSize: 12,
    fontWeight: '600',
  },
});
