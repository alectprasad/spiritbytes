import React from "react";
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { signOut } from "aws-amplify/auth";
import { COLORS } from "@/app/constants/theme";

export default function HomeScreen() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightGray }}>
      <StatusBar style="dark" />
      <ScrollView>
        <View className="p-6">
          <Text className="text-3xl font-serif mb-4">Welcome to SpiritBytes</Text>
          <Text className="text-lg mb-6">You have successfully logged in!</Text>

          <TouchableOpacity
            onPress={handleSignOut}
            className="p-4 rounded-lg"
            style={{ backgroundColor: COLORS.forestGreen }}
          >
            <Text className="text-white text-center text-lg">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}