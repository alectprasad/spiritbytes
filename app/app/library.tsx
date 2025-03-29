import React, { useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "@/app/components/Navbar";
import { COLORS, SHADOWS } from "@/app/constants/theme";

// Season card component for reuse
const SeasonCard = ({ season, content, foodItems, bgColor }) => (
  <View style={[styles.seasonCard, { backgroundColor: bgColor }]}>
    <Text style={styles.seasonCardTitle}>{season}</Text>
    <Text style={styles.seasonCardContent}>{content}</Text>
    
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Available Foods</Text>
      <View style={styles.foodList}>
        {foodItems.available.map((item, index) => (
          <View key={index} style={styles.foodCategory}>
            <Text style={styles.foodCategoryTitle}>{item.category}:</Text>
            <Text style={styles.foodCategoryItems}>{item.items}</Text>
          </View>
        ))}
      </View>
    </View>
    
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Food Benefits</Text>
      {foodItems.benefits.map((benefit, index) => (
        <View key={index} style={styles.benefitItem}>
          <Text style={styles.benefitItemTitle}>• {benefit.food}</Text>
          <Text style={styles.benefitItemDescription}>{benefit.description}</Text>
        </View>
      ))}
    </View>
    

  </View>
);

export default function LibraryScreen() {
  // State to track the selected season tab
  const [activeTab, setActiveTab] = useState("Spring");
  
  // Season tabs data
  const seasonTabs = ["Spring", "Summer", "Fall", "Winter"];
  
  // Season content information
  const seasonContent = {
    Spring: "Spring is the season of renewal, bringing fresh and vibrant produce that supports detoxification, energy, and mental clarity. This is the best time to incorporate fresh greens and light, nutrient-dense foods into your diet.",
    Summer: "Summer offers a vibrant selection of hydrating and antioxidant-rich foods, perfect for boosting energy, improving mood, and protecting the skin.",
    Fall: "Fall foods are grounding and warming, ideal for supporting digestion, immune function, and emotional stability.",
    Winter: "Winter foods focus on warmth and nourishment, strengthening immunity and promoting emotional resilience.",
  };
  
  // Seasonal food data
  const seasonalFoods = {
    Spring: {
      available: [
        { category: "Vegetables", items: "Asparagus, rhubarb, spinach" },
        { category: "Fruits", items: "Rhubarb" }
      ],
      benefits: [
        { food: "Asparagus", description: "Boosts mood by promoting serotonin production, ideal for reducing stress. Best consumed in spring when fresh and tender. Rich in folate, it supports cognitive function and is a healthier alternative to processed carbs." },
        { food: "Rhubarb", description: "Encourages a balanced gut microbiome, indirectly affecting mood and stress levels. Best enjoyed in early spring. A natural source of fiber and antioxidants, making it a healthier alternative to refined sugars." },
        { food: "Spinach", description: "Packed with magnesium, which helps regulate cortisol and reduce anxiety. Spring spinach is fresher and more nutrient-rich. It supports brain health and provides steady energy, unlike caffeine-based stimulants." }
      ]
    },
    Summer: {
      available: [
        { category: "Vegetables", items: "Corn, carrots, tomatoes, cucumbers, peppers, spinach, potatoes" },
        { category: "Fruits", items: "Strawberries, peaches, plums, cherries, blueberries, blackberries, watermelon" }
      ],
      benefits: [
        { food: "Tomatoes", description: "Contain lycopene, which reduces stress and promotes a positive mood. Best consumed fresh in summer for maximum antioxidants. Supports heart health and is a healthier alternative to processed sauces." },
        { food: "Watermelon", description: "Hydrates and provides natural sugars for energy without crashes. Ideal for hot days. Rich in citrulline, which boosts circulation and aids muscle recovery." },
        { food: "Blueberries", description: "Improve cognitive function and memory, promoting a balanced mood. Best in summer when naturally sweet. Packed with antioxidants that protect against inflammation and aging." }
      ]
    },
    Fall: {
      available: [
        { category: "Vegetables", items: "Brussels sprouts, carrots, garlic, potatoes, spinach, beets" },
        { category: "Fruits", items: "Apples, Asian pears, pears" }
      ],
      benefits: [
        { food: "Apples", description: "Provide natural sweetness and fiber, stabilizing blood sugar and mood. Best consumed fresh in autumn. A great alternative to sugary snacks and promotes gut health." },
        { food: "Garlic", description: "Known for immune-boosting and anti-inflammatory properties, reducing fatigue. Fall is peak season. A natural antibiotic and heart-health supporter, replacing processed seasonings." },
        { food: "Beets", description: "Improve blood flow to the brain, enhancing cognitive function and emotional balance. Best in fall for peak sweetness. Rich in nitrates, supporting cardiovascular health." }
      ]
    },
    Winter: {
      available: [
        { category: "Vegetables", items: "Carrots, beets, parsnips, winter squash, leeks, cabbage, garlic" },
        { category: "Fruits", items: "Apples, pears, citrus fruits" }
      ],
      benefits: [
        { food: "Citrus Fruits", description: "Brighten mood with vitamin C, combating seasonal blues. Best consumed fresh in winter for peak immunity benefits. A natural alternative to artificial supplements and processed juices." },
        { food: "Cabbage", description: "Supports gut health, which influences mental well-being. Ideal for winter soups. A nutrient-dense substitute for refined grains in meals." },
        { food: "Root Vegetables", description: "Provide grounding energy and warmth, essential for winter. Naturally available in cold months. Offer slow-digesting carbs, preventing energy crashes unlike processed foods." }
      ]
    }
  };
  
  // Season colors
  const seasonColors = {
    Spring: "#E0F4E0", // Light green
    Summer: "#FFF4E0", // Light yellow
    Fall: "#F9E4D9", // Light orange
    Winter: "#E6EEF5", // Light blue
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Learn More</Text>
            <Text style={styles.headerSubtitle}>
              Discover how seasonal foods affect your mood
            </Text>
          </View>

          {/* Season tabs */}
          <View style={styles.tabsContainer}>
            {seasonTabs.map((season) => (
              <TouchableOpacity
                key={season}
                style={[
                  styles.tab,
                  activeTab === season && [styles.activeTab, { backgroundColor: seasonColors[season] }]
                ]}
                onPress={() => setActiveTab(season)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === season && styles.activeTabText
                  ]}
                >
                  {season}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Season content */}
          <SeasonCard 
            season={activeTab}
            content={seasonContent[activeTab]}
            foodItems={seasonalFoods[activeTab]}
            bgColor={seasonColors[activeTab]}
          />



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
  headerSection: {
    marginTop: 40, 
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 38,
    fontFamily: "Serif",
    color: COLORS.darkGray,
    fontWeight: "600",
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 22,
    color: COLORS.darkGray,
    lineHeight: 30,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 3,
    backgroundColor: COLORS.lightGray,
  },
  activeTab: {
    backgroundColor: COLORS.sageMoss,
    ...SHADOWS.small,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  activeTabText: {
    color: COLORS.darkGray,
    fontWeight: "700",
  },
  seasonCard: {
    width: "100%",
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  seasonCardTitle: {
    fontSize: 24,
    fontFamily: "Serif",
    color: COLORS.darkGray,
    fontWeight: "600",
    marginBottom: 12,
  },
  seasonCardContent: {
    fontSize: 16,
    color: COLORS.darkGray,
    lineHeight: 24,
    marginBottom: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Serif",
    color: COLORS.darkGray,
    fontWeight: "600",
    marginBottom: 10,
  },
  foodList: {
    marginBottom: 10,
  },
  foodCategory: {
    flexDirection: "row",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  foodCategoryTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.darkGray,
    marginRight: 5,
  },
  foodCategoryItems: {
    fontSize: 15,
    color: COLORS.darkGray,
    flex: 1,
  },
  benefitItem: {
    marginBottom: 12,
  },
  benefitItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.darkGray,
    marginBottom: 3,
  },
  benefitItemDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },

  spacer: {
    height: 100,
  },
});