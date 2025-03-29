import React from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Navbar from "@/app/components/Navbar";
import { COLORS, SHADOWS } from "@/app/constants/theme";

export default function LibraryScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Learn More</Text>
            <Text style={styles.headerSubtitle}>
              Find out how good food affects your mood
            </Text>
          </View>

          <TouchableOpacity style={styles.contentCard}>
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Coming Soon</Text>
            </View>
          </TouchableOpacity>

          {/* Additional content could be added here in the future */}
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
    fontSize: 24,
    color: COLORS.darkGray,
    lineHeight: 32,
  },
  contentCard: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 25,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  placeholderContainer: {
    width: "100%",
    height: 250,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
  placeholderText: {
    fontSize: 24,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  spacer: {
    height: 100,
  },
});