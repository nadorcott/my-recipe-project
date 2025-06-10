<template>
  <div>
    <h1>Recipes</h1>

    <!-- Поиск по названию -->
    <div>
      <input v-model="searchQuery" placeholder="Search recipes..." @keyup.enter="searchRecipes" />
      <button @click="searchRecipes">Search</button>
    </div>

    <!-- Фильтр по ингредиентам -->
    <div>
      <label for="ingredient">Ingredient:</label>
      <input type="text" v-model="ingredientQuery" placeholder="Type an ingredient..."
        @input="fetchIngredientSuggestions" @focus="showSuggestions = true" />
      <ul v-if="showSuggestions && filteredIngredients.length" class="suggestions">
        <li v-for="ingredient in filteredIngredients" :key="ingredient" @click="selectIngredient(ingredient)">
          {{ ingredient }}
        </li>
      </ul>
    </div>
    <div>
      <label for="category">Category:</label>
      <input type="text" v-model="categoryQuery" placeholder="Enter category..." @keyup.enter="fetchRecipes" />
    </div>
<!-- Список рецептов -->
<div v-if="recipes.length" class="recipe-grid">
  <router-link
    v-for="recipe in recipes"
    :key="recipe.id"
    :to="`/recipe/${recipe.id}`"
    class="recipe-card"
  >
    <img
      v-if="recipe.image_url"
      :src="recipe.image_url.trim()"
      alt="Recipe image"
      @error="imageError($event)"
      loading="lazy"
    />
    <img
      v-else
      src="https://source.unsplash.com/300x200/?food"
      alt="Default food image"
      loading="lazy"
    />
    <h3>{{ recipe.title }}</h3>
    <p class="category">{{ recipe.category }}</p>
  </router-link>
</div>

<p v-else>No recipes found</p>

  </div>
</template>
<script>
export default {
  data() {
    return {
      recipes: [],
      searchQuery: "", // Поиск по названию (отдельно)
      ingredientQuery: "", // Фильтр по ингредиентам
      categoryQuery: "", // Фильтр по категории
      allIngredients: [],
      filteredIngredients: [],
      showSuggestions: false,
    };
  },
  async created() {
    this.searchQuery = this.$route.query.search || "";
    await this.fetchRecipes();
    await this.fetchIngredients();
  },
  watch: {
    "$route.query": {
      immediate: true,
      deep: true,
      handler(newQuery) {
        this.searchQuery = newQuery.search || "";
        this.ingredientQuery = newQuery.ingredient || "";
        this.fetchRecipes();
      },
    },
  },
  methods: {
    async fetchRecipes() {
      try {
        let url = `https://my-recipe-project-backend.onrender.com/recipes`;
        const params = new URLSearchParams();

        if (this.searchQuery) {
          params.append("search", this.searchQuery);
        }
        if (this.ingredientQuery) {
          params.append("ingredient", this.ingredientQuery);
        }
        if (this.categoryQuery) {
          params.append("category", this.categoryQuery);
        }


        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        console.log("Fetching recipes from:", url);

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch recipes");

        this.recipes = await response.json();
        console.log("Recipes loaded:", this.recipes); // ✅ ← ВНУТРИ try
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    },

    async fetchIngredients() {
      try {
        const response = await fetch(`https://my-recipe-project-backend.onrender.com/ingredients`);
        if (!response.ok) throw new Error("Failed to fetch ingredients");
        this.allIngredients = await response.json();
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    },
    fetchIngredientSuggestions() {
      if (this.ingredientQuery.length < 2) {
        this.filteredIngredients = [];
        return;
      }
      this.filteredIngredients = this.allIngredients.filter((ing) =>
        ing.toLowerCase().includes(this.ingredientQuery.toLowerCase())
      );
    },
    selectIngredient(ingredient) {
      this.ingredientQuery = ingredient;
      this.showSuggestions = false;
      this.fetchRecipes();
    },
    searchRecipes() {
      this.fetchRecipes();
    },

    imageError(event) {
      event.target.src = "https://source.unsplash.com/300x200/?food";

    },
  },
};
</script>

<style scoped>

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.recipe-card:hover {
  transform: translateY(-4px);
}

.recipe-card {
  display: block;
  text-decoration: none;
  color: inherit;
  list-style: none;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 10px;
  background-color: white;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s;
}

.recipe-card img {
  width: 100%;
  height: auto;
  border-radius: 6px;
  margin-bottom: 10px;
}

.recipe-card h3 {
  font-size: 1.1em;
  margin-bottom: 5px;
}

.recipe-card .category {
  font-size: 0.9em;
  color: #777;
}

</style>
