// app/services/EmotionService.ts
import { getCurrentUser } from 'aws-amplify/auth';
import { post } from 'aws-amplify/api';

export interface Emotion {
  type: string;
  confidence: number;
}

export interface EmotionAnalysisResult {
  success: boolean;
  message: string;
  emotions: Emotion[];
  imageUrl?: string;
}

export class EmotionService {
  /**
   * Uploads an image and analyzes emotions using AWS Rekognition
   * @param imageUri The local URI of the image
   * @returns Promise with emotion analysis results
   */
  static async analyzeEmotion(imageUri: string): Promise<EmotionAnalysisResult> {
    try {
      // Get current user ID
      const currentUser = await getCurrentUser();
      const userId = currentUser.userId;
      
      // Read the image as base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            // Send the image to the Lambda function via API Gateway
            const base64Image = reader.result as string;
            
            const apiResponse = await fetch('https://ddm3d6xmm3.execute-api.us-east-1.amazonaws.com/dev', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                image: base64Image
              })
            });
            
            const responseBody = await apiResponse.json();

            resolve(responseBody as EmotionAnalysisResult);
          } catch (error) {
            console.error('Error calling emotion analysis API:', error);
            reject(error);
          }
        };
        
        reader.onerror = (error) => {
          console.error('Error reading file:', error);
          reject(error);
        };
        
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error in analyzeEmotion:', error);
      throw error;
    }
  }
  
  /**
   * Maps emotion types to mood descriptions
   * @param emotion The primary emotion type from Rekognition
   * @returns A user-friendly mood description
   */
  static mapEmotionToMood(emotion: string): string {
    const emotionMap: {[key: string]: string} = {
      'HAPPY': 'Happy',
      'SAD': 'Sad',
      'ANGRY': 'Stressed',
      'CONFUSED': 'Anxious',
      'DISGUSTED': 'Tired',
      'SURPRISED': 'Playful',
      'CALM': 'Relaxed',
      'FEAR': 'Anxious',
      // Add more mappings as needed
    };
    
    return emotionMap[emotion] || 'Relaxed'; // Default to Relaxed if not found
  }
}