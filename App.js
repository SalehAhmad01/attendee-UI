import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/auth/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AnimatedSplash } from './src/components/AnimatedSplash';

export default function App() {
  return (
    <SafeAreaProvider>
      <AnimatedSplash>
        <AuthProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </AuthProvider>
      </AnimatedSplash>
    </SafeAreaProvider>
  );
}
