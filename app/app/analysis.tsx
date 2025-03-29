import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "@/app/components/Navbar";
import { COLORS, SHADOWS } from "@/app/constants/theme";

export default function AnalysisScreen() {
  const router = useRouter();
  const { mood } = useLocalSearchParams();
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    // In a real app, this would fetch recommendations based on mood from an API
    // For demo purposes, we'll use hardcoded recommendations
    generateRecommendations(mood as string);
  }, [mood]);

  const generateRecommendations = (currentMood: string) => {
    // Sample recommendations based on mood
    const moodRecommendations: Record<string, string[]> = {
      "Happy": [
        "Festive fruit salad with citrus dressing",
        "Bright berry smoothie bowl with honey",
        "Celebratory chocolate-dipped strawberries"
      ],
      "Playful": [
        "Colorful veggie rainbow wrap",
        "Fun-shaped pancakes with fruit faces",
        "Playful pasta salad with vibrant vegetables"
      ],
      "Relaxed": [
        "Soothing chamomile tea with honey",
        "Calming lavender-infused yogurt parfait",
        "Gentle oatmeal with warm spices"
      ],
      "Tired": [
        "Energizing banana and peanut butter toast",
        "Revitalizing green smoothie with spinach and apple",
        "Sustaining quinoa bowl with avocado"
      ],
      "Stressed": [
        "Comforting dark chocolate squares",
        "Anti-inflammatory turmeric golden milk",
        "Calming herbal tea blend with valerian root"
      ],
      "Anxious": [
        "Grounding root vegetable soup",
        "Warming cinnamon-spiced oatmeal",
        "Soothing peppermint tea with honey"
      ]
    };

    // Default recommendations if mood isn't in our predefined list
    const defaultRecs = [
      "Balanced meal with protein, vegetables, and whole grains",
      "Hydrating infused water with cucumber and mint",
      "Nourishing bowl of seasonal fruits"
    ];

    setRecommendations(moodRecommendations[currentMood as string] || defaultRecs);
  };

  const getMoodColor = (currentMood: string): string[] => {
    const moodColors: Record<string, string[]> = {
      "Happy": [COLORS.sandBeige, COLORS.terracotta],
      "Playful": [COLORS.oliveGreen, COLORS.sandBeige],
      "Relaxed": [COLORS.sageMoss, COLORS.forestGreen],
      "Tired": [COLORS.earthBrown, COLORS.terracotta],
      "Stressed": [COLORS.forestGreen, COLORS.earthBrown],
      "Anxious": [COLORS.terracotta, COLORS.earthBrown],
    };

    return moodColors[currentMood as string] || COLORS.splashGradient;
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={getMoodColor(mood as string)}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.title}>Mood Analysis</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.moodCard}>
              <Text style={styles.moodLabel}>Your Current Mood</Text>
              <Text style={styles.moodValue}>{mood}</Text>
              
              <View style={styles.divider} />
              
              <Text style={styles.recommendationsTitle}>Recommended Foods</Text>
              <View style={styles.recommendationsList}>
                {recommendations.map((item, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Ionicons name="leaf" size={16} color={COLORS.forestGreen} />
                    <Text style={styles.recommendationText}>{item}</Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity 
                style={styles.recipeButton}
                onPress={() => {
                  // In a real app, this would navigate to recipe details
                  console.log("Navigate to recipes for", mood);
                }}
              >
                <Text style={styles.recipeButtonText}>See Detailed Recipes</Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 30, // Add horizontal padding here
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Serif',
    color: 'white',
    fontWeight: '500',
  },
  moodCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    ...SHADOWS.medium,
  },
  moodLabel: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  moodValue: {
    fontSize: 32,
    fontFamily: 'Serif',
    color: COLORS.forestGreen,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 20,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontFamily: 'Serif',
    color: COLORS.darkGray,
    marginBottom: 15,
  },
  recommendationsList: {
    marginBottom: 25,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginLeft: 10,
  },
  recipeButton: {
    backgroundColor: COLORS.forestGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 30,
    ...SHADOWS.small,
  },
  recipeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
});