import React, { useState, useEffect, useCallback } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import Navbar from "@/app/components/Navbar";
import { COLORS, SHADOWS } from "@/app/constants/theme";
import { StorageService, SavedRecipe } from "@/app/services/StorageService";
import { format } from "date-fns";

export default function FavoritesScreen() {
  const router = useRouter();
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMood, setFilterMood] = useState<string | null>(null);
  
  // Fetch saved recipes when component mounts and when screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchSavedRecipes();
      return () => {
        // Cleanup if needed
      };
    }, [])
  );
  
  // Fetch saved recipes from storage
  const fetchSavedRecipes = async () => {
    setIsLoading(true);
    try {
      const recipes = await StorageService.getSavedRecipes();
      // Sort by most recently saved
      recipes.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
      setSavedRecipes(recipes);
    } catch (error) {
      // If error fetching, just show empty state
      setSavedRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter recipes by mood if a filter is active
  const getFilteredRecipes = () => {
    if (!filterMood) {
      return savedRecipes;
    }
    return savedRecipes.filter(recipe => recipe.mood === filterMood);
  };
  
  // Get unique moods for filtering
  const getUniqueMoods = () => {
    const moods = new Set(savedRecipes.map(recipe => recipe.mood));
    return Array.from(moods);
  };
  
  // Handle recipe selection
  const handleRecipePress = (recipe: SavedRecipe) => {
    router.push({
      pathname: "/app/recipe-detail",
      params: { 
        id: recipe.id,
        recipeTitle: recipe.title,
        mood: recipe.mood,
        color: recipe.color,
        fromFavorites: 'true'
      }
    });
  };
  
  // Handle filter button press
  const handleFilterPress = (mood: string | null) => {
    setFilterMood(mood === filterMood ? null : mood);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy");
    } catch (error) {
      return "Unknown date";
    }
  };
  
  // Render empty state when no recipes are saved
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={64} color={COLORS.mediumGray} />
      <Text style={styles.emptyText}>No saved recipes yet</Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => router.push("/app/home")}
      >
        <Text style={styles.exploreButtonText}>Find Recipes</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Saved Recipes</Text>
          
          {/* Filter dropdown */}
          {savedRecipes.length > 0 && (
            <View style={styles.filterContainer}>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setFilterMood(null)}
              >
                <Text style={[
                  styles.filterText, 
                  !filterMood && styles.activeFilterText
                ]}>
                  All
                </Text>
                {!filterMood && (
                  <View style={styles.activeFilterIndicator} />
                )}
              </TouchableOpacity>
              
              {getUniqueMoods().map((mood) => (
                <TouchableOpacity 
                  key={mood}
                  style={styles.filterButton}
                  onPress={() => handleFilterPress(mood)}
                >
                  <Text style={[
                    styles.filterText, 
                    filterMood === mood && styles.activeFilterText
                  ]}>
                    {mood}
                  </Text>
                  {filterMood === mood && (
                    <View style={styles.activeFilterIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.forestGreen} />
          </View>
        ) : savedRecipes.length === 0 ? (
          renderEmptyState()
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {getFilteredRecipes().map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={[styles.recipeCard, { backgroundColor: recipe.color }]}
                onPress={() => handleRecipePress(recipe)}
              >
                <View style={styles.recipeHeader}>
                  <Text style={styles.recipeTitle}>{recipe.title}</Text>
                  <Text style={styles.recipeMood}>Mood: {recipe.mood}</Text>
                </View>
                
                <View style={styles.recipeFooter}>
                  <Text style={styles.recipeSavedDate}>
                    Saved on {formatDate(recipe.savedAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {/* Empty space at bottom to ensure last card is fully visible */}
            <View style={styles.bottomSpace} />
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
  header: {
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Serif',
    color: COLORS.darkGray,
    fontWeight: '600',
    marginBottom: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  filterButton: {
    marginRight: 15,
    marginBottom: 10,
    position: 'relative',
    paddingBottom: 5,
  },
  filterText: {
    fontSize: 16,
    color: COLORS.mediumGray,
  },
  activeFilterText: {
    color: COLORS.forestGreen,
    fontWeight: '600',
  },
  activeFilterIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.forestGreen,
    borderRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  exploreButton: {
    backgroundColor: COLORS.forestGreen,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    ...SHADOWS.small,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
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
  recipeHeader: {
    marginBottom: 15,
  },
  recipeTitle: {
    fontSize: 22,
    fontFamily: 'Serif',
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  recipeMood: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  recipeFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 10,
  },
  recipeSavedDate: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontStyle: 'italic',
  },
  bottomSpace: {
    height: 30,
  },
});