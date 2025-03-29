import { StorageService } from "@/app/services/StorageService";import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "@/app/components/Navbar";
import { COLORS, SHADOWS } from "@/app/constants/theme";
import { RecipeDetailService, RecipeDetails } from "@/app/services/RecipeDetailService";

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id = "1", recipeTitle = "Recipe", mood = "Calm", color = COLORS.sandBeige } = useLocalSearchParams();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipeData, setRecipeData] = useState<RecipeDetails | null>(null);

  // Fetch recipe details on component mount
  useEffect(() => {
    // Check first if this is a saved recipe
    const checkSavedRecipe = async () => {
      try {
        const savedRecipe = await StorageService.getSavedRecipeByTitle(recipeTitle as string);
        if (savedRecipe) {
          // If we have the saved recipe, use its stored details
          setRecipeData(savedRecipe.recipeDetails);
          setIsSaved(true);
          setIsLoading(false);
        } else {
          // Not saved, fetch from OpenAI
          setIsSaved(false);
          fetchRecipeDetails();
        }
      } catch (error) {
        // If error occurs when checking, fetch from OpenAI
        fetchRecipeDetails();
      }
    };
    
    checkSavedRecipe();
  }, []);

  const fetchRecipeDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get detailed recipe from OpenAI service
      const details = await RecipeDetailService.getRecipeDetails(
        recipeTitle as string,
        mood as string
      );
      setRecipeData(details);
    } catch (err) {
      setError("Failed to load recipe details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        // Recipe is already saved, remove it
        await StorageService.removeRecipe(recipeTitle as string);
        setIsSaved(false);
        Alert.alert(
          "Recipe Removed",
          "This recipe has been removed from your favorites."
        );
      } else {
        // Recipe is not saved, save it with full details
        if (recipeData) {
          await StorageService.saveRecipe(
            recipeData, 
            mood as string, 
            color as string
          );
          setIsSaved(true);
          Alert.alert(
            "Recipe Saved",
            "This recipe has been added to your favorites."
          );
        }
      }
    } catch (error) {
      Alert.alert(
        "Error",
        isSaved 
          ? "Failed to remove recipe. Please try again." 
          : "Failed to save recipe. Please try again."
      );
    }
  };

  // Loading state component
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.forestGreen} />
      <Text style={styles.loadingText}>Preparing your recipe...</Text>
    </View>
  );

  // Error state component
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={48} color={COLORS.mediumGray} />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={fetchRecipeDetails}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        {isLoading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{recipeData?.title || recipeTitle}</Text>
            
            {/* Recipe Info Icons */}
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <View style={styles.iconCircle}>
                  <Ionicons name="ribbon-outline" size={24} color="#333" />
                </View>
                <Text style={styles.infoText}>{recipeData?.difficulty || "Easy"}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <View style={styles.iconCircle}>
                  <Ionicons name="time-outline" size={24} color="#333" />
                </View>
                <Text style={styles.infoText}>{recipeData?.time || "15 Minutes"}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <View style={styles.iconCircle}>
                  <Ionicons name="restaurant-outline" size={24} color="#333" />
                </View>
                <Text style={styles.infoText}>{recipeData?.servings || "1 Serving"}</Text>
              </View>
            </View>
            
            {/* Ingredients */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients:</Text>
              <View style={styles.ingredientsList}>
                {recipeData?.ingredients?.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            {/* Instructions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instructions:</Text>
              <View style={styles.instructionsList}>
                {recipeData?.instructions?.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>{index + 1}.</Text>
                    <View style={styles.instructionContent}>
                      <Text style={styles.instructionTitle}>{instruction.title}</Text>
                      <Text style={styles.instructionText}>{instruction.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={20} color="white" />
                <Text style={styles.buttonText}>Go Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Ionicons 
                  name={isSaved ? "heart" : "heart-outline"} 
                  size={20} 
                  color="white" 
                />
                <Text style={styles.buttonText}>
                  {isSaved ? "Saved" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.spacer} />
          </ScrollView>
        )}
      </SafeAreaView>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Serif',
    color: COLORS.darkGray,
    marginTop: 20,
    marginBottom: 25,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 35,
  },
  infoItem: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 15,
  },
  ingredientsList: {
    marginLeft: 5,
  },
  ingredientItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  bullet: {
    fontSize: 18,
    marginRight: 10,
    color: COLORS.darkGray,
  },
  ingredientText: {
    fontSize: 16,
    color: COLORS.darkGray,
    flex: 1,
  },
  instructionsList: {
    marginLeft: 5,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  instructionNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
    color: COLORS.darkGray,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.darkGray,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#A9A9A9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    ...SHADOWS.small,
  },
  saveButton: {
    backgroundColor: COLORS.forestGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    ...SHADOWS.small,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 5,
  },
  spacer: {
    height: 30,
  },
  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.forestGreen,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    ...SHADOWS.small,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});