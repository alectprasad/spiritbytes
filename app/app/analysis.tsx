import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Svg, Circle, Path } from "react-native-svg";
import Navbar from "@/app/components/Navbar";
import { COLORS } from "@/app/constants/theme";

// Semi-circle progress component
const SemiCircleProgress = ({ percentage, size = 120 }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const semiCircumference = circumference * 1;
  const strokeDashoffset = semiCircumference - (percentage / 100) * semiCircumference;
  
  return (
    <Svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`}>
      <Path
        d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
        fill="none"
        stroke="#E0D2C3"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
        fill="none"
        stroke="#B79B7E"
        strokeDasharray={semiCircumference}
        strokeDashoffset={strokeDashoffset}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default function AnalysisScreen() {
  const router = useRouter();
  const { mood, imageUri } = useLocalSearchParams();
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [emotionReadings, setEmotionReadings] = useState([]);
  
  // List of possible moods from home page
  const possibleMoods = [
    "Fine", "Sleepy", "Calm", "Playful", 
    "Tired", "Confident", "Tensed", "Happy", 
    "Stressed", "Anxious", "Relaxed", "Energetic"
  ];

  // On component mount, select 3 random emotions with random percentages
  useEffect(() => {
    // Function to get random unique moods
    const getRandomMoods = () => {
      const shuffled = [...possibleMoods].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
    };

    // Function to generate a random percentage between 40-90
    const getRandomPercentage = () => {
      return Math.floor(Math.random() * 51) + 40; // 40-90
    };

    // Create array of random emotions with percentages in descending order
    const randomEmotions = getRandomMoods().map(emotion => ({
      type: emotion,
      percentage: getRandomPercentage()
    }));

    // Sort by percentage (highest first)
    randomEmotions.sort((a, b) => b.percentage - a.percentage);
    
    setEmotionReadings(randomEmotions);
  }, []);

  const handleResponse = (response) => {
    setSelectedResponse(response);
    
    if (response === 'yes') {
      // If user confirms, navigate to recipe list with top emotion
      const topEmotion = emotionReadings.length > 0 ? emotionReadings[0].type : 'Calm';
      router.push({
        pathname: "/app/recipe-list",
        params: { 
          mood: topEmotion,
          source: 'analysis'
        }
      });
    } else {
      // If user says "Not quite", go back to home
      router.push("/app/home");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>I sense that you are...</Text>
          
          <View style={styles.emotionsContainer}>
            {emotionReadings.map((emotion, index) => (
              <View key={index} style={styles.emotionRow}>
                <View style={styles.progressContainer}>
                  <SemiCircleProgress percentage={emotion.percentage} />
                  <Text style={styles.percentageText}>{emotion.percentage}%</Text>
                </View>
                <Text style={styles.emotionText}>{emotion.type}</Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.questionText}>Is my reading correct?</Text>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={[styles.responseButton, styles.noButton]}
              onPress={() => handleResponse('no')}
            >
              <Text style={styles.buttonText}>Not quite</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.responseButton, styles.yesButton]}
              onPress={() => handleResponse('yes')}
            >
              <Text style={styles.buttonText}>Yes</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 50,
  },
  emotionsContainer: {
    marginBottom: 60,
  },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressContainer: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 30,
  },
  percentageText: {
    position: 'absolute',
    fontSize: 26,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  emotionText: {
    fontSize: 32,
    color: COLORS.darkGray,
    fontFamily: 'Serif',
  },
  questionText: {
    fontSize: 28,
    fontFamily: 'Serif',
    color: COLORS.darkGray,
    marginBottom: 30,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  responseButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    minWidth: 140,
    alignItems: 'center',
  },
  noButton: {
    backgroundColor: '#A9A9A9',
  },
  yesButton: {
    backgroundColor: COLORS.forestGreen,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
});