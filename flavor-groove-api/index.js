const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Added for password hashing                                                                                                                              
const SECRET_KEY = process.env.JWT_SECRET; // Changed to use environment variable                                                                                                              

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db"); // Подключение к базе данных                                                                                                                                       

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads")); // Keep for local testing, but remember ephemeral storage for deployment                                                                       

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
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // { userId: ... }                                                                                                                                                        
    next();
  });
}

// Добавить новый рецепт                                                                                                                                                                       
app.post("/recipes", authenticateToken, upload.single("image"), async (req, res) => {
  console.log("/recipes(post)");
  const { title, description, ingredients, instructions, category } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : ""; // Uses multer for local file path                                                                                        
  console.log("Received category:", category);
  const userId = req.user.userId;
  console.log("▶️ New recipe received:", req.body);

  if (!title || !description || !ingredients || !instructions) {
    return res
      .status(400)
      .json({ error: "All fields except image_url are required" });
  }

  try {
    const newRecipe = await db.one(
      "INSERT INTO recipes (title, description, ingredients, instructions, image_url, category, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [title, description, ingredients, instructions, image_url || "", category || "", userId]
    );
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error("Error adding recipe:", error);
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