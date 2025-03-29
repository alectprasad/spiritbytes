import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/app/constants/theme";
import { EmotionService } from '@/app/services/EmotionService';

export default function CameraScreen() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>('front'); // Default to front camera for emotions
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<any>(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function takePicture() {
    if (cameraRef.current) {
      try {
        setIsProcessing(true); // Start loading state
        
        // Take the picture
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false,
          format: 'jpeg',
        });
        
        try {
          // Upload and analyze the photo
          const emotionResult = await EmotionService.analyzeEmotion(photo.uri);
          
          if (emotionResult.success && emotionResult.emotions.length > 0) {
            const primaryEmotion = emotionResult.emotions[0].type;
            const detectedMood = EmotionService.mapEmotionToMood(primaryEmotion);
            
            // Navigate to analysis screen with detected mood
            router.push({
              pathname: "/app/analysis",
              params: { 
                mood: detectedMood,
                imageUri: photo.uri,
                rawEmotion: primaryEmotion,
                confidence: emotionResult.emotions[0].confidence.toFixed(2)
              }
            });
          } else {
            Alert.alert(
              "No Emotions Detected", 
              "We couldn't detect any emotions. Please try again with a clearer photo of your face.",
              [
                { 
                  text: "OK", 
                  onPress: () => setIsProcessing(false) 
                }
              ]
            );
          }
        } catch (error) {
          console.error("Error analyzing emotions:", error);
          Alert.alert(
            "Analysis Failed", 
            "There was a problem analyzing your emotions. Please try again.",
            [
              { 
                text: "OK", 
                onPress: () => setIsProcessing(false) 
              }
            ]
          );
        }
      } catch (error) {
        console.error('Failed to take picture:', error);
        Alert.alert('Error', 'Failed to take picture');
        setIsProcessing(false);
      }
    } else {
      Alert.alert('Error', 'Camera reference not available');
    }
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing}
        ref={cameraRef}
      >
        {/* Back button - added at the top left */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          disabled={isProcessing}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.controlsContainer}>
          {isProcessing && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.white} />
              <Text style={styles.loadingText}>Analyzing emotions...</Text>
            </View>
          )}
          
          {/* Bottom row with both capture and flip buttons */}
          <View style={styles.bottomControls}>
            <TouchableOpacity 
              style={styles.flipButton} 
              onPress={toggleCameraFacing}
              disabled={isProcessing}
            >
              <Text style={styles.flipText}>Flip</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.captureButton, isProcessing && styles.disabledButton]} 
              onPress={takePicture}
              disabled={isProcessing}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            {/* Empty view for balance (same width as flip button) */}
            <View style={styles.emptySpace} />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'column',
    justifyContent: 'flex-end', // Push all controls to the bottom
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Space elements evenly
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  emptySpace: {
    width: 50, // Same width as flip button for balance
  },
  flipButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  flipText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  // Back button styling
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
});