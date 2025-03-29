import { Stack } from "expo-router";
import { useEffect } from "react";
import { Amplify } from 'aws-amplify';
import "./global.css";

// Configure Amplify
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
        animation: "none",
        gestureEnabled: false,
      }}
    />
  );
}