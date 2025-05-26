<template>
  <div>
    <h1>Home Page</h1>
    <p>Welcome to the recipe site!</p>

    <div v-if="loading">Loading recipes...</div>
    <div v-else-if="error">{{ error }}</div>
    <ul v-else class="recipe-list">
      <li v-for="recipe in recipes" :key="recipe.id" class="recipe-card">
        <router-link :to="`/recipe/${recipe.id}`">
          <img
            :src="
              recipe.image_url && recipe.image_url.trim()
                ? recipe.image_url.trim()
                : 'https://via.placeholder.com/300x200'
            "
            alt="Recipe image"
          />
          <h3>{{ recipe.title }}</h3>
        </router-link>
        <p>{{ recipe.description }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";

export default {
  setup() {
    const recipes = ref([]);
    const loading = ref(true);
    const error = ref(null);

    onMounted(async () => {
      try {
        const response = await axios.get("http://localhost:10000/recipes");
        recipes.value = response.data;
      } catch (err) {
        error.value = "Ошибка загрузки рецептов";
        console.error("Ошибка:", err);
      } finally {
        loading.value = false;
      }
    });

    return { recipes, loading, error };
  },
};
</script>

<style>
.recipe-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  list-style: none;
  padding: 0;
}

.recipe-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 200px;
  height: 300px;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px;
  text-align: center;
  background-color: #f9f9f9;
  transition: transform 0.2s;
}

.recipe-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.recipe-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
}
</style>
