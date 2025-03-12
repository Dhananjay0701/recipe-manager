
const Replicate = require('replicate');

// Initialize Replicate client
const replicate = new Replicate({
  auth: 'r8_RWty6BytzobsRbE2uToh9zLhgi0JTbe41GRxl', // Your Replicate API key
});

/**
 * Extract ingredients from recipe text using OpenAI
 * @param {string} recipeText - The recipe text to analyze
 * @returns {Promise<Array>} - A promise that resolves to an array of ingredient objects
 */
async function extractIngredientsFromRecipe(recipeText) {
  if (!recipeText || recipeText.trim() === '') {
    return [];
  }

  try {
    const response = await replicate.run(
      "meta/meta-llama-3-8b-instruct", // Using LLaMA 3 model
      {
        input: {
          prompt: `Extract all ingredients from this recipe: ${recipeText}. Return only a JSON array of ingredients with no additional text. Each ingredient should be an object with a 'name' property and 'checked' set to false.`,
          temperature: 0.3,
          max_length: 1000
        }
      }
    );

    const content = response.join('').trim();
    
    // Handle different response formats
    try {
      // Try parsing directly
      const ingredients = JSON.parse(content);
      return Array.isArray(ingredients) ? ingredients : [];
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const ingredients = JSON.parse(jsonMatch[0]);
          return Array.isArray(ingredients) ? ingredients : [];
        } catch (e) {
          console.error('Failed to parse extracted JSON:', e);
        }
      }
      
      // As a fallback, split by lines and create ingredients
      const lines = content.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => {
          // Strip numbers, bullets, etc.
          const cleaned = line.replace(/^[\d\.\-\*\•]+\s*/, '').trim();
          return { name: cleaned, checked: false };
        });
      
      return lines;
    }
  } catch (error) {
    console.error('Error calling Replicate API:', error);
    throw error;
  }
}

module.exports = {
  extractIngredientsFromRecipe
};
