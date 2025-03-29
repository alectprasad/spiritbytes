// app/services/EmotionService.ts

// Define the interface before using it
export interface EmotionAnalysisResult {
  success: boolean;
  message: string;
  emotions: Emotion[];
  imageUrl?: string;
}

export interface Emotion {
  type: string;
  confidence: number;
}

export class EmotionService {
  private static readonly BUCKET_NAME = 'spiritbytes-profile-photos';
  private static readonly REGION = 'us-east-2'; // Use your region

  static async analyzeEmotion(imageUri: string): Promise<EmotionAnalysisResult> {
    try {
      // Generate a unique key for the image
      const timestamp = new Date().getTime();
      const randomId = Math.random().toString(36).substring(2, 15);
      const key = `emotion-${timestamp}-${randomId}.jpg`;
      
      // URL for direct upload to S3
      const uploadUrl = `https://${this.BUCKET_NAME}.s3.${this.REGION}.amazonaws.com/${key}`;
      
      // Read the image as blob
      const response = await fetch(imageUri);
      const imageBlob = await response.blob();
      
      console.log('Uploading image to S3...');
      
      // Upload directly to S3 bucket
      await fetch(uploadUrl, {
        method: 'PUT',
        body: imageBlob,
        headers: {
          'Content-Type': 'image/jpeg'
        }
      });
      
      console.log('Image uploaded, calling API...');
      
      // Call your Lambda with the image key
      const apiResponse = await fetch('https://ddm3d6xmm3.execute-api.us-east-1.amazonaws.com/dev/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageKey: key,
          bucketName: this.BUCKET_NAME
        })
      });
      
      return await apiResponse.json();
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