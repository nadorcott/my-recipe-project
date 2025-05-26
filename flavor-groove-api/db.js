const pgp = require("pg-promise")();
require("dotenv").config(); // Подключаем переменные окружения

const db = pgp(process.env.DATABASE_URL); // Используем URL базы из .env

db.connect()
  .then((obj) => {
    console.log("✅ Connected to the database");
    obj.done(); // Закрываем соединение
  })
  .catch((error) => {
    console.error("❌ Database connection error:", error);
  });

async function initDB() {
  try {
    // Создание таблицы пользователей
    await db.none('CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL );');

    // Создание таблицы рецептов
    await db.none(
      'CREATE TABLE IF NOT EXISTS recipes ( id SERIAL PRIMARY KEY,title TEXT NOT NULL,description TEXT NOT NULL,ingredients TEXT NOT NULL,instructions TEXT NOT NULL,image_url TEXT,category TEXT,user_id INTEGER REFERENCES users(id));'
    );

    console.log("✅ Таблицы созданы");

    // Проверим, есть ли пользователь
    const userCount = await db.one("SELECT COUNT(*) FROM users");
    if (parseInt(userCount.count) === 0) {
      const user = await db.one(
        `INSERT INTO users (name, email, password)
         VALUES ($1, $2, $3)
         RETURNING *`,
        ["Demo User", "demo@example.com", "password123"]
      );

      // Добавим тестовый рецепт от этого пользователя
      await db.none(
        `INSERT INTO recipes (title, description, ingredients, instructions, image_url, category, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          "Паста с томатами",
          "Простой и вкусный рецепт пасты.",
          "макароны, помидоры, чеснок, оливковое масло, соль, перец",
          "1. Отварите макароны. 2. Обжарьте томаты с чесноком. 3. Смешайте и подавайте.",
          "https://example.com/image.jpg",
          "итальянская",
          user.id
        ]
      );

      console.log("✅ Добавлен пользователь и тестовый рецепт");
    } else {
      console.log("📦 База уже содержит пользователей");
    }

  } catch (err) {
    console.error("❌ Ошибка при инициализации базы:", err);
  }
}

initDB();

module.exports = db; // Экспортируем объект базы

