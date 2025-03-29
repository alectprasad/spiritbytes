import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, 
  Platform, ScrollView, SafeAreaView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from "expo-status-bar";
import { FoodPreferencesService } from "@/app/services/FoodPreferencesService";
import { logAllStorageKeys, logPreferenceValues } from '@/app/utils/PreferencesDebug';
import { COLORS, SHADOWS } from "@/app/constants/theme";

export default function FoodPreferencesScreen() {
  const router = useRouter();
  const { fromSettings } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
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
  
  // Fetch user's existing preferences when component mounts AND when screen comes into focus
  useEffect(() => {
    fetchUserPreferences();
  }, []);
  
  // This will run every time the screen comes into focus (like when navigating back from another screen)
  useFocusEffect(
    React.useCallback(() => {
      console.log("Food preferences screen focused - refreshing data");
      
      // Debug: log what's in storage before fetching
      const debugStorage = async () => {
        await logAllStorageKeys();
        await logPreferenceValues();
      };
      debugStorage();
      
      // Now fetch and display preferences
      fetchUserPreferences();
      
      return () => {
        // cleanup if needed
      };
    }, [])
  );

  const fetchUserPreferences = async () => {
    setIsFetching(true);
    try {
      // First try to load from local storage for immediate display
      const localPrefs = await FoodPreferencesService.getLocalPreferences();
      setSelectedDiets(localPrefs.diets);
      setAllergens(localPrefs.allergens);
      
      console.log("Loaded preferences from local storage:", localPrefs);
      
      // Then fetch from Cognito to ensure data is up-to-date
      const cognitoPrefs = await FoodPreferencesService.fetchFromCognito();
      setSelectedDiets(cognitoPrefs.diets);
      setAllergens(cognitoPrefs.allergens);
      
      console.log("Fetched preferences from Cognito:", cognitoPrefs);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      Alert.alert(
        "Error", 
        "Failed to load your preferences. You can still update them."
      );
    } finally {
      setIsFetching(false);
    }
  };
  
  const toggleDiet = (diet: string) => {
    if (selectedDiets.includes(diet)) {
      setSelectedDiets(selectedDiets.filter(item => item !== diet));
    } else {
      setSelectedDiets([...selectedDiets, diet]);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Create preferences object
      const preferences = {
        diets: selectedDiets,
        allergens: allergens
      };
      
      console.log("Saving preferences:", preferences);
      
      // Use the service to save to both local storage and Cognito
      await FoodPreferencesService.savePreferences(preferences);
      
      console.log("Food preferences saved successfully");
      
      // Debug: verify saved data in storage
      await logPreferenceValues();
      
      Alert.alert(
        "Success",
        "Your food preferences have been updated.",
        [
          { 
            text: "OK", 
            onPress: () => {
              // If coming from settings, go back to settings
              if (fromSettings === 'true') {
                console.log("Navigating back to settings");
                router.back();
              } else {
                // If coming from signup flow, go to home
                console.log("Navigating to home");
                router.replace("/app/home");
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error saving preferences:", error);
      // Check if we need to handle offline case
      try {
        // Try to save just to local storage if Cognito update failed
        await FoodPreferencesService.saveLocalPreferences({
          diets: selectedDiets,
          allergens: allergens
        });
        
        // Debug: verify local save
        await logPreferenceValues();
        
        Alert.alert(
          "Partially Saved",
          "Your preferences were saved locally but couldn't be synced to your account. They will sync when you're back online.",
          [
            { 
              text: "OK", 
              onPress: () => {
                if (fromSettings === 'true') {
                  router.back();
                } else {
                  router.replace("/app/home");
                }
              }
            }
          ]
        );
      } catch (localError) {
        // Complete failure - couldn't save anywhere
        console.error("Local save failed:", localError);
        Alert.alert("Error", "Failed to save your preferences. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Determine button text based on context
  const continueButtonText = fromSettings === 'true' ? 'Save Changes' : 'Continue';

  if (isFetching) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={COLORS.forestGreen} />
        <Text style={{ marginTop: 20, fontSize: 16, color: COLORS.darkGray }}>Loading your preferences...</Text>
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
            <View className="flex-1">
              <Text className="text-3xl font-serif mb-8 mt-8">
                Your Food Preferences
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
                    <Text className="text-white text-lg mr-2">Cancel</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
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
                      <Text className="text-white text-lg mr-2">{continueButtonText}</Text>
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