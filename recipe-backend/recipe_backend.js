const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { extractIngredientsFromRecipe } = require('./ingridients_llm');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS for frontend requests
app.use(cors({
  origin: 'http://localhost:3000', // or your frontend URL
  credentials: true
}));
app.use(express.json());

// Check if the upload directory exists, create it if it doesn't
const uploadDir = path.resolve(__dirname, '../recipe-manager-frontend/public/static/');
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created upload directory: ${uploadDir}`);
  } catch (err) {
    console.error(`Failed to create upload directory: ${err}`);
  }
}

// Set up storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|webp|bmp|svg/i;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Accepted types: ${fileTypes}`));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Modify the error handling for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ 
      message: 'File upload error', 
      error: err.message 
    });
  } else if (err) {
    return res.status(500).json({ 
      message: 'Server error during upload', 
      error: err.message 
    });
  }
  next();
});

// Store recipes in a JSON file for persistence
const RECIPES_FILE = path.join(__dirname, 'recipes.json');

// Helper function to read recipes
const getRecipes = () => {
  if (!fs.existsSync(RECIPES_FILE)) {
    return [];
  }
  const data = fs.readFileSync(RECIPES_FILE, 'utf8');
  const recipes = JSON.parse(data);
  
  // Ensure all recipes have the necessary fields
  recipes.forEach(recipe => {
    if (!recipe.hasOwnProperty('ingredients')) {
      recipe.ingredients = [];
    }
    if (!recipe.hasOwnProperty('recipeText')) {
      recipe.recipeText = '';
    }
  });
  
  return recipes;
};

// Helper function to write recipes
const saveRecipes = (recipes) => {
  fs.writeFileSync(RECIPES_FILE, JSON.stringify(recipes, null, 2));
};

// GET endpoint to retrieve all recipes
app.get('/api/recipes', (req, res) => {
  try {
    const recipes = getRecipes();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving recipes', error: error.toString() });
  }
});

// GET endpoint to retrieve a specific recipe by name
app.get('/api/recipes/:recipeName', (req, res) => {
  try {
    const recipes = getRecipes();
    const recipe = recipes.find(r => r.Name === req.params.recipeName);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving recipe', error: error.toString() });
  }
});

// PUT endpoint to update recipe rating
app.put('/api/recipes/:id/rating', (req, res) => {
  try {
    const { rating } = req.body;
    if (rating === undefined || rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating. Must be between 0 and 5' });
    }
    
    const recipes = getRecipes();
    const recipeIndex = recipes.findIndex(r => r.id === parseInt(req.params.id));
    
    if (recipeIndex === -1) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    recipes[recipeIndex].Rating = parseFloat(rating);
    saveRecipes(recipes);
    
    res.json(recipes[recipeIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating rating', error: error.toString() });
  }
});

// PUT endpoint to update recipe text
app.put('/api/recipes/:id/text', (req, res) => {
  try {
    const { recipeText } = req.body;
    if (recipeText === undefined) {
      return res.status(400).json({ message: 'Recipe text is required' });
    }
    
    const recipes = getRecipes();
    const recipeIndex = recipes.findIndex(r => r.id === parseInt(req.params.id));
    
    if (recipeIndex === -1) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    recipes[recipeIndex].recipeText = recipeText;
    saveRecipes(recipes);
    
    res.json(recipes[recipeIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating recipe text', error: error.toString() });
  }
});

// PUT endpoint to update recipe ingredients
app.put('/api/recipes/:id/ingredients', (req, res) => {
  try {
    //console.log('Received ingredients update request for ID:', req.params.id);
    //console.log('Request body:', req.body);
    
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ message: 'Valid ingredients array is required' });
    }
    
    const recipes = getRecipes();
    console.log('All recipe IDs:', recipes.map(r => r.id));
    
    // Convert both IDs to strings for comparison
    const recipeIndex = recipes.findIndex(r => String(r.id) === String(req.params.id));
    console.log('Found recipe index:', recipeIndex);
    
    if (recipeIndex === -1) {
      console.log('Recipe not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    //console.log(`Updating ingredients for recipe ${recipes[recipeIndex].Name}:`, ingredients);
    recipes[recipeIndex].ingredients = ingredients;
    saveRecipes(recipes);
    
    res.json(recipes[recipeIndex]);
  } catch (error) {
    console.error('Error updating ingredients:', error);
    res.status(500).json({ message: 'Error updating ingredients', error: error.toString() });
  }
});

// PUT endpoint to update recipe links
app.put('/api/recipes/:id/links', (req, res) => {
  try {
    const { links } = req.body;
    if (!links || !Array.isArray(links)) {
      return res.status(400).json({ message: 'Valid links array is required' });
    }
    
    const recipes = getRecipes();
    const recipeIndex = recipes.findIndex(r => String(r.id) === String(req.params.id));
    
    if (recipeIndex === -1) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    recipes[recipeIndex].links = links;
    saveRecipes(recipes);
    
    res.json(recipes[recipeIndex]);
  } catch (error) {
    console.error('Error updating links:', error);
    res.status(500).json({ message: 'Error updating links', error: error.toString() });
  }
});

// Modify the POST endpoint to add a new recipe with optional recip se text and ingredients
app.post('/api/recipes', upload.single('image'), (req, res) => {
  try {
    //console.log('Received recipe data:', req.body);
    //console.log('Received file:', req.file);
    
    const { name, rating, recipeText } = req.body;
    let ingredients = [];
    let links = [];
    // Parse ingredients if provided
    if (req.body.ingredients) {
      try {
        ingredients = JSON.parse(req.body.ingredients);
      } catch (err) {
        console.error('Invalid ingredients format:', err);
      }
    }
    if (req.body.links) {
        try {
          links = JSON.parse(req.body.links);
        } catch (err) {
          console.error('Invalid ingredients format:', err);
        }
      }
    
    // Validate input
    if (!name || !rating) {
      //console.log('Missing required fields:', { name, rating });
      return res.status(400).json({ message: 'Name and rating are required' });
    }
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'Image file is required' });
    }

    // Format the date (e.g., "20 Jan 2024")
    const now = new Date();
    const date = now.getDate().toString().padStart(2, '0') + ' ' + 
                 now.toLocaleString('en-US', { month: 'short' }) + ' ' + 
                 now.getFullYear();

    // Create new recipe object
    const newRecipe = {
      id: Date.now(), // Use timestamp as ID
      Name: name,
      Image_path: req.file.filename,
      date: date,
      Rating: parseFloat(rating),
      recipeText: recipeText || '',
      ingredients: ingredients || [],
      links: links || []
    };

    // Add to recipes
    const recipes = getRecipes();
    recipes.push(newRecipe);
    saveRecipes(recipes);

    res.status(201).json(newRecipe);
  } catch (error) {
    console.error('Error adding recipe:', error);
    res.status(500).json({ message: 'Error adding recipe', error: error.toString() });
  }
});

