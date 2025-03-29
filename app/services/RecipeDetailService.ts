// app/services/RecipeDetailService.ts

import { COLORS } from "@/app/constants/theme";

// Define types for recipe details
export interface RecipeStep {
  title: string;
  description: string;
}

export interface RecipeDetails {
  title: string;
  difficulty: string;
  time: string;
  servings: string;
  ingredients: string[];
  instructions: RecipeStep[];
}

export class RecipeDetailService {
  private static API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
  private static API_URL = 'https://api.openai.com/v1/chat/completions';

  /**
   * Generate detailed recipe information based on a recipe title and mood
   * @param recipeTitle The title of the recipe
   * @param mood The user's current mood
   * @returns Detailed recipe information
   */
  static async getRecipeDetails(recipeTitle: string, mood?: string): Promise<RecipeDetails> {
    try {
      if (!this.API_KEY) {
        return this.getDefaultRecipeDetails(recipeTitle);
      }

      const systemPrompt = `You are a nutrition expert and chef who specializes in mood-boosting foods. 
      Create a detailed recipe for "${recipeTitle}" that would be helpful for someone who is feeling ${mood || "tired"}.`;

      const userPrompt = `Please provide a complete recipe with:
      1. A difficulty level (Very Easy, Easy, Medium, Hard)
      2. Preparation time
      3. Number of servings
      4. A list of ingredients with measurements
      5. Step-by-step instructions, with each step having a title and detailed description
      
      Return the data in JSON format with this exact structure:
      {
        "difficulty": "Easy",
        "time": "15 Minutes",
        "servings": "2 Servings",
        "ingredients": ["Ingredient 1 with quantity", "Ingredient 2 with quantity", ...],
        "instructions": [
          {
            "title": "Step 1 title",
            "description": "Detailed instructions for step 1"
          },
          {
            "title": "Step 2 title",
            "description": "Detailed instructions for step 2"
          }
        ]
      }
      
      Keep the recipe simple, nutritious, and easy to prepare. Focus on whole foods and ingredients that support brain health.`;

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
        return this.getDefaultRecipeDetails(recipeTitle);
      }

      const data = await response.json();
      
      // Check if we have a valid response structure
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        return this.getDefaultRecipeDetails(recipeTitle);
      }
      
      const content = data.choices[0].message.content;
      
