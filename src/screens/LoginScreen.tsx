import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { BrandIcon } from '../components/BrandIcon';
import { useAuth } from '../auth/AuthContext';

export const LoginScreen = ({ navigation }: { navigation: any }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setErrorMessage('Invalid credentials. Please verify your email and password.');
      } else if (err.response?.data?.error?.message) {
        setErrorMessage(err.response.data.error.message);
      } else {
        setErrorMessage('Could not connect to the attendance server. Ensure your phone and computer are on the same Wi-Fi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoHost = () => {
    setEmail('host@geoqr.edu');
    setPassword('Host1234!');
  };

  const handleFillDemoStudent = () => {
    setEmail('student@geoqr.edu');
    setPassword('Student1234!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← BACK</Text>
            </TouchableOpacity>
            <Badge label="SECURE ACCESS" variant="skin" />
          </View>

          <View style={styles.titleBlock}>
            <BrandIcon size={48} style={{ marginBottom: 14 }} />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Log in to manage attendance sessions or scan into your active class.
            </Text>
          </View>

          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="user@geoqr.edu"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title="SIGN IN"
              variant="secondary"
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: 16 }}
            />

            {/* Quick Demo Pre-fill Pills */}
            <View style={styles.demoSection}>
              <Text style={styles.demoLabel}>QUICK DEMO ACCOUNTS</Text>
              <View style={styles.demoRow}>
                <TouchableOpacity onPress={handleFillDemoHost} style={styles.demoPill}>
                  <Text style={styles.demoPillText}>Fill Host (Prof)</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleFillDemoStudent} style={styles.demoPill}>
                  <Text style={styles.demoPillText}>Fill Attendee (Student)</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footerPrompt}>
              <Text style={styles.promptText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.promptLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  titleBlock: {
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.skinTone,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    marginTop: 6,
    lineHeight: 22,
  },
  errorBanner: {
    backgroundColor: Colors.errorBg,
    borderColor: Colors.error,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  errorBannerText: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  demoSection: {
    marginTop: 24,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: '#1E070F',
    alignItems: 'center',
  },
  demoLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoPill: {
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.skinTone,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  demoPillText: {
    color: Colors.skinTone,
    fontSize: 12,
    fontWeight: '700',
  },
  footerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  promptText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  promptLink: {
    color: Colors.skinTone,
    fontWeight: '700',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
