// app/services/StorageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecipeDetails } from './RecipeDetailService';

// Define saved recipe type with additional metadata
export interface SavedRecipe {
  id: string;
  title: string;
  mood: string;
  savedAt: string; // ISO date string
  color: string;
  recipeDetails: RecipeDetails;
}

export class StorageService {
  private static SAVED_RECIPES_KEY = 'spiritbytes_saved_recipes';

  /**
   * Save a recipe to storage
   * @param recipe The recipe to save
   * @param mood The user's mood when saving
   * @param color The color associated with the recipe card
   * @returns Promise that resolves when save is complete
   */
  static async saveRecipe(recipe: RecipeDetails, mood: string, color: string): Promise<void> {
    try {
      // Generate a unique ID
      const recipeId = `recipe_${Date.now()}`;
      
      // Create the saved recipe object with metadata
      const savedRecipe: SavedRecipe = {
        id: recipeId,
        title: recipe.title,
        mood: mood,
        savedAt: new Date().toISOString(),
        color: color,
        recipeDetails: recipe
      };
      
      // Get current saved recipes
      const savedRecipes = await this.getSavedRecipes();
      
      // Add new recipe to the list
      savedRecipes.push(savedRecipe);
      
      // Store updated list
      await AsyncStorage.setItem(
        this.SAVED_RECIPES_KEY, 
        JSON.stringify(savedRecipes)
      );
    } catch (error) {
      throw new Error('Failed to save recipe');
    }
  }

  /**
   * Check if a recipe is already saved
   * @param recipeTitle The title of the recipe to check
   * @returns Boolean indicating if recipe is saved
   */
  static async isRecipeSaved(recipeTitle: string): Promise<boolean> {
    try {
      const savedRecipes = await this.getSavedRecipes();
      return savedRecipes.some(recipe => recipe.title === recipeTitle);
    } catch (error) {
      return false;
    }
  }

  /**
   * Remove a recipe from saved recipes
   * @param recipeTitle The title of the recipe to remove
   * @returns Promise that resolves when removal is complete
   */
  static async removeRecipe(recipeTitle: string): Promise<void> {
    try {
      // Get current saved recipes
      const savedRecipes = await this.getSavedRecipes();
      
      // Filter out the recipe to remove
      const updatedRecipes = savedRecipes.filter(
        recipe => recipe.title !== recipeTitle
      );
      
      // Store updated list
      await AsyncStorage.setItem(
        this.SAVED_RECIPES_KEY, 
        JSON.stringify(updatedRecipes)
      );
    } catch (error) {
      throw new Error('Failed to remove recipe');
    }
  }

  /**
   * Get all saved recipes
   * @returns Array of saved recipes
   */
  static async getSavedRecipes(): Promise<SavedRecipe[]> {
    try {
      const recipesJson = await AsyncStorage.getItem(this.SAVED_RECIPES_KEY);
      
      if (!recipesJson) {
        return [];
      }
      
      return JSON.parse(recipesJson) as SavedRecipe[];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get a specific saved recipe by title
   * @param recipeTitle The title of the recipe to retrieve
   * @returns The saved recipe or null if not found
   */
  static async getSavedRecipeByTitle(recipeTitle: string): Promise<SavedRecipe | null> {
    try {
      const savedRecipes = await this.getSavedRecipes();
      const recipe = savedRecipes.find(r => r.title === recipeTitle);
      return recipe || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear all saved recipes
   * @returns Promise that resolves when clear is complete
   */
  static async clearSavedRecipes(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SAVED_RECIPES_KEY);
    } catch (error) {
      throw new Error('Failed to clear saved recipes');
    }
  }
}