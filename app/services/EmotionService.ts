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

export interface MappedEmotion {
  type: string;
  percentage: number;
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
      const apiResponse = await fetch('https://yvnhgvz1p8.execute-api.us-east-2.amazonaws.com/dev/analyze', {
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
   * Gets the top three emotions and maps them to user-friendly mood descriptions
   * @param emotions Array of emotions from Rekognition
   * @returns Array of the top three mapped emotions with percentages
   */
  static getTopThreeEmotions(emotions: Emotion[]): MappedEmotion[] {
    // Make sure we're working with a sorted array (highest confidence first)
    const sortedEmotions = [...emotions].sort((a, b) => b.confidence - a.confidence);
    
    // Take only the top 3 emotions (or fewer if there aren't 3)
    const topThree = sortedEmotions.slice(0, 3);
    
    // Map the emotion types to user-friendly mood names
    return topThree.map(emotion => ({
      type: this.mapEmotionToMood(emotion.type),
      percentage: Math.round(emotion.confidence) // Round to nearest integer
    }));
  }
  
  /**
   * Maps emotion types to mood descriptions
   * @param emotion The emotion type from Rekognition
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
    
    return emotionMap[emotion] || emotion.charAt(0).toUpperCase() + emotion.slice(1).toLowerCase();
  }
}