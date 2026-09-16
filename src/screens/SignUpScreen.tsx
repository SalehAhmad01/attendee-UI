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

export const SignUpScreen = ({ navigation }: { navigation: any }) => {
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: { [key: string]: string } = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters long.';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignUp = async () => {
    setServerError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await register(email.trim(), password, fullName.trim());
      // On success, AuthContext sets user and navigator automatically routes to Dashboard
    } catch (err: any) {
      const respData = err.response?.data;
      if (respData?.error?.detail?.email) {
        setServerError(respData.error.detail.email[0]);
      } else if (respData?.error?.message) {
        setServerError(respData.error.message);
      } else {
        setServerError('Registration failed. Check network or server connection.');
      }
    } finally {
      setLoading(false);
    }
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
            <Badge label="NEW ACCOUNT" variant="skin" />
          </View>

          <View style={styles.titleBlock}>
            <BrandIcon size={48} style={{ marginBottom: 14 }} />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Sign up to host attendance sessions or check in via geofenced QR scans.
            </Text>
          </View>

          {serverError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{serverError}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="e.g. Alex Turner"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <Input
              label="Email Address"
              placeholder="student@geoqr.edu"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Password (min. 8 characters)"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button
              title="CREATE MY ACCOUNT"
              variant="secondary"
              onPress={handleSignUp}
              loading={loading}
              style={{ marginTop: 16 }}
            />

            <View style={styles.footerPrompt}>
              <Text style={styles.promptText}>Already registered? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.promptLink}>Log In</Text>
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
  footerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
