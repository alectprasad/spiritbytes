import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import Navbar from "@/app/components/Navbar";
import { COLORS, SHADOWS } from "@/app/constants/theme";
import { StorageService, SavedRecipe } from "@/app/services/StorageService";

export default function CalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentMonth = format(new Date(), "MMMM yyyy");
  
  // Fetch saved recipes on component mount
  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  const fetchSavedRecipes = async () => {
    setIsLoading(true);
    try {
      const recipes = await StorageService.getSavedRecipes();
      setSavedRecipes(recipes);
    } catch (error) {
      setSavedRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get mood data for a specific date
  const getMoodForDate = (date: string) => {
    const recipesOnDate = savedRecipes.filter(recipe => {
      const recipeDate = format(new Date(recipe.savedAt), "yyyy-MM-dd");
      return recipeDate === date;
    });
    
    if (recipesOnDate.length === 0) {
      return null;
    }
    
    // Return the mood from the most recent recipe that day
    const sortedRecipes = recipesOnDate.sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );
    
    return {
      time: format(new Date(sortedRecipes[0].savedAt), "h a"),
      mood: sortedRecipes[0].mood
    };
  };
  
  // Get recipes for a specific date
  const getRecipesForDate = (date: string) => {
    return savedRecipes.filter(recipe => {
      const recipeDate = format(new Date(recipe.savedAt), "yyyy-MM-dd");
      return recipeDate === date;
    });
  };

  // Get all dates that have saved recipes
  const getDatesWithRecipes = () => {
    const dates: {[key: string]: any} = {};
    
    savedRecipes.forEach(recipe => {
      const date = format(new Date(recipe.savedAt), "yyyy-MM-dd");
      dates[date] = {
        marked: true,
        dotColor: COLORS.forestGreen
      };
    });
    
    // Add selected date styling
    if (dates[selectedDate]) {
      dates[selectedDate] = {
        ...dates[selectedDate],
        selected: true,
        selectedColor: COLORS.forestGreen
      };
    } else {
      dates[selectedDate] = {
        selected: true,
        selectedColor: COLORS.forestGreen
      };
    }
    
    return dates;
  };

  // Handle navigation to recipe detail
  const handleRecipePress = (recipe: SavedRecipe) => {
    router.push({
      pathname: "/app/recipe-detail",
      params: { 
        id: recipe.id,
        recipeTitle: recipe.title,
        mood: recipe.mood,
        color: recipe.color,
        fromCalendar: 'true'
      }
    });
  };

  // Custom calendar theme
  const calendarTheme = {
    backgroundColor: 'transparent',
    calendarBackground: 'transparent',
    textSectionTitleColor: '#aaaaaa',
    selectedDayBackgroundColor: COLORS.forestGreen,
    selectedDayTextColor: '#ffffff',
    todayTextColor: COLORS.forestGreen,
    dayTextColor: '#2d4150',
    textDisabledColor: '#d9e1e8',
    arrowColor: COLORS.mediumGray,
    monthTextColor: COLORS.darkGray,
    textMonthFontFamily: 'Serif',
    textDayFontFamily: 'Serif',
    textDayHeaderFontFamily: 'Serif',
    textMonthFontSize: 20,
    textDayFontSize: 16,
    textDayHeaderFontSize: 13
  };

  // Get current mood and recipes
  const currentMood = getMoodForDate(selectedDate);
  const currentRecipes = getRecipesForDate(selectedDate);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.header}>Calendar</Text>
          
          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={getDatesWithRecipes()}
              hideExtraDays={false}
              theme={calendarTheme}
              renderArrow={(direction) => (
                <Ionicons 
                  name={direction === 'left' ? 'chevron-back' : 'chevron-forward'} 
                  size={24} 
                  color={COLORS.mediumGray} 
                />
              )}
            />
          </View>
          
          {/* Mood section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>How You Felt</Text>
            {currentMood ? (
              <View style={styles.moodContainer}>
                <Text style={styles.moodTime}>{currentMood.time}:</Text>
                <Text style={styles.moodText}>{currentMood.mood}</Text>
              </View>
            ) : (
              <Text style={styles.noDataText}>No mood data for this date</Text>
            )}
          </View>
          
          {/* Saved Recipes section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Saved Recipes</Text>
            {currentRecipes.length > 0 ? (
              currentRecipes.map(recipe => (
                <TouchableOpacity
                  key={recipe.id}
                  style={[styles.recipeItem, { backgroundColor: recipe.color }]}
                  onPress={() => handleRecipePress(recipe)}
                >
                  <Text style={styles.recipeTitle}>{recipe.title}</Text>
                  <Text style={styles.recipeTime}>
                    Saved at {format(new Date(recipe.savedAt), "h:mm a")}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noDataText}>No recipes saved for this date</Text>
            )}
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
    backgroundColor: "white",
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 25,
  },
  header: {
    fontSize: 36,
    fontFamily: "Serif",
    color: COLORS.darkGray,
    marginTop: 20,
    marginBottom: 20,
  },
  calendarContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    ...SHADOWS.medium,
    marginBottom: 30,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: "Serif",
    color: COLORS.darkGray,
    marginBottom: 15,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodTime: {
    fontSize: 18,
    color: COLORS.darkGray,
    marginRight: 5,
  },
  moodText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  noDataText: {
    fontSize: 16,
    color: COLORS.mediumGray,
    fontStyle: 'italic',
  },
  recipeItem: {
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    ...SHADOWS.small,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  recipeTime: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 5,
    fontStyle: 'italic',
  },
  spacer: {
    height: 50,
  },
});