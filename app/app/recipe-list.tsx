import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  FlatList,
  ActivityIndicator 
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "@/app/components/Navbar";
import { COLORS, SHADOWS } from "@/app/constants/theme";
// Import OpenAI service for recipe generation
import { OpenAIService, Recipe } from "@/app/services/OpenAIService";

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

export default function RecipeListScreen() {
  const router = useRouter();
  const { mood = "Calm", allMoods, source = "home" } = useLocalSearchParams();
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageTitle, setPageTitle] = useState("I found these for you...");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set page title based on source and mood
  useEffect(() => {
    if (source === 'analysis') {
      setPageTitle(`I sense you are ${mood}`);
    } else {
      setPageTitle(`I found these for you...`);
    }
  }, [mood, source]);

  // Fetch recipes on component mount
  useEffect(() => {
    fetchRecipes();
  }, [mood, allMoods]);

  const fetchRecipes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let recipeData: Recipe[];
      
      if (source === 'analysis' && allMoods) {
        // If coming from analysis with multiple moods, use all moods
        const parsedMoods = JSON.parse(allMoods as string) as string[];
        recipeData = await OpenAIService.generateRecipesForMultipleMoods(parsedMoods, 3);
      } else {
        // If coming from home or no multiple moods available, use single mood
        recipeData = await OpenAIService.generateRecipes(mood as string, 3);
      }
      
      if (!recipeData || recipeData.length === 0) {
        setError('No recipes were generated. Please try again.');
      } else {
        setRecipes(recipeData);
      }
    } catch (err: any) {
      // Display the actual error message from the API when possible
      setError(err.message || 'Failed to load recipes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRecipeCard = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={[styles.recipeCard, { backgroundColor: item.color }]}
        onPress={() => {
          router.push({
            pathname: "/app/recipe-detail",
            params: { 
              id: item.id,
              recipeTitle: item.title,
              mood: mood as string,
              color: item.color
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

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.forestGreen} />
      <Text style={styles.loadingText}>Crafting recipes for your mood...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={48} color={COLORS.mediumGray} />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={fetchRecipes}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>{pageTitle}</Text>
          
          {!isLoading && recipes.length > 0 && (
            <Text style={styles.subtitle}>
              {recipes[activeIndex]?.description || "You'll want something easy, comforting and soothing"}
            </Text>
          )}
          
          {isLoading ? (
            renderLoadingState()
          ) : error ? (
            renderErrorState()
          ) : (
            <>
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
            </>
          )}
          
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
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Serif',
    color: COLORS.darkGray,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Serif',
    color: COLORS.darkGray,
    marginBottom: 20,
    lineHeight: 22,
  },
  carouselContainer: {
    height: 350,
    marginBottom: 15,
  },
  carouselContent: {
    paddingRight: 25,
  },
  recipeCard: {
    width: CARD_WIDTH,
    height: 350,
    borderRadius: 20,
    marginRight: 20,
    padding: 20,
    ...SHADOWS.medium,
  },
  recipeTitle: {
    fontSize: 24,
    fontFamily: 'Serif',
    color: COLORS.darkGray,
    marginBottom: 20,
  },
  ingredientItem: {
    marginBottom: 12,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  ingredientBenefits: {
    fontSize: 13,
    color: COLORS.darkGray,
    lineHeight: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
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
  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 20,
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