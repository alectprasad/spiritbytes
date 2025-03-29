// app/services/OpenAIService.ts

import { COLORS } from "@/app/constants/theme";

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
   * Generate recipes based on a user's mood
   * @param mood The current mood of the user
   * @param count Number of recipes to generate (default 3)
   * @returns Array of recipe objects
   */
  static async generateRecipes(mood: string, count: number = 3): Promise<Recipe[]> {
    try {
      if (!this.API_KEY) {
        return this.getFallbackRecipes(mood);
      }

      const systemPrompt = `You are a nutrition expert and chef who specializes in mood-boosting foods. 
      Generate ${count} different recipe ideas that would be helpful for someone who is feeling "${mood}".`;

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
        return this.getFallbackRecipes(mood);
      }

      const data = await response.json();
      
      // Check if we have a valid response structure
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        return this.getFallbackRecipes(mood);
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
            throw new Error("Couldn't extract valid JSON");
          }
        } catch (extractError) {
          // If all parsing attempts fail, generate a structured response manually
          console.log("Parsing failed, creating manual response from:", content);
          // Create a manual recipe structure from the response
          recipesData = this.createManualRecipesFromText(content, mood);
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
      return this.getFallbackRecipes(mood);
    }
  }

  /**
   * Provide fallback recipes in case the API fails
   * @param mood The current mood of the user
   * @returns Array of fallback recipes
   */
  /**
   * Create recipe objects from unstructured text response
   * @param text The raw text from OpenAI response
   * @param mood The user's mood
   * @returns Structured recipe objects
   */
  private static createManualRecipesFromText(text: string, mood: string): any {
    // Extract recipes from text response
    const recipes = [];
    
    // Split by numbered items (1., 2., 3., etc.)
    const recipeTextBlocks = text.split(/\d+\.\s+/).filter(block => block.trim().length > 0);
    
    recipeTextBlocks.forEach((block, index) => {
      // Extract title (usually first line or sentence)
      const lines = block.split('\n').filter(line => line.trim().length > 0);
      let title = lines[0];
      if (title.length > 50) {
        // If first line is too long, try to split by period
        const firstSentence = block.split('.')[0];
        if (firstSentence.length < 50) {
          title = firstSentence;
        } else {
          // Just take first 50 chars
          title = title.substring(0, 50) + '...';
        }
      }
      
      // Extract description (use the second paragraph or line)
      let description = "";
      if (lines.length > 1) {
        description = lines[1];
      } else {
        description = `Great for improving your ${mood} mood`;
      }
      
      // Look for ingredients
      const ingredients = [];
      const ingredientMatch = block.match(/ingredients?:?(.*?)(?:benefits|preparation|instructions|directions|steps|$)/is);
      
      if (ingredientMatch && ingredientMatch[1]) {
        // Try to extract ingredients from the matched section
        const ingredientText = ingredientMatch[1];
        const ingredientItems = ingredientText.split(/[\n•-]/).filter(item => item.trim().length > 0);
        
        ingredientItems.slice(0, 3).forEach(item => {
          ingredients.push({
            name: item.trim(),
            benefits: `Great for ${mood} mood support`
          });
        });
      }
      
      // If we couldn't extract ingredients, add some placeholders
      if (ingredients.length === 0) {
        // Add generic ingredients based on mood
        if (mood.toLowerCase() === 'calm' || mood.toLowerCase() === 'relaxed') {
          ingredients.push(
            { name: 'Chamomile Tea', benefits: 'Contains apigenin that promotes relaxation' },
            { name: 'Oats', benefits: 'Rich in melatonin for calming effects' },
            { name: 'Almonds', benefits: 'Contains magnesium which helps reduce stress' }
          );
        } else if (mood.toLowerCase() === 'happy' || mood.toLowerCase() === 'energetic') {
          ingredients.push(
            { name: 'Dark Chocolate', benefits: 'Releases endorphins for mood boosting' },
            { name: 'Bananas', benefits: 'Contains mood-enhancing vitamin B6' },
            { name: 'Berries', benefits: 'Antioxidants support brain health' }
          );
        } else {
          ingredients.push(
            { name: 'Whole Grains', benefits: 'Provides steady energy release' },
            { name: 'Leafy Greens', benefits: 'Rich in folate that helps mental function' },
            { name: 'Nuts', benefits: 'Contains healthy fats for brain health' }
          );
        }
      }
      
      recipes.push({
        title,
        description,
        ingredients
      });
    });
    
    // Return at least one recipe
    if (recipes.length === 0) {
      return { recipes: this.getFallbackRecipes(mood) };
    }
    
    return { recipes };
  }

  private static getFallbackRecipes(mood: string): Recipe[] {
    // Return some default recipes based on mood
    const fallbackRecipes: {[key: string]: Recipe[]} = {
      "Calm": [
        {
          id: '1',
          title: 'Banana & Peanut Butter Toast',
          description: 'You\'ll want something easy, comforting and soothing',
          color: COLORS.sandBeige,
          ingredients: [
            {
              name: 'Bananas',
              benefits: 'Rich in magnesium and potassium, which help relax muscles'
            },
            {
              name: 'Whole Grain Bread',
              benefits: 'Complex carbs promote serotonin production'
            },
            {
              name: 'Peanut Butter',
              benefits: 'Contains tryptophan which helps produce melatonin'
            }
          ]
        },
        {
          id: '2',
          title: 'Turmeric Golden Milk',
          description: 'A warm drink to help you unwind and relax',
          color: COLORS.terracotta,
          ingredients: [
            {
              name: 'Turmeric',
              benefits: 'Anti-inflammatory properties that help reduce stress'
            },
            {
              name: 'Warm Milk',
              benefits: 'Contains tryptophan which promotes better sleep'
            },
            {
              name: 'Honey',
              benefits: 'Natural sweetener that helps soothe the mind'
            }
          ]
        }
      ],
      "Happy": [
        {
          id: '4',
          title: 'Berry Smoothie Bowl',
          description: 'Maintain your positive mood with these uplifting foods',
          color: COLORS.terracotta,
          ingredients: [
            {
              name: 'Berries',
              benefits: 'Rich in antioxidants that support brain health'
            },
            {
              name: 'Greek Yogurt',
              benefits: 'Probiotics can enhance mood and cognitive function'
            },
            {
              name: 'Honey',
              benefits: 'Natural sweetener that helps maintain energy levels'
            }
          ]
        }
      ]
    };
    
    // Return recipes for the given mood, or default to Calm recipes
    return fallbackRecipes[mood] || fallbackRecipes["Calm"];
  }
}