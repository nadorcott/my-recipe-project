import axios from "axios";

const API_URL = "https://my-recipe-project-backend.onrender.com"; // Твой локальный сервер

/**
 * Получить список рецептов по названию
 * @param {string} query - Название блюда для поиска
 * @returns {Promise<Array>} - Список рецептов
 */
export async function fetchRecipes(query = "") {
  try {
    const response = await axios.get(`${API_URL}/recipes`, {
      params: { search: query },
    });
    return response.data || [];
  } catch (error) {
    console.error("Ошибка загрузки рецептов:", error);
    return [];
  }
}

/**
 * Получить детали рецепта по ID
 * @param {string} id - ID рецепта
 * @returns {Promise<Object>} - Данные о рецепте
 */
export async function fetchRecipeById(id) {
  try {
    const response = await axios.get(`${API_URL}/recipes/${id}`);
    return response.data || null;
  } catch (error) {
    console.error("Ошибка загрузки рецепта:", error);
    return null;
  }
}

/**
 * Получить список всех ингредиентов
 * @returns {Promise<Array>}
 */
export async function fetchIngredients() {
  try {
    const response = await axios.get(`${API_URL}/ingredients`);
    return response.data || [];
  } catch (error) {
    console.error("Ошибка загрузки ингредиентов:", error);
    return [];
  }
}

/**
 * Получить список рецептов по ингредиенту
 * @param {string} ingredient - Название ингредиента
 * @returns {Promise<Array>}
 */
export async function fetchRecipesByIngredient(ingredient) {
  try {
    const response = await axios.get(`${API_URL}/recipes`, {
      params: { ingredient },
    });
    return response.data || [];
  } catch (error) {
    console.error("Ошибка загрузки рецептов по ингредиенту:", error);
    return [];
  }
}
