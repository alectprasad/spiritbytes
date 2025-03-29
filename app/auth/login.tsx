import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { signIn, fetchAuthSession } from "aws-amplify/auth";
import { COLORS, SHADOWS } from "@/app/constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is already authenticated on component mount
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    setIsCheckingAuth(true);
    try {
      const session = await fetchAuthSession();
      if (session.tokens) {
        // User is already authenticated, redirect to home
        router.replace("/app/home");
        return true;
      }
      return false;
    } catch (error) {
      // No active session
      return false;
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      // Check if user is already signed in
      const isAuthenticated = await checkAuthState();
      if (isAuthenticated) return;

      // Proceed with sign in if not authenticated
      const signInResponse = await signIn({
        username: email,
        password: password,
      });

      if (signInResponse.isSignedIn) {
        router.replace("/app/home");
      } else if (signInResponse.nextStep.signInStep === "CONFIRM_SIGN_UP") {
        // User needs to confirm their account
        router.push({
          pathname: "/auth/verify",
          params: { email }
        });
      }
    } catch (error: any) {
      console.log("Sign in error", error);
      console.log("Error name:", error.name);
      console.log("Error message:", error.message);
      
      if (error.name === "UserNotConfirmedException") {
        router.push({
          pathname: "/auth/verify",
          params: { email }
        });
      } else if (error.name === "UserAlreadyAuthenticatedException") {
        // User is already signed in, redirect to home
        router.replace("/app/home");
      } else {
        Alert.alert("Error", error.message || "Failed to sign in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    router.push("/auth/signup");
  };

  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={COLORS.forestGreen} />
        <Text style={{ marginTop: 20, fontSize: 16, color: COLORS.darkGray }}>Checking login status...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
            <View className="items-center mb-10 mt-8">
              <Image 
                source={require("@/assets/images/logo.png")}
                className="w-24 h-24"
                resizeMode="contain"
              />
              <Text className="text-4xl font-serif text-center mt-2">
                SpiritBytes
              </Text>
            </View>

            <Text className="text-2xl font-serif text-center mb-8">
              Login to your account
            </Text>

            <View className="w-full mb-4">
              <Text className="text-gray-600 ml-4 mb-1">Email Address</Text>
              <TextInput
                className="w-full h-14 px-4 border border-gray-300 rounded-full text-lg"
                placeholder=""
                placeholderTextColor="#666666"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View className="w-full mb-8">
              <Text className="text-gray-600 ml-4 mb-1">Password</Text>
              <TextInput
                className="w-full h-14 px-4 border border-gray-300 rounded-full text-lg"
                placeholder=""
                placeholderTextColor="#666666"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              onPress={handleSignIn}
              disabled={isLoading}
              className={`w-full h-14 rounded-full items-center justify-center flex-row ${isLoading ? "bg-opacity-70" : ""}`}
              style={{ 
                backgroundColor: COLORS.forestGreen,
                ...SHADOWS.button
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text className="text-white text-lg mr-2">Continue</Text>
                  <Text className="text-white text-2xl">→</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSignUp}
              className="w-full h-14 rounded-full items-center justify-center mt-4 bg-gray-400"
              style={SHADOWS.button}
            >
              <Text className="text-white text-lg">Sign Up</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}