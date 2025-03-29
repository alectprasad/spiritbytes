import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { COLORS, SHADOWS } from "@/app/constants/theme";

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = async () => {
    if (!confirmationCode) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    setIsLoading(true);
    try {
      await confirmSignUp({
        username: email as string,
        confirmationCode
      });
      
      // Navigate to food preferences screen
      router.push({
        pathname: "/auth/food-preferences",
        params: { email }
      });
    } catch (error: any) {
      console.log("Verification error", error);
      Alert.alert("Error", error.message || "Failed to verify account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      await resendSignUpCode({
        username: email as string,
      });
      Alert.alert("Success", "A new verification code has been sent to your email");
    } catch (error: any) {
      console.log("Resend code error", error);
      Alert.alert("Error", error.message || "Failed to resend verification code");
    } finally {
      setResendLoading(false);
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
            <View className="flex-1 justify-center">
              <Text className="text-3xl font-serif text-center mb-2 mt-8">
                Verify your account
              </Text>
              
              <Text className="text-center text-gray-600 mb-8">
                Please enter the verification code sent to {email}
              </Text>

              <View className="w-full mb-8">
                <Text className="text-gray-600 ml-4 mb-1">Verification Code</Text>
                <TextInput
                  className="w-full h-14 px-4 border border-gray-300 rounded-full text-lg"
                  placeholder="Enter 6-digit code"
                  keyboardType="number-pad"
                  value={confirmationCode}
                  onChangeText={setConfirmationCode}
                />
              </View>

              <TouchableOpacity
                onPress={handleVerify}
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
                  <Text className="text-white text-lg">Verify</Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center items-center mt-6">
                <Text className="text-gray-600">Didn't receive a code? </Text>
                <TouchableOpacity onPress={handleResendCode} disabled={resendLoading}>
                  {resendLoading ? (
                    <ActivityIndicator size="small" color={COLORS.forestGreen} />
                  ) : (
                    <Text className="font-bold" style={{ color: COLORS.forestGreen }}>
                      Resend
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                onPress={() => router.back()}
                className="mt-8 items-center"
              >
                <Text className="text-gray-600">Back</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}