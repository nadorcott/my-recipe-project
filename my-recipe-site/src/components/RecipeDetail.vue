<template>
  <div v-if="recipe">
    <h1>{{ recipe.title }}</h1>
    <img
      :src="recipe.image_url || 'https://via.placeholder.com/150'"
      alt="Recipe Image"
      class="recipe-image"
    />

    <h3>Description</h3>
    <p>{{ recipe.description }}</p>

    <h3>Ingredients</h3>
    <div
      class="ingredients-list"
      v-if="recipe.ingredients && recipe.ingredients.length"
    >
      <span
        v-for="(ingredient, index) in recipe.ingredients.split(', ')"
        :key="index"
        class="ingredient-item"
      >
        {{ ingredient }}
      </span>
    </div>
    <p v-else>No ingredients available.</p>

    <h3>Instructions</h3>
    <p v-if="recipe.instructions">{{ recipe.instructions }}</p>
    <p v-else>No instructions available.</p>
  </div>
  <p v-else>Loading recipe...</p>
</template>

<script>
export default {
  data() {
    return {
      recipe: null,
    };
  },
  async created() {
    const recipeId = this.$route.params.id;
    try {
      const response = await fetch(`http://localhost:5000/recipes/${recipeId}`);
      if (!response.ok) throw new Error("Recipe not found");
      this.recipe = await response.json();
    } catch (error) {
      console.error("Error fetching recipe:", error);
    }
  },
};
</script>

<style>
.recipe-image {
  width: 100%;
  max-width: 400px;
  height: auto;
  display: block;
  margin: 0 auto 20px;
  border-radius: 10px;
}
.ingredients-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ingredient-item {
  padding: 10px 15px;
  background: #f4f4f4;
  border-radius: 5px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}
</style>
