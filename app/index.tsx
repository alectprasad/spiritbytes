import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { COLORS, FONTS } from "@/app/constants/theme";

export default function SplashScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'Serif': require('@/assets/fonts/PlayfairDisplay-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={COLORS.splashGradient}
        style={{ 
          flex: 1,
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <View style={{ 
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Image 
            source={require('@/assets/images/logo.png')}
            style={{
              width: 150,
              height: 150,
              marginBottom: 20,
            }}
            resizeMode="contain"
          />
          <Text style={{ 
            fontFamily: 'Serif',
            fontSize: 42,
            color: 'white',
            marginBottom: 50,
          }}>
            SpiritBytes
          </Text>
        </View>

        <View style={{ 
          alignItems: 'center',
          marginBottom: 60,
        }}>
          <TouchableOpacity
            onPress={() => router.push('/login')}
            style={{
              backgroundColor: COLORS.forestGreen,
              paddingVertical: 15,
              paddingHorizontal: 30,
              borderRadius: 30,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: 200,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.30,
              shadowRadius: 4.65,
              elevation: 8,
            }}
          >
            <Text style={{ 
              color: 'white', 
              fontSize: 18, 
              fontWeight: '500',
              marginRight: 8,
            }}>
              Get Started
            </Text>
            <Text style={{ color: 'white', fontSize: 22 }}>→</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}