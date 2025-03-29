import React, { useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Navbar from "@/app/components/Navbar";
import { COLORS, SHADOWS } from "@/app/constants/theme";

export default function FavoritesScreen() {
  const router = useRouter();
  
  // Sample saved recipes data
  const [savedRecipes, setSavedRecipes] = useState([
    {
      id: '1',
      title: 'Banana & Peanut Butter Toast',
      tags: ['Minimal effort & cleanup', 'Quick & satisfying', 'Sleep-friendly'],
      color: COLORS.sandBeige,
    },
    {
      id: '2',
      title: 'Green Smoothie Bowl',
      tags: ['Energizing', 'Nutrient-dense', 'Quick breakfast'],
      color: COLORS.sageMoss,
    },
    {
      id: '3',
      title: 'Turmeric Golden Milk',
      tags: ['Anti-inflammatory', 'Calming', 'Evening drink'],
      color: COLORS.terracotta,
    },
    {
      id: '4',
      title: 'Dark Chocolate & Almonds',
      tags: ['Mood-boosting', 'Heart-healthy', 'Simple snack'],
      color: COLORS.earthBrown,
    },
  ]);

  // Handle recipe selection
  const handleRecipePress = (recipe) => {
    console.log('Selected recipe:', recipe.title);
    // Navigate to recipe detail (implement later)
  };

  // Handle filter button press
  const handleFilterPress = () => {
    console.log('Filter button pressed');
    // Implement filter functionality
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Saved Recipes</Text>
          <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
            <Ionicons name="filter" size={24} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {savedRecipes.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              style={[styles.recipeCard, { backgroundColor: recipe.color }]}
              onPress={() => handleRecipePress(recipe)}
            >
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              {recipe.tags.map((tag, index) => (
                <Text key={index} style={styles.recipeTag}>
                  {tag}
                </Text>
              ))}
            </TouchableOpacity>
          ))}
          
          {/* Empty space at bottom to ensure last card is fully visible */}
          <View style={styles.bottomSpace} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Serif',
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  filterButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recipeCard: {
    padding: 20,
    borderRadius: 25,
    marginBottom: 15,
    ...SHADOWS.medium,
  },
  recipeTitle: {
    fontSize: 24,
    fontFamily: 'Serif',
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 10,
  },
  recipeTag: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  bottomSpace: {
    height: 30,
  },
});