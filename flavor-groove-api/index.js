// Получить все рецепты с фильтрами
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db"); // Подключение к базе данных (убедись, что `db.js` настроен правильно)

app.use(cors());
app.use(bodyParser.json());

app.get("/recipes", async (req, res) => {
  const { search, category, ingredient } = req.query;
  let query = "SELECT * FROM recipes WHERE 1=1"; // Начальный запрос (1=1, чтобы было проще добавлять условия)
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
  const { id } = req.params;

  try {
    const recipe = await db.oneOrNone("SELECT * FROM recipes WHERE id = $1", [
      id,
    ]);

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
  try {
    const ingredients = await db.any(
      "SELECT DISTINCT UNNEST(string_to_array(ingredients, ', ')) AS ingredient FROM recipes"
    );
    res.json(ingredients.map((ing) => ing.ingredient)); // Отправляем массив строк
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Добавить новый рецепт
app.post("/recipes", async (req, res) => {
  const { title, description, ingredients, instructions, image_url, user_id } =
    req.body;

  if (!title || !description || !ingredients || !instructions || !user_id) {
    return res
      .status(400)
      .json({ error: "All fields except image_url are required" });
  }

  try {
    const newRecipe = await db.one(
      "INSERT INTO recipes (title, description, ingredients, instructions, image_url, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, description, ingredients, instructions, image_url || "", user_id]
    );
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error("Error adding recipe:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