// Add a new endpoint to upload photos for an existing recipe
app.post('/api/recipes/:id/photos', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No photo uploaded',
        error: 'No file received'
      });
    }

    const recipes = getRecipes();
    const recipeIndex = recipes.findIndex(r => String(r.id) === String(req.params.id));
    
    if (recipeIndex === -1) {
      return res.status(404).json({ 
        message: 'Recipe not found',
        error: `Recipe with ID ${req.params.id} not found`
      });
    }
    
    // Initialize photos array if it doesn't exist
    if (!recipes[recipeIndex].photos) {
      recipes[recipeIndex].photos = [];
    }
    
    // Add the new photo to the recipe
    recipes[recipeIndex].photos.push(req.file.filename);
    saveRecipes(recipes);
    
    res.status(201).json({ 
      message: 'Photo added successfully', 
      photoPath: req.file.filename 
    });
  } catch (error) {
    console.error('Error adding photo:', error);
    res.status(500).json({ 
      message: 'Error adding photo', 
      error: error.toString(),
      details: error.message 
    });
  }
});

// Add an endpoint to delete a photo
app.delete('/api/recipes/:id/photos/:filename', (req, res) => {
  try {
    const recipes = getRecipes();
    const recipeIndex = recipes.findIndex(r => String(r.id) === String(req.params.id));
    
    if (recipeIndex === -1) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    const filename = decodeURIComponent(req.params.filename);
    
    // Remove the photo from the recipe
    if (recipes[recipeIndex].photos) {
      const photoIndex = recipes[recipeIndex].photos.indexOf(filename);
      if (photoIndex !== -1) {
        recipes[recipeIndex].photos.splice(photoIndex, 1);
        
        // Try to delete the actual file
        try {
          const filePath = path.join(uploadDir, filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error('Error deleting photo file:', err);
          // Continue even if file deletion fails
        }
        
        saveRecipes(recipes);
        return res.json({ message: 'Photo deleted successfully' });
      }
    }
    
    res.status(404).json({ message: 'Photo not found' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ message: 'Error deleting photo', error: error.toString() });
  }
});

// New endpoint to get all photos for a recipe
app.get('/api/recipes/:id/photos', (req, res) => {
  try {
    const recipes = getRecipes();
    const recipe = recipes.find(r => String(r.id) === String(req.params.id));
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    const photosList = recipe.photos || [];
    res.json({ photos: photosList });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ message: 'Error fetching photos', error: error.toString() });
  }
});

// POST endpoint to extract ingredients from recipe text
app.post('/api/extract-ingredients', async (req, res) => {
  try {
    const { recipeText } = req.body;
    
    if (!recipeText) {
      return res.status(400).json({ 
        message: 'Recipe text is required',
        ingredients: []
      });
    }
    
    const ingredients = await extractIngredientsFromRecipe(recipeText);
    
    res.json({ 
      message: 'Ingredients extracted successfully',
      ingredients 
    });
  } catch (error) {
    console.error('Error extracting ingredients:', error);
    res.status(500).json({ 
      message: 'Error extracting ingredients', 
      error: error.toString(),
      ingredients: []
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
