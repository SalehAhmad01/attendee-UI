import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { Colors } from '../theme/colors';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { HostSetupScreen } from '../screens/HostSetupScreen';
import { ActiveSessionScreen } from '../screens/ActiveSessionScreen';
import { ScanAttendScreen } from '../screens/ScanAttendScreen';
import { ConfirmationScreen } from '../screens/ConfirmationScreen';
import { MyAttendanceScreen } from '../screens/MyAttendanceScreen';

const Stack: any = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.skinTone} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        {user ? (
          // Authenticated Stack
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="HostSetup" component={HostSetupScreen} />
            <Stack.Screen name="ActiveSession" component={ActiveSessionScreen} />
            <Stack.Screen name="ScanAttend" component={ScanAttendScreen} />
            <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
            <Stack.Screen name="MyAttendance" component={MyAttendanceScreen} />
          </>
        ) : (
          // Unauthenticated Stack
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
