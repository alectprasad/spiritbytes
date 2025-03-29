import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, 
  Platform, ScrollView, SafeAreaView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { updateUserAttributes, signIn } from "aws-amplify/auth";
import { COLORS, SHADOWS } from "@/app/constants/theme";

export default function FoodPreferencesScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [allergens, setAllergens] = useState("");
  
  // Diet preferences state
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  
  // Diet options
  const dietOptions = [
    "Vegetarian", 
    "Vegan", 
    "Gluten Free", 
    "High Protein", 
    "Low Carb", 
    "Low Fat"
  ];
  
  const toggleDiet = (diet: string) => {
    if (selectedDiets.includes(diet)) {
      setSelectedDiets(selectedDiets.filter(item => item !== diet));
    } else {
      setSelectedDiets([...selectedDiets, diet]);
    }
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      // Update user attributes with food preferences
      await updateUserAttributes({
        userAttributes: {
          'custom:diet': selectedDiets.join(','),
          'custom:allergens': allergens
        }
      });
      
      console.log("Diet preferences saved:", selectedDiets);
      console.log("Allergens saved:", allergens);
      
      // Navigate to home screen
      router.replace("/app/home");
    } catch (error) {
      console.log("Error saving preferences:", error);
      // If we encounter an error, we'll still let the user proceed
      router.replace("/app/home");
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
            <View className="flex-1">
              <Text className="text-3xl font-serif mb-8 mt-8">
                Tell Me About Your Food Preferences
              </Text>
              
              {/* Diet Preferences */}
              <Text className="text-xl font-medium mb-4">Diet</Text>
              <View className="flex-row flex-wrap mb-8">
                {dietOptions.map((diet) => (
                  <TouchableOpacity
                    key={diet}
                    onPress={() => toggleDiet(diet)}
                    className={`mr-2 mb-2 px-4 py-3 rounded-full border ${
                      selectedDiets.includes(diet)
                        ? "bg-forest-green border-forest-green"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`${
                        selectedDiets.includes(diet)
                          ? "text-white"
                          : "text-gray-800"
                      }`}
                    >
                      {diet}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Allergens */}
              <Text className="text-xl font-medium mb-4">Allergens</Text>
              <TextInput
                className="w-full h-32 px-4 py-2 border border-gray-300 rounded-2xl text-lg"
                multiline
                value={allergens}
                onChangeText={setAllergens}
                placeholder="List any food allergies or ingredients to avoid"
                placeholderTextColor="#666666"
                textAlignVertical="top"
              />

              {/* Navigation Buttons */}
              <View className="flex-row justify-between mt-auto mb-4 pt-12">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="w-[45%] h-14 rounded-full items-center justify-center bg-gray-400"
                  style={SHADOWS.button}
                >
                  <View className="flex-row items-center">
                    <Text className="text-white text-lg mr-2">Go Back</Text>
                    <Text className="text-white text-2xl">←</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleContinue}
                  disabled={isLoading}
                  className={`w-[52%] h-14 rounded-full items-center justify-center ${isLoading ? "bg-opacity-70" : ""}`}
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
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}