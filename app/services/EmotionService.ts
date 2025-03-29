export class EmotionService {
  private static readonly BUCKET_NAME = 'spiritbytes-public-images';
  private static readonly REGION = 'us-east-2';

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
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: imageBlob,
        headers: {
          'Content-Type': 'image/jpeg'
        }
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed with status: ${uploadResponse.status}`);
      }
      
      console.log('Image uploaded successfully, calling API...');
      
      // Call your API with safer error handling
      const apiUrl = 'https://ddm3d6xmm3.execute-api.us-east-1.amazonaws.com/dev/analyze';
      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageKey: key,
          bucketName: this.BUCKET_NAME
        })
      });
      
      // Check response status
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('API returned error status:', apiResponse.status, errorText);
        throw new Error(`API request failed with status: ${apiResponse.status}`);
      }
      
      // Get the raw text and log it for debugging
      const rawText = await apiResponse.text();
      console.log('Raw API response:', rawText.substring(0, 100) + '...');
      
      // Create a fallback response in case parsing fails
      const fallbackResult: EmotionAnalysisResult = {
        success: false,
        message: "Failed to parse API response",
        emotions: []
      };
      
      // Try to parse the JSON with manual cleaning if needed
      try {
        // If the response contains invalid escape sequences, try to clean it
        const cleanedText = rawText
          .replace(/\\/g, '\\\\')  // Double escape all backslashes
          .replace(/\\"/g, '\\"')  // Fix escaped quotes
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters
          
        return JSON.parse(cleanedText) || fallbackResult;
      } catch (parseError) {
        console.error('JSON parse error after cleaning:', parseError);
        
        // As a last resort, return a basic response
        return fallbackResult;
      }
    } catch (error) {
      console.error('Error in analyzeEmotion:', error);
      throw error;
    }
  }
  
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
    };
    
    return emotionMap[emotion] || 'Relaxed';
  }
}