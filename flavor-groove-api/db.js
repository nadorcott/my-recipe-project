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

module.exports = db; // Экспортируем объект базы
