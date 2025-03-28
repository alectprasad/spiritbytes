import { Stack } from "expo-router";
import { useEffect } from "react";
import { Amplify } from 'aws-amplify';
import "./global.css";

// Import AWS config if needed
// import awsconfig from '@/aws-exports';

// Configure Amplify
// If using @aws-exports file:
// Amplify.configure(awsconfig);

// If using manual configuration:
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID || '',
      userPoolClientId: process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID || '',
      identityPoolId: process.env.EXPO_PUBLIC_IDENTITY_POOL_ID || '',
      region: process.env.EXPO_PUBLIC_REGION || 'us-east-2',
    },
  },
});

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="login" />
      <Stack.Screen name="verify" />
      <Stack.Screen 
        name="home" 
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}