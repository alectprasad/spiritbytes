// app/services/FoodPreferencesService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';

export interface UserFoodPreferences {
  diets: string[];
  allergens: string;
  hasDietRestrictions: boolean;
  hasAllergens: boolean;
}

export class FoodPreferencesService {
  // Storage keys
  private static DIET_PREFERENCES_KEY = 'spiritbytes_diet_preferences';
  private static ALLERGENS_KEY = 'spiritbytes_allergens';

  /**
   * Get user food preferences from local storage
   * @returns Promise resolving to user preferences
   */
  static async getLocalPreferences(): Promise<UserFoodPreferences> {
    try {
      const [dietsString, allergens] = await Promise.all([
        AsyncStorage.getItem(this.DIET_PREFERENCES_KEY),
        AsyncStorage.getItem(this.ALLERGENS_KEY)
      ]);

      // Log retrieval for debugging
      console.log('Retrieved from local storage:', {
        dietsString,
        allergens
      });

      const parsedDiets = dietsString ? dietsString.split(',') : [];
      const parsedAllergens = allergens || '';
      
      return {
        diets: parsedDiets,
        allergens: parsedAllergens,
        hasDietRestrictions: parsedDiets.length > 0,
        hasAllergens: parsedAllergens.trim().length > 0
      };
    } catch (error) {
      console.error('Error loading food preferences from storage:', error);
      return { diets: [], allergens: '' };
    }
  }

  /**
   * Save user food preferences to local storage
   * @param preferences User preferences object
   * @returns Promise that resolves when save is complete
   */
  static async saveLocalPreferences(preferences: UserFoodPreferences): Promise<void> {
    try {
      const dietsString = preferences.diets.join(',');
      
      // Log for debugging
      console.log('Saving to local storage:', {
        dietsKey: this.DIET_PREFERENCES_KEY,
        dietsValue: dietsString,
        allergensKey: this.ALLERGENS_KEY, 
        allergensValue: preferences.allergens
      });
      
      // Save one at a time to ensure both complete
      await AsyncStorage.setItem(this.DIET_PREFERENCES_KEY, dietsString);
      await AsyncStorage.setItem(this.ALLERGENS_KEY, preferences.allergens);
      
      // Verify the save was successful by reading back
      const savedDiets = await AsyncStorage.getItem(this.DIET_PREFERENCES_KEY);
      const savedAllergens = await AsyncStorage.getItem(this.ALLERGENS_KEY);
      
      console.log('Verified saved values:', {
        diets: savedDiets,
        allergens: savedAllergens
      });
    } catch (error) {
      console.error('Error saving food preferences to storage:', error);
      throw error;
    }
  }

  /**
   * Fetch user food preferences from Cognito
   * @returns Promise resolving to user preferences
   */
  static async fetchFromCognito(): Promise<UserFoodPreferences> {
    try {
      const attributes = await fetchUserAttributes();
      
      const diets = attributes['custom:diet'] ? attributes['custom:diet'].split(',') : [];
      const allergens = attributes['custom:allergens'] || '';
      
      const preferences = {
        diets, 
        allergens,
        hasDietRestrictions: diets.length > 0,
        hasAllergens: allergens.trim().length > 0
      };
      
      // Also save to local storage for offline access
      await this.saveLocalPreferences(preferences);
      
      return preferences;
    } catch (error) {
      console.error('Error fetching food preferences from Cognito:', error);
      
      // Fall back to local preferences if available
      return this.getLocalPreferences();
    }
  }

  /**
   * Save user food preferences to both local storage and Cognito
   * @param preferences User preferences object
   * @returns Promise that resolves when save is complete
   */
  static async savePreferences(preferences: UserFoodPreferences): Promise<void> {
    try {
      // First save locally
      await this.saveLocalPreferences(preferences);
      
      // Then update Cognito
      await updateUserAttributes({
        userAttributes: {
          'custom:diet': preferences.diets.join(','),
          'custom:allergens': preferences.allergens
        }
      });
    } catch (error) {
      console.error('Error saving food preferences to Cognito:', error);
      throw error;
    }
  }

  /**
   * Sync local preferences with Cognito (useful when reconnecting after offline updates)
   * @returns Promise that resolves when sync is complete
   */
  static async syncWithCognito(): Promise<void> {
    try {
      // Get local preferences
      const localPrefs = await this.getLocalPreferences();
      
      // Update Cognito with local preferences
      await updateUserAttributes({
        userAttributes: {
          'custom:diet': localPrefs.diets.join(','),
          'custom:allergens': localPrefs.allergens
        }
      });
    } catch (error) {
      console.error('Error syncing food preferences with Cognito:', error);
      throw error;
    }
  }
}