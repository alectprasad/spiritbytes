import React from "react";
import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import Navbar from "@/app/components/Navbar";
import { COLORS } from "@/app/constants/theme";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.lightGray,
    },
    safeArea: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 28,
      fontFamily: 'Serif',
      color: COLORS.darkGray,
    },
  });

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Settings</Text>
      </SafeAreaView>
      <Navbar />
    </View>
  );
}