      // Strip markdown code blocks if present
      let cleanedContent = content;
      if (content.startsWith("```json") || content.startsWith("```JSON")) {
        cleanedContent = content.replace(/^```json\n|^```JSON\n/, "").replace(/```$/, "");
      }

      let recipeData;
      try {
        // Attempt to parse the JSON response
        recipeData = JSON.parse(cleanedContent);
      } catch (e) {
        // If parsing fails, extract JSON from the text
        try {
          const jsonStart = cleanedContent.indexOf('{');
          const jsonEnd = cleanedContent.lastIndexOf('}') + 1;
          
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            const jsonStr = cleanedContent.substring(jsonStart, jsonEnd);
            recipeData = JSON.parse(jsonStr);
          } else {
            throw new Error("Couldn't extract valid JSON");
          }
        } catch (extractError) {
          return this.getDefaultRecipeDetails(recipeTitle);
        }
      }

      // Return the recipe details with the title
      return {
        title: recipeTitle,
        difficulty: recipeData.difficulty || "Easy",
        time: recipeData.time || "15 Minutes",
        servings: recipeData.servings || "2 Servings",
        ingredients: recipeData.ingredients || [],
        instructions: recipeData.instructions || []
      };
    } catch (error) {
      return this.getDefaultRecipeDetails(recipeTitle);
    }
  }

  /**
   * Provide default recipe details if API fails
   * @param recipeTitle The title of the recipe
   * @returns Default recipe details
   */
  private static getDefaultRecipeDetails(recipeTitle: string): RecipeDetails {
    // Generate generic recipe details based on the title
    const isSmoothie = recipeTitle.toLowerCase().includes('smoothie');
    const isBowl = recipeTitle.toLowerCase().includes('bowl');
    const isTea = recipeTitle.toLowerCase().includes('tea') || recipeTitle.toLowerCase().includes('latte');
    const isToast = recipeTitle.toLowerCase().includes('toast');
    
    let template: RecipeDetails;

    if (isSmoothie) {
      template = {
        title: recipeTitle,
        difficulty: "Very Easy",
        time: "5 Minutes",
        servings: "1 Serving",
        ingredients: [
          "1 cup plant-based milk",
          "1 banana",
          "1/2 cup frozen berries",
          "1 tablespoon nut butter",
          "1 teaspoon honey or maple syrup (optional)",
          "1 tablespoon chia seeds"
        ],
        instructions: [
          {
            title: "Prepare Ingredients",
            description: "Gather all ingredients and measure them out. Peel the banana and break it into chunks."
          },
          {
            title: "Blend",
            description: "Add all ingredients to a blender and blend on high until smooth and creamy, about 30-60 seconds."
          },
          {
            title: "Serve",
            description: "Pour into a glass or bowl. If serving as a smoothie bowl, top with additional fruits, nuts, or granola."
          }
        ]
      };
    } else if (isBowl) {
      template = {
        title: recipeTitle,
        difficulty: "Easy",
        time: "15 Minutes",
        servings: "1 Serving",
        ingredients: [
          "1/2 cup cooked quinoa or rice",
          "1 cup mixed vegetables (spinach, bell peppers, cherry tomatoes)",
          "1/2 avocado, sliced",
          "1/4 cup chickpeas or beans",
          "1 tablespoon olive oil",
          "1 teaspoon lemon juice",
          "Salt and pepper to taste"
        ],
        instructions: [
          {
            title: "Prepare Base",
            description: "If not already cooked, prepare quinoa or rice according to package instructions. Place in the bottom of a bowl."
          },
          {
            title: "Arrange Toppings",
            description: "Arrange vegetables, avocado, and chickpeas on top of the base in sections."
          },
          {
            title: "Make Dressing",
            description: "In a small bowl, whisk together olive oil, lemon juice, salt, and pepper."
          },
          {
            title: "Finish and Serve",
            description: "Drizzle the dressing over the bowl and enjoy immediately."
          }
        ]
      };
    } else if (isTea) {
      template = {
        title: recipeTitle,
        difficulty: "Very Easy",
        time: "10 Minutes",
        servings: "1 Serving",
        ingredients: [
          "1 cup milk of choice",
          "1 teaspoon honey or maple syrup",
          "1/4 teaspoon cinnamon",
          "1/4 teaspoon turmeric (if golden latte)",
          "1 tea bag or 1 teaspoon loose tea leaves"
        ],
        instructions: [
          {
            title: "Heat Milk",
            description: "In a small saucepan, gently heat the milk over medium-low heat until hot but not boiling."
          },
          {
            title: "Add Flavors",
            description: "Whisk in honey, cinnamon, and turmeric (if using) until well combined."
          },
          {
            title: "Add Tea",
            description: "Add the tea bag or leaves and allow to steep for 3-5 minutes, or according to tea package instructions."
          },
          {
            title: "Strain and Serve",
            description: "Remove the tea bag or strain out tea leaves. Pour into your favorite mug and enjoy while warm."
          }
        ]
      };
    } else if (isToast) {
      template = {
        title: recipeTitle,
        difficulty: "Very Easy",
        time: "5 Minutes",
        servings: "1 Serving",
        ingredients: [
          "1 slice of bread (whole grain recommended)",
          "1 tablespoon nut butter or avocado",
          "1/2 banana, sliced or 1/4 avocado, mashed",
          "Pinch of cinnamon or red pepper flakes",
          "Drizzle of honey (optional)"
        ],
        instructions: [
          {
            title: "Toast the Bread",
            description: "Place the bread in a toaster and toast to your preferred level of crispiness."
          },
          {
            title: "Add Spread",
            description: "Spread the nut butter or mashed avocado evenly over the warm toast."
          },
          {
            title: "Add Toppings",
            description: "Arrange banana slices on top, or add other toppings of your choice."
          },
          {
            title: "Final Touch",
            description: "Sprinkle with cinnamon for sweet toast, or red pepper flakes for savory avocado toast. Add a drizzle of honey if desired."
          }
        ]
      };
    } else {
      // Generic template for any other recipe
      template = {
        title: recipeTitle,
        difficulty: "Easy",
        time: "20 Minutes",
        servings: "2 Servings",
        ingredients: [
          "2 cups main ingredient",
          "1 tablespoon olive oil or butter",
          "1/2 cup supplementary ingredient",
          "1 teaspoon seasoning",
          "Salt and pepper to taste"
        ],
        instructions: [
          {
            title: "Prepare Ingredients",
            description: "Gather and measure all ingredients. Wash and chop any produce as needed."
          },
          {
            title: "Cook Main Components",
            description: "Heat oil in a pan over medium heat. Add main ingredients and cook until properly done."
          },
          {
            title: "Combine Ingredients",
            description: "Add the remaining ingredients and cook for another few minutes until everything is well combined."
          },
          {
            title: "Serve",
            description: "Plate the dish and serve immediately while warm. Enjoy!"
          }
        ]
      };
    }

    return template;
  }
}