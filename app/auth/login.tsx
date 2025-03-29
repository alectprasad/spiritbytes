import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { signIn } from "aws-amplify/auth";
import { COLORS, SHADOWS } from "@/app/constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
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
      if (error.name === "UserNotConfirmedException") {
        router.push({
          pathname: "/auth/verify",
          params: { email }
        });
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
                placeholder="example@email.com"
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
                placeholder="Enter your password"
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