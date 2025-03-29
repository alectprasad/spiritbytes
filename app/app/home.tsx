import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "@/app/constants/theme";
import Navbar from "@/app/components/Navbar";

// Constants
const ITEM_HEIGHT = 60;
const DEFAULT_MOOD = "Playful";

export default function HomeScreen() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(DEFAULT_MOOD);
  const [centerItemIndex, setCenterItemIndex] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const moods = [
    "Fine", "Sleepy", "Calm", "Playful", 
    "Tired", "Confident", "Tensed", "Happy", 
    "Stressed", "Anxious", "Relaxed", "Energetic"
  ];

  // Initialize with the default selected mood
  useEffect(() => {
    const defaultIndex = moods.indexOf(DEFAULT_MOOD);
    if (defaultIndex >= 0) {
      setCenterItemIndex(defaultIndex);

      // Scroll to the default item after a short delay
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ 
            y: defaultIndex * ITEM_HEIGHT, 
            animated: true 
          });
        }
      }, 500);
    }
  }, []);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    
    if (index >= 0 && index < moods.length) {
      setCenterItemIndex(index);
      setSelectedMood(moods[index]);
    }
  };

  const handleMoodPress = (mood: string, index: number) => {
    setSelectedMood(mood);
    setCenterItemIndex(index);
    
    // Scroll to center the selected mood
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ 
        y: index * ITEM_HEIGHT, 
        animated: true 
      });
    }
  };

  const handleCameraPress = () => {
    // Navigate to the camera screen
    router.push("/app/camera");
  };

  const handleNextPress = () => {
    if (selectedMood) {
      // Navigate to the analysis screen with the selected mood
      router.push({
        pathname: "/app/analysis",
        params: { mood: selectedMood }
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={COLORS.splashGradient}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: 'center', padding: 20 }}>
            {/* Profile Photo Area */}
            <TouchableOpacity 
              onPress={handleCameraPress}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 50,
                ...SHADOWS.medium
              }}
            >
              <Ionicons 
                name="camera-outline" 
                size={50} 
                color={COLORS.forestGreen}
              />
            </TouchableOpacity>

            {/* Mood Selection Area */}
            <View style={{ width: '100%', marginTop: 40 }}>
              <Text style={{ 
                fontSize: 32, 
                fontFamily: 'Serif', 
                color: 'white', 
                textAlign: 'center',
                marginBottom: 30
              }}>
                How Are You Feeling Today?
              </Text>

              <View style={{ height: 300, position: 'relative' }}>
                {/* Fixed selection indicator */}
                <View style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: 0, 
                  right: 0, 
                  height: ITEM_HEIGHT, 
                  backgroundColor: 'white', 
                  borderRadius: 30,
                  transform: [{ translateY: -ITEM_HEIGHT/2 }],
                  zIndex: 1,
                  ...SHADOWS.small
                }} />
                
                <ScrollView 
                  ref={scrollViewRef}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ 
                    paddingTop: 150 - ITEM_HEIGHT/2,
                    paddingBottom: 150 - ITEM_HEIGHT/2,
                  }}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={handleScroll}
                  scrollEventThrottle={16}
                  style={{ zIndex: 2 }}
                >
                  {moods.map((mood, index) => (
                    <TouchableOpacity
                      key={mood}
                      onPress={() => handleMoodPress(mood, index)}
                      style={{
                        backgroundColor: 'transparent',
                        height: ITEM_HEIGHT,
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 2,
                      }}
                    >
                      <Text style={{ 
                        fontSize: 20, 
                        color: index === centerItemIndex ? COLORS.forestGreen : 'white',
                        fontWeight: index === centerItemIndex ? 'bold' : 'normal'
                      }}>
                        {mood}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Next Button */}
              <View style={{ alignItems: 'center', marginTop: 20 }}>
                <TouchableOpacity
                  onPress={handleNextPress}
                  style={{
                    backgroundColor: 'white',
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...SHADOWS.medium
                  }}
                >
                  <Ionicons name="arrow-forward" size={28} color={COLORS.forestGreen} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
      <Navbar />
    </View>
  );
}