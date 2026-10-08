import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { COLORS } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="job/[id]"
            options={{
              headerShown: true,
              headerTitle: 'Job Details',
              headerTintColor: COLORS.text,
              headerStyle: { backgroundColor: COLORS.card },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="employer/index"
            options={{
              headerShown: true,
              headerTitle: 'Employer Hub',
              headerTintColor: COLORS.text,
              headerStyle: { backgroundColor: COLORS.card },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="employer/post-job"
            options={{
              headerShown: true,
              headerTitle: 'Post a New Job',
              headerTintColor: COLORS.text,
              headerStyle: { backgroundColor: COLORS.card },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="employer/applicants/[id]"
            options={{
              headerShown: true,
              headerTitle: 'Job Applicants',
              headerTintColor: COLORS.text,
              headerStyle: { backgroundColor: COLORS.card },
              headerShadowVisible: false,
            }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
