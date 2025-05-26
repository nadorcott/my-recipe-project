<template>
    <div>
      <h2>My Recipes</h2>
      <ul v-if="recipes.length">
        <li v-for="recipe in recipes" :key="recipe.id">
          <router-link :to="`/recipe/${recipe.id}`">{{ recipe.title }}</router-link>
        </li>
      </ul>
      <p v-else>No recipes found.</p>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        recipes: [],
      };
    },
    async created() {
      const token = localStorage.getItem("token");
  
      try {
        const response = await axios.get("https://my-recipe-project-backend.onrender.com:10000/my-recipes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.recipes = response.data;
      } catch (error) {
        console.error("Error fetching my recipes:", error);
      }
    },
  };
  </script>
  