// app/services/OpenAIService.ts

import { COLORS } from "@/app/constants/theme";
import { FoodPreferencesService, UserFoodPreferences } from "./FoodPreferencesService";

// Define interfaces for the recipe data
export interface Ingredient {
  name: string;
  benefits: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  color: string;
  ingredients: Ingredient[];
}

export class OpenAIService {
  private static API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
  private static API_URL = 'https://api.openai.com/v1/chat/completions';

  /**
   * Get user's food preferences to incorporate into recipe generation
   */
  private static async getUserPreferences(): Promise<UserFoodPreferences> {
    try {
      return await FoodPreferencesService.getLocalPreferences();
    } catch (error) {
      console.error("Error getting user preferences:", error);
      // Return empty preferences if there's an error
      return {
        diets: [],
        allergens: '',
        hasDietRestrictions: false,
        hasAllergens: false
      };
    }
  }

  /**
   * Generate recipes based on a user's mood
   * @param mood The current mood of the user
   * @param count Number of recipes to generate (default 3)
   * @returns Array of recipe objects
   */
  static async generateRecipes(mood: string, count: number = 3): Promise<Recipe[]> {
    try {
      if (!this.API_KEY) {
        throw new Error("API key is not configured");
      }

      // Get user preferences
      const userPrefs = await this.getUserPreferences();

      // Create dietary restrictions text
      let dietaryText = "";
      if (userPrefs.hasDietRestrictions) {
        dietaryText += `The user follows these dietary preferences: ${userPrefs.diets.join(', ')}. `;
      }
      
      // Create allergens text
      let allergensText = "";
      if (userPrefs.hasAllergens) {
        allergensText += `The user has these food allergies or sensitivities: ${userPrefs.allergens}. `;
      }

      const systemPrompt = `You are a nutrition expert and chef who specializes in mood-boosting foods. 
      Generate ${count} different recipe ideas that would be helpful for someone who is feeling "${mood}".
      ${dietaryText}${allergensText}Make sure all recipes are compatible with these requirements.`;

      const userPrompt = `For each recipe, include:
      1. A title
      2. A short description explaining why this food is good for someone feeling ${mood}
      3. Three key ingredients with specific benefits related to the mood
      
      Return the data in JSON format with this exact structure:
      {
        "recipes": [
          {
            "title": "Recipe Title",
            "description": "Why this is good for mood",
            "ingredients": [
              {"name": "Ingredient 1", "benefits": "Specific benefit"},
              {"name": "Ingredient 2", "benefits": "Specific benefit"},
              {"name": "Ingredient 3", "benefits": "Specific benefit"}
            ]
          }
        ]
      }
      
      Do not include any text before or after the JSON.`;

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to generate recipes");
      }

      const data = await response.json();
      
      // Check if we have a valid response structure
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response structure from OpenAI");
      }
      
      const content = data.choices[0].message.content;
      
