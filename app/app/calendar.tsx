import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import Navbar from "@/app/components/Navbar";
import { COLORS, SHADOWS } from "@/app/constants/theme";

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState("2025-03-19");
  const [currentMood, setCurrentMood] = useState(null);
  const [currentRecipes, setCurrentRecipes] = useState([]);
  const currentMonth = "March 2025"; // This would be dynamic in a real app
  
  // Sample mood data - in a real app this would come from a database
  const moodData = {
    "2025-03-19": {
      time: "8 PM",
      mood: "Calm"
    },
    "2025-03-20": {
      time: "7 PM",
      mood: "Happy"
    },
    "2025-03-15": {
      time: "9 PM",
      mood: "Relaxed"
    },
    "2025-03-10": {
      time: "6 PM",
      mood: "Energetic"
    }
  };
  
  // Sample saved recipe for the selected date
  const savedRecipes = {
    "2025-03-19": [
      {
        id: "1",
        title: "Banana & Peanut Butter Toast",
        color: COLORS.sandBeige
      }
    ],
    "2025-03-20": [
      {
        id: "2",
        title: "Turmeric Golden Milk",
        color: COLORS.terracotta
      },
      {
        id: "3",
        title: "Avocado Toast",
        color: COLORS.oliveGreen
      }
    ],
    "2025-03-15": [
      {
        id: "4",
        title: "Green Smoothie Bowl",
        color: COLORS.forestGreen
      }
    ],
    "2025-03-10": [
      {
        id: "5",
        title: "Dark Chocolate & Almonds",
        color: COLORS.earthBrown
      }
    ]
  };

  // Update mood and recipes when date changes
  useEffect(() => {
    setCurrentMood(getMoodForDate(selectedDate));
    setCurrentRecipes(getRecipesForDate(selectedDate));
  }, [selectedDate]);

  // Get mood data for selected date
  const getMoodForDate = (date) => {
    return moodData[date] || null;
  };
  
  // Get recipes for selected date
  const getRecipesForDate = (date) => {
    return savedRecipes[date] || [];
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

  // Mark dates with data and selected date on calendar
  const markedDates = {
    ...Object.keys(moodData).reduce((acc, date) => {
      acc[date] = {
        marked: true,
        dotColor: COLORS.forestGreen
      };
      return acc;
    }, {}),
    [selectedDate]: {
      selected: true,
      selectedColor: COLORS.forestGreen,
      disableTouchEvent: false
    }
  };

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
              markedDates={markedDates}
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
                >
                  <Text style={styles.recipeTitle}>{recipe.title}</Text>
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
    textAlign: 'center',
  },
  spacer: {
    height: 50,
  },
});