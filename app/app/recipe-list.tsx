import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  FlatList 
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "@/app/components/Navbar";
import { COLORS, SHADOWS } from "@/app/constants/theme";

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

export default function RecipeListScreen() {
  const router = useRouter();
  const { mood = "Calm", source = "home" } = useLocalSearchParams();
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageTitle, setPageTitle] = useState("I found these for you...");

  // Set page title based on source and mood
  useEffect(() => {
    if (source === 'analysis') {
      setPageTitle(`I sense you are ${mood}`);
    } else {
      setPageTitle(`I found these for you...`);
    }
  }, [mood, source]);

  // Sample recipe data based on moods
  const moodRecipes = {
    "Calm": [
      {
        id: '1',
        title: 'Banana & Peanut Butter Toast',
        description: 'You\'ll want something easy, comforting and soothing',
        color: COLORS.sandBeige,
        ingredients: [
          {
            name: 'Bananas',
            benefits: 'Rich in magnesium and potassium, which help relax muscles'
          },
          {
            name: 'Whole Grain Bread',
            benefits: 'Complex carbs promote serotonin production'
          },
          {
            name: 'Peanut Butter',
            benefits: 'Contains tryptophan which helps produce melatonin'
          }
        ]
      },
      {
        id: '2',
        title: 'Turmeric Golden Milk',
        description: 'A warm drink to help you unwind and relax',
        color: COLORS.terracotta,
        ingredients: [
          {
            name: 'Turmeric',
            benefits: 'Anti-inflammatory properties that help reduce stress'
          },
          {
            name: 'Warm Milk',
            benefits: 'Contains tryptophan which promotes better sleep'
          },
          {
            name: 'Honey',
            benefits: 'Natural sweetener that helps soothe the mind'
          }
        ]
      },
      {
        id: '3',
        title: 'Avocado Cucumber Toast',
        description: 'Light and refreshing for a calming effect',
        color: COLORS.oliveGreen,
        ingredients: [
          {
            name: 'Avocado',
            benefits: 'Rich in B vitamins that help reduce anxiety'
          },
          {
            name: 'Cucumber',
            benefits: 'Hydrating and contains antioxidants'
          },
          {
            name: 'Whole Grain Bread',
            benefits: 'Provides sustained energy and mood stability'
          }
        ]
      }
    ],
    "Happy": [
      {
        id: '4',
        title: 'Berry Smoothie Bowl',
        description: 'Maintain your positive mood with these uplifting foods',
        color: COLORS.terracotta,
        ingredients: [
          {
            name: 'Berries',
            benefits: 'Rich in antioxidants that support brain health'
          },
          {
            name: 'Greek Yogurt',
            benefits: 'Probiotics can enhance mood and cognitive function'
          },
          {
            name: 'Honey',
            benefits: 'Natural sweetener that helps maintain energy levels'
          }
        ]
      },
      {
        id: '5',
        title: 'Citrus Quinoa Salad',
        description: 'Fresh and energizing to complement your mood',
        color: COLORS.sageMoss,
        ingredients: [
          {
            name: 'Quinoa',
            benefits: 'Complete protein that helps maintain stable energy'
          },
          {
            name: 'Citrus Fruits',
            benefits: 'Vitamin C boosts immune system and mood'
          },
          {
            name: 'Nuts',
            benefits: 'Healthy fats support brain function and positive mood'
          }
        ]
      }
    ],
    "Tired": [
      {
        id: '6',
        title: 'Energy-Boosting Oatmeal',
        description: 'Natural energy that lasts throughout the day',
        color: COLORS.earthBrown,
        ingredients: [
          {
            name: 'Oats',
            benefits: 'Slow-release carbs provide sustained energy'
          },
          {
            name: 'Nuts & Seeds',
            benefits: 'Protein and healthy fats for long-lasting fuel'
          },
          {
            name: 'Cinnamon',
            benefits: 'Helps regulate blood sugar for steady energy'
          }
        ]
      },
      {
        id: '7',
        title: 'Green Power Smoothie',
        description: 'Revitalizing nutrients to fight fatigue',
        color: COLORS.oliveGreen,
        ingredients: [
          {
            name: 'Spinach',
            benefits: 'Iron helps combat fatigue and increase energy'
          },
          {
            name: 'Banana',
            benefits: 'Natural sugars provide quick energy boost'
          },
          {
            name: 'Chia Seeds',
            benefits: 'Omega-3s support brain function and reduce fatigue'
          }
        ]
      }
    ]
  };

  // Default recipes if mood doesn't have specific ones
  const defaultRecipes = moodRecipes["Calm"];

  // Get recipes for the current mood or default if not found
  const recipes = moodRecipes[mood as string] || defaultRecipes;

  const renderRecipeCard = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={[styles.recipeCard, { backgroundColor: item.color }]}
        onPress={() => {
          router.push({
            pathname: "/app/recipe-detail",
            params: { 
              id: item.id,
              recipeTitle: item.title
            }
          });
        }}
      >
        <Text style={styles.recipeTitle}>{item.title}</Text>
        
        {/* Ingredients List */}
        {item.ingredients.map((ingredient, idx) => (
          <View key={idx} style={styles.ingredientItem}>
            <Text style={styles.ingredientName}>{ingredient.name}</Text>
            <Text style={styles.ingredientBenefits}>{ingredient.benefits}</Text>
          </View>
        ))}
      </TouchableOpacity>
    );
  };

  const handleViewIndexChange = (event) => {
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.floor(contentOffset / viewSize);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>{pageTitle}</Text>
          
          <Text style={styles.subtitle}>
            {recipes[activeIndex]?.description || "You'll want something easy, comforting and soothing"}
          </Text>
          
          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={recipes}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + 20}
              decelerationRate="fast"
              onMomentumScrollEnd={handleViewIndexChange}
              renderItem={renderRecipeCard}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.carouselContent}
            />
          </View>
          
          {/* Pagination dots */}
          <View style={styles.pagination}>
            {recipes.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.paginationDot, 
                  index === activeIndex && styles.paginationDotActive
                ]} 
              />
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    padding: 25,
    paddingTop: 50,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Serif',
    color: COLORS.darkGray,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 24,
    fontFamily: 'Serif',
    color: COLORS.darkGray,
    marginBottom: 30,
    lineHeight: 32,
  },
  carouselContainer: {
    height: 400,
    marginBottom: 20,
  },
  carouselContent: {
    paddingRight: 25,
  },
  recipeCard: {
    width: CARD_WIDTH,
    height: 400,
    borderRadius: 20,
    marginRight: 20,
    padding: 30,
    ...SHADOWS.medium,
  },
  recipeTitle: {
    fontSize: 32,
    fontFamily: 'Serif',
    color: COLORS.darkGray,
    marginBottom: 30,
  },
  ingredientItem: {
    marginBottom: 20,
  },
  ingredientName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  ingredientBenefits: {
    fontSize: 16,
    color: COLORS.darkGray,
    lineHeight: 22,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.forestGreen,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a9a9a9',
    padding: 15,
    borderRadius: 30,
    alignSelf: 'flex-start',
    ...SHADOWS.small,
  },
  backButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
});