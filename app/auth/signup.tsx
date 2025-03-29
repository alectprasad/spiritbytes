import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, 
  KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from 'expo-image-picker';
import { signUp } from "aws-amplify/auth";
import { COLORS, SHADOWS } from "@/app/constants/theme";

export default function SignUpScreen() {
  const router = useRouter();
  // Basic auth info
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Profile info
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [photo, setPhoto] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSignUp = async () => {
    // Basic validation
    if (!email || !password || !confirmPassword || !name) {
      Alert.alert("Error", "Please fill in all required fields");
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      // Sign up the user with AWS Cognito
      const signUpResponse = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
            // We'll store additional attributes like age and gender in custom attributes
            'custom:age': age,
            'custom:gender': gender,
          },
          autoSignIn: false,
        },
      });

      // If we had a photo, we would upload it here
      // This is just a placeholder for now
      if (photo) {
        // For demonstration - in a real app you would need to implement this part
        // await Storage.put(`profile-${email}.jpg`, photoBlob, {
        //   contentType: 'image/jpeg',
        // });
        console.log("Would upload photo:", photo);
      }

      // Navigate to verification page
      router.push({
        pathname: "/auth/verify",
        params: { email }
      });
    } catch (error: any) {
      console.log("Sign up error", error);
      Alert.alert("Error", error.message || "Failed to create account");
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
            <View className="items-center mb-6 mt-4">
              <Image 
                source={require("@/assets/images/logo.png")}
                className="w-20 h-20"
                resizeMode="contain"
              />
              <Text className="text-3xl font-serif text-center">
                SpiritBytes
              </Text>
            </View>

            <Text className="text-2xl font-serif text-center mb-4">
              Tell Me About Yourself
            </Text>
            
            {/* Profile Image */}
            <View className="items-center mb-6">
              <TouchableOpacity 
                onPress={pickImage}
                className="relative"
              >
                <View className="w-28 h-28 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
                  {photo ? (
                    <Image 
                      source={{ uri: photo }} 
                      className="w-full h-full" 
                    />
                  ) : (
                    <View className="items-center justify-center">
                      <Text className="text-5xl text-gray-400">👤</Text>
                    </View>
                  )}
                </View>
                <View className="absolute bottom-0 right-0 bg-gray-800 rounded-full p-2">
                  <Text className="text-xl">📷</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Name */}
            <View className="w-full mb-3">
              <Text className="text-gray-600 ml-4 mb-1">Name</Text>
              <TextInput
                className="w-full h-14 px-4 border border-gray-300 rounded-full text-lg" 
                placeholderTextColor="#666666"
                placeholder="" placeholderTextColor="#666666"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Age and Gender */}
            <View className="flex-row justify-between mb-3">
              <View className="w-[45%]">
                <Text className="text-gray-600 ml-4 mb-1">Age</Text>
                <TextInput
                  className="w-full h-14 px-4 border border-gray-300 rounded-full text-lg"
                  placeholder="" placeholderTextColor="#666666"
                  keyboardType="number-pad"
                  value={age}
                  onChangeText={setAge}
                />
              </View>

              <View className="w-[52%]">
                <Text className="text-gray-600 ml-4 mb-1">Gender</Text>
                <TextInput
                  className="w-full h-14 px-4 border border-gray-300 rounded-full text-lg"
                  placeholder="" placeholderTextColor="#666666"
                  value={gender}
                  onChangeText={setGender}
                />
              </View>
            </View>

            {/* Email */}
            <View className="w-full mb-3">
              <Text className="text-gray-600 ml-4 mb-1">Email Address</Text>
              <TextInput
                className="w-full h-14 px-4 border border-gray-300 rounded-full text-lg"
                placeholder="" placeholderTextColor="#666666"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password */}
            <View className="w-full mb-3">
              <Text className="text-gray-600 ml-4 mb-1">Password</Text>
              <TextInput
                className="w-full h-14 px-4 border border-gray-300 rounded-full text-lg"
                placeholder="" placeholderTextColor="#666666"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Confirm Password */}
            <View className="w-full mb-5">
              <Text className="text-gray-600 ml-4 mb-1">Confirm Password</Text>
              <TextInput
                className="w-full h-14 px-4 border border-gray-300 rounded-full text-lg"
                placeholder="" placeholderTextColor="#666666"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* Sign Up Button */}
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
                <View className="flex-row items-center">
                  <Text className="text-white text-lg mr-2">Continue</Text>
                  <Text className="text-white text-2xl">→</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row justify-center items-center mt-4">
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