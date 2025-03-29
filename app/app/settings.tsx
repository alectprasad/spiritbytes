import React, { useState } from "react";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "aws-amplify/auth";
import Navbar from "@/app/components/Navbar";
import { COLORS, SHADOWS } from "@/app/constants/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Toggle state for various settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.replace("/");
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const SettingItem = ({ icon, title, description, isToggle = false, value = false, onToggle = () => {} }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon} size={24} color={COLORS.forestGreen} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      {isToggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "#d1d1d1", true: COLORS.sageMoss }}
          thumbColor={value ? COLORS.forestGreen : "#f4f3f4"}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
      )}
    </View>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>
        
        <ScrollView style={styles.scrollView}>
          <SectionHeader title="Account" />
          
          <TouchableOpacity onPress={() => router.push("/auth/food-preferences")}>
            <SettingItem 
              icon="nutrition-outline" 
              title="Food Preferences"
              description="Update your diet and allergen preferences"
            />
          </TouchableOpacity>
          
          <TouchableOpacity>
            <SettingItem 
              icon="person-outline" 
              title="Personal Information"
              description="Update your profile information"
            />
          </TouchableOpacity>

          <SectionHeader title="App Settings" />
          
          <SettingItem 
            icon="notifications-outline" 
            title="Notifications"
            description="Receive mood and food reminders"
            isToggle={true}
            value={notificationsEnabled}
            onToggle={() => setNotificationsEnabled(!notificationsEnabled)}
          />
          
          <SettingItem 
            icon="moon-outline" 
            title="Dark Mode"
            description="Change app appearance"
            isToggle={true}
            value={darkModeEnabled}
            onToggle={() => setDarkModeEnabled(!darkModeEnabled)}
          />
          
          <SettingItem 
            icon="volume-high-outline" 
            title="Sounds"
            description="Enable app sounds"
            isToggle={true}
            value={soundEnabled}
            onToggle={() => setSoundEnabled(!soundEnabled)}
          />

          <SectionHeader title="Support" />
          
          <TouchableOpacity>
            <SettingItem 
              icon="help-circle-outline" 
              title="Help Center"
              description="Get help with the app"
            />
          </TouchableOpacity>
          
          <TouchableOpacity>
            <SettingItem 
              icon="newspaper-outline" 
              title="Terms & Privacy Policy"
              description="Read our terms and conditions"
            />
          </TouchableOpacity>
          
          <TouchableOpacity>
            <SettingItem 
              icon="information-circle-outline" 
              title="About"
              description="App version 1.0.0"
            />
          </TouchableOpacity>

          <View style={styles.signOutContainer}>
            <TouchableOpacity 
              style={styles.signOutButton}
              onPress={handleSignOut}
              disabled={isLoading}
            >
              <Text style={styles.signOutText}>
                {isLoading ? "Signing Out..." : "Sign Out"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    ...SHADOWS.small,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Serif',
    color: COLORS.forestGreen,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'Serif',
    color: COLORS.darkGray,
    marginTop: 25,
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 10,
    ...SHADOWS.small,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(56, 82, 61, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.darkGray,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  signOutContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 50,
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    ...SHADOWS.small,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});