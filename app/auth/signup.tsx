import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { signUp } from "aws-amplify/auth";
import { COLORS, SHADOWS } from "@/app/constants/theme";

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
          autoSignIn: false,
        },
      });

      // Navigate to verification page
      router.push({
        pathname: "/auth/verify",
        params: { email }
      });
    } catch (error: any) {
      console.log("Sign up error", error);
      Alert.alert("Error", error.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
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
            <View className="items-center mb-6 mt-8">
              <Image 
                source={require("@/assets/images/logo.png")}
                className="w-20 h-20"
                resizeMode="contain"
              />
              <Text className="text-3xl font-serif text-center">
                SpiritBytes
              </Text>
            </View>

            <Text className="text-2xl font-serif text-center mb-8">
              Create new account
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

            <View className="w-full mb-4">
              <Text className="text-gray-600 ml-4 mb-1">Password</Text>
              <TextInput
                className="w-full h-14 px-4 border border-gray-300 rounded-full text-lg"
                placeholder="Min. 8 characters"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View className="w-full mb-8">
              <Text className="text-gray-600 ml-4 mb-1">Confirm Password</Text>
              <TextInput
                className="w-full h-14 px-4 border border-gray-300 rounded-full text-lg"
                placeholder="Re-enter your password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              onPress={handleSignUp}
              disabled={isLoading}
              className={`w-full h-14 rounded-full items-center justify-center ${isLoading ? "bg-opacity-70" : ""}`}
              style={{ 
                backgroundColor: COLORS.forestGreen,
                ...SHADOWS.button
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white text-lg">Sign Up</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace("/auth/login")}>
                <Text className="font-bold" style={{ color: COLORS.forestGreen }}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}