      // Strip markdown code blocks if present
      let cleanedContent = content;
      if (content.startsWith("```json") || content.startsWith("```JSON")) {
        cleanedContent = content.replace(/^```json\n|^```JSON\n/, "").replace(/```$/, "");
      };
      
      // Try to parse the JSON content from the response
      let recipesData;
      try {
        // First, attempt to parse as is
        recipesData = JSON.parse(cleanedContent);
      } catch (e) {
        // If that fails, try to extract JSON from the text
        try {
          // Find the first { and last } to extract JSON object
          const jsonStart = cleanedContent.indexOf('{');
          const jsonEnd = cleanedContent.lastIndexOf('}') + 1;
          
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            const jsonStr = cleanedContent.substring(jsonStart, jsonEnd);
            recipesData = JSON.parse(jsonStr);
          } else {
            throw new Error("Couldn't extract valid JSON from the response");
          }
        } catch (extractError) {
          // If all parsing attempts fail, throw an error
          console.log("Parsing failed:", content);
          throw new Error("Failed to parse recipe data from API response");
        }
      }
      
      // Handle different response formats
      let recipes = [];
      if (recipesData.recipes) {
        recipes = recipesData.recipes;
      } else if (Array.isArray(recipesData)) {
        recipes = recipesData;
      } else {
        // If we can't determine the structure, build it from the recipesData itself
        recipes = [recipesData];
      }
      
      // Assign colors and IDs to the recipes
      const colors = [COLORS.sandBeige, COLORS.terracotta, COLORS.oliveGreen, COLORS.earthBrown, COLORS.sageMoss];
      return recipes.map((recipe: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        title: recipe.title,
        description: recipe.description,
        color: colors[index % colors.length],
        ingredients: recipe.ingredients
      }));
    } catch (error) {
      console.error("Error generating recipes:", error);
      throw error; // Propagate the error
    }
  }

  /**
   * Generate recipes based on multiple moods (from emotion analysis)
   * @param moods Array of detected moods in order of confidence
   * @param count Number of recipes to generate
   * @returns Array of recipe objects
   */
  static async generateRecipesForMultipleMoods(moods: string[], count: number = 3): Promise<Recipe[]> {
    try {
      if (!this.API_KEY) {
        throw new Error("API key is not configured");
      }
      
      if (moods.length === 0) {
        throw new Error("No moods provided for recipe generation");
      }

      // Get user preferences
      const userPrefs = await this.getUserPreferences();

      // Create dietary restrictions text
      let dietaryText = "";
      if (userPrefs.hasDietRestrictions) {
        dietaryText += `The user follows these dietary preferences: ${userPrefs.diets.join(', ')}. `;
      }
      
      // Create allergens text
      let allergensText = "";
      if (userPrefs.hasAllergens) {
        allergensText += `The user has these food allergies or sensitivities: ${userPrefs.allergens}. `;
      }

      // Create a description of the user's emotional state
      const moodDescription = moods.length === 1 
        ? `feeling "${moods[0]}"`
        : `primarily feeling "${moods[0]}" with elements of "${moods.slice(1).join('" and "')}"`;

      const systemPrompt = `You are a nutrition expert and chef who specializes in mood-boosting foods. 
      Generate ${count} different recipe ideas that would be helpful for someone who is ${moodDescription}.
      ${dietaryText}${allergensText}Make sure all recipes are compatible with these requirements.`;

      const userPrompt = `For each recipe, include:
      1. A title
      2. A short description explaining why this food combination is good for someone with this emotional profile
      3. Three key ingredients with specific benefits related to the user's mood blend
      
      The recipes should primarily address the dominant mood (${moods[0]}) while also considering the secondary emotional states.
      
      Return the data in JSON format with this exact structure:
      {
        "recipes": [
          {
            "title": "Recipe Title",
            "description": "Why this is good for the user's mood blend",
            "ingredients": [
              {"name": "Ingredient 1", "benefits": "Specific benefit for this mood combination"},
              {"name": "Ingredient 2", "benefits": "Specific benefit for this mood combination"},
              {"name": "Ingredient 3", "benefits": "Specific benefit for this mood combination"}
            ]
          }
        ]
      }
      
      Do not include any text before or after the JSON.`;

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to generate recipes");
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response structure from OpenAI");
      }
      
      const content = data.choices[0].message.content;
      
      // Process content following the same pattern as generateRecipes
      let cleanedContent = content;
      if (content.startsWith("```json") || content.startsWith("```JSON")) {
        cleanedContent = content.replace(/^```json\n|^```JSON\n/, "").replace(/```$/, "");
      };
      
      let recipesData;
      try {
        recipesData = JSON.parse(cleanedContent);
      } catch (e) {
        try {
          const jsonStart = cleanedContent.indexOf('{');
          const jsonEnd = cleanedContent.lastIndexOf('}') + 1;
          
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            const jsonStr = cleanedContent.substring(jsonStart, jsonEnd);
            recipesData = JSON.parse(jsonStr);
          } else {
            throw new Error("Couldn't extract valid JSON from the response");
          }
        } catch (extractError) {
          // If all parsing attempts fail, throw an error
          console.log("Parsing failed:", content);
          throw new Error("Failed to parse recipe data from API response");
        }
      }
      
      let recipes = [];
      if (recipesData.recipes) {
        recipes = recipesData.recipes;
      } else if (Array.isArray(recipesData)) {
        recipes = recipesData;
      } else {
        recipes = [recipesData];
      }
      
      const colors = [COLORS.sandBeige, COLORS.terracotta, COLORS.oliveGreen, COLORS.earthBrown, COLORS.sageMoss];
      return recipes.map((recipe: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        title: recipe.title,
        description: recipe.description,
        color: colors[index % colors.length],
        ingredients: recipe.ingredients
      }));
    } catch (error) {
      console.error("Error generating recipes for multiple moods:", error);
      throw error; // Propagate the error
    }
  }
}