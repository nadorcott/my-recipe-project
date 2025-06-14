require('dotenv').config();
const express = require("express");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Added for password hashing                                                                                                                              
const SECRET_KEY = process.env.JWT_SECRET; // Changed to use environment variable                                                                                                              

const multer = require("multer");
const path = require("path");

const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory as a buffer

const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db"); // Подключение к базе данных                                                                                                                                       

const cloudinary = require('cloudinary').v2;
// Ensure dotenv is loaded early to access process.env variables                                                                                                                         
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors());
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  console.log("Server is working");
  res.send("API is running!"); // Added a response for clarity                                                                                                                                 
});

// Получить все рецепты с фильтрами                                                                                                                                                            
app.get("/recipes", async (req, res) => {
  console.log("/recipes");

  const { search, category, ingredient } = req.query;
  let query = "SELECT * FROM recipes WHERE 1=1";
  let values = [];

  if (search) {
    query += " AND (title ILIKE $1 OR ingredients ILIKE $1)";
    values.push(`%${search}%`);
  }

  if (category) {
    query += ` AND category ILIKE $${values.length + 1}`;
    values.push(`%${category}%`);
  }

  if (ingredient) {
    query += ` AND ingredients ILIKE $${values.length + 1}`;
    values.push(`%${ingredient}%`);
  }

  query += " ORDER BY id ASC";

  try {
    const recipes = await db.any(query, values);
    res.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Получить рецепт по ID                                                                                                                                                                       
app.get("/recipes/:id", async (req, res) => {
  console.log("/recipes:id");
  const { id } = req.params;

  try {
    const recipe = await db.oneOrNone(
      `SELECT recipes.*, users.name AS author_name                                                                                                                                             
       FROM recipes                                                                                                                                                                            
       JOIN users ON recipes.user_id = users.id                                                                                                                                                
       WHERE recipes.id = $1`,
      [id]
    );

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Получить все уникальные ингредиенты                                                                                                                                                         
app.get("/ingredients", async (req, res) => {
  console.log("/ingredients");
  try {
    const ingredients = await db.any(
      "SELECT DISTINCT UNNEST(string_to_array(ingredients, ', ')) AS ingredient FROM recipes"
    );
    res.json(ingredients.map((ing) => ing.ingredient));
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

function authenticateToken(req, res, next) {
  console.log("/authenticateToken");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // ADD THIS LOG: Check if token is received                                                                                                                                                  
  console.log("Backend: Token received in auth middleware:", token ? "Present" : "Missing");
  // ADD THIS LOG: Check SECRET_KEY value (for debugging, remove in production)                                                                                                                
  console.log("Backend: JWT_SECRET value:", SECRET_KEY ? "Defined" : "Undefined/Null");


  if (!token) {
    console.log("Backend: Authentication failed - No token provided.");
    return res.sendStatus(401); // Unauthorized                                                                                                                                                
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    // ADD THIS LOG: Check if the callback is entered                                                                                                                                          
    console.log("Backend: jwt.verify callback entered.");
    if (err) {
      console.error("Backend: Authentication failed - Token verification error:", err.message); // Log the error message                                                                       
      console.error("Backend: Token verification error stack:", err.stack); // Log the stack trace                                                                                             
      return res.sendStatus(403); // Forbidden (invalid token)                                                                                                                                 
    }
    req.user = user; // { userId: ... }                                                                                                                                                        
    console.log("Backend: Authentication successful for user ID:", user.userId);
    next();
  });
}

// Добавить новый рецепт 

app.post("/recipes", authenticateToken, upload.single("image"), async (req, res) => {

  console.log("/recipes(post)");
  // ADD THIS LOG:                                                                                                                                                                             
  console.log("Backend: req.file (from Multer):", req.file);

  const { title, description, ingredients, instructions, category } = req.body;
  let imageUrl = "";

  if (req.file) {
    try {
      // Upload image to Cloudinary                                                                                                                                                            
      const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
        folder: "flavor_groove_recipes",
        resource_type: "auto"
      });
      imageUrl = result.secure_url;
      // ADD THIS LOG:                                                                                                                                                                         
      console.log("Backend: Cloudinary upload successful. Image URL:", imageUrl);
    } catch (uploadError) {
      console.error("Backend: Error uploading to Cloudinary:", uploadError.message); // Log message                                                                                            
      console.error("Backend: Cloudinary error stack:", uploadError.stack); // Log stack trace                                                                                                 
      return res.status(500).json({ error: "Image upload failed" });
    }
  } else {
    // ADD THIS LOG:                                                                                                                                                                           
    console.log("Backend: No image file received (req.file is undefined).");
  }

  console.log("Received category:", category);
  const userId = req.user.userId;
  console.log("▶️ New recipe received (req.body):", req.body);

  if (!title || !description || !ingredients || !instructions) {
    return res
      .status(400)
      .json({ error: "All fields except image_url are required" });
  }

  try {
    const newRecipe = await db.one(
      "INSERT INTO recipes (title, description, ingredients, instructions, image_url, category, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [title, description, ingredients, instructions, imageUrl || "", category || "", userId]
    );
    // ADD THIS LOG:                                                                                                                                                                           
    console.log("Backend: Recipe successfully added to DB:", newRecipe);
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error("Backend: Error adding recipe to DB:", error.message); // Log message                                                                                                        
    console.error("Backend: Database error stack:", error.stack); // Log stack trace                                                                                                           
    res.status(500).json({ error: "Database error" });
  }
});


// РЕГИСТРАЦИЯ                                                                                                                                                                                 
app.post('/register', async (req, res) => {
  console.log("/register");
  const { name, email, password } = req.body;

  try {
    // Hash the password before storing it                                                                                                                                                     
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is a good number of salt rounds                                                                                              

    const newUser = await db.one(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword] // Store the hashed password                                                                                                                               
    );
    res.status(201).json(newUser);
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Delete a recipe                                                                                                                                                                             
app.delete("/recipes/:id", authenticateToken, async (req, res) => {
  console.log("/recipes(delete)");
  const { id } = req.params;
  const userId = req.user.userId; // User ID from the authenticated token                                                                                                                      

  try {
    // First, fetch the existing recipe to check ownership                                                                                                                                     
    const existingRecipe = await db.oneOrNone("SELECT user_id FROM recipes WHERE id = $1", [id]);

    if (!existingRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Authorization check: Only the owner can delete the recipe                                                                                                                               
    if (existingRecipe.user_id !== userId) {
      return res.status(403).json({ error: "You are not authorized to delete this recipe." });
    }

    // If authorized, proceed with deletion                                                                                                                                                    
    await db.none("DELETE FROM recipes WHERE id = $1", [id]);
    console.log(`Backend: Recipe with ID ${id} successfully deleted.`);
    res.status(204).send(); // 204 No Content is standard for successful DELETE with no response body                                                                                          
  } catch (error) {
    console.error("Backend: Error deleting recipe:", error.message);
    console.error("Backend: Database error stack:", error.stack);
    res.status(500).json({ error: "Database error" });
  }
});
// ВХОД                                                                                                                                                                                        
app.post('/login', async (req, res) => {
  console.log("/login");
  const { email, password } = req.body;

  try {
    // Fetch user by email only                                                                                                                                                                
    const user = await db.oneOrNone(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    // If user exists, compare the provided password with the stored hash                                                                                                                      
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });
      res.json({ message: 'Login successful', token });
    } else {
      // If user not found or password doesn't match                                                                                                                                           
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get("/my-recipes", authenticateToken, async (req, res) => {
  console.log("/my-recipes");
  const userId = req.user.userId;

  try {
    const recipes = await db.any(
      "SELECT * FROM recipes WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );
    res.json(recipes);
  } catch (error) {
    console.error("Error fetching user recipes:", error);
    res.status(500).json({ error: "Failed to load recipes" });
  }
});

// Запуск сервера                                                                                                                                                                              
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});                                                                    
