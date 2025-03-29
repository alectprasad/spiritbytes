import React, { useState } from "react";
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "@/app/components/Navbar";
import { COLORS, SHADOWS } from "@/app/constants/theme";

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id = "1", recipeTitle = "Banana & Peanut Butter Toast" } = useLocalSearchParams();
  const [isSaved, setIsSaved] = useState(false);

  // This would come from a database in a real app
  // Here we're just hardcoding a sample recipe
  const recipeData = {
    title: recipeTitle as string,
    difficulty: "Very Easy",
    time: "5 Minutes",
    servings: "1 Serving",
    ingredients: [
      "1 slice of bread",
      "1 tablespoon peanut butter",
      "½ banana, sliced into rounds",
      "(Optional) A drizzle of honey or a sprinkle of cinnamon"
    ],
    instructions: [
      {
        title: "Toast the Bread:",
        description: "Place the slice of bread in a toaster and toast it to your preferred level of crispiness (light golden brown works well)."
      },
      {
        title: "Spread the Peanut Butter:",
        description: "Once toasted, spread peanut butter evenly over the warm bread. The warmth helps the peanut butter melt slightly, making it extra delicious."
      },
      {
        title: "Add Banana Slices:",
        description: "Arrange banana slices on top of the peanut butter, covering as much surface as you like."
      },
      {
        title: "Optional Toppings:",
        description: "If desired, drizzle with honey or sprinkle with cinnamon for extra flavor."
      }
    ]
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    Alert.alert(
      isSaved ? "Recipe Removed" : "Recipe Saved",
      isSaved ? "This recipe has been removed from your favorites." : "This recipe has been added to your favorites.",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{recipeData.title}</Text>
          
          {/* Recipe Info Icons */}
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <View style={styles.iconCircle}>
                <Ionicons name="ribbon-outline" size={24} color="#333" />
              </View>
              <Text style={styles.infoText}>{recipeData.difficulty}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.iconCircle}>
                <Ionicons name="time-outline" size={24} color="#333" />
              </View>
              <Text style={styles.infoText}>{recipeData.time}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.iconCircle}>
                <Ionicons name="restaurant-outline" size={24} color="#333" />
              </View>
              <Text style={styles.infoText}>{recipeData.servings}</Text>
            </View>
          </View>
          
          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients:</Text>
            <View style={styles.ingredientsList}>
              {recipeData.ingredients.map((ingredient, index) => (
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
              {recipeData.instructions.map((instruction, index) => (
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
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.spacer} />
        </ScrollView>
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
    fontSize: 36,
    fontFamily: 'Serif',
    color: COLORS.darkGray,
    marginTop: 20,
    marginBottom: 30,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
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
    marginBottom: 30,
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
    fontSize: 18,
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
    lineHeight: 24,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 40,
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
});