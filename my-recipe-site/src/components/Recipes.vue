<template>
  <div>
    <h1>Recipes</h1>

    <!-- Поиск по названию -->
    <div>
      <input
        v-model="searchQuery"
        placeholder="Search recipes..."
        @keyup.enter="searchRecipes"
      />
      <button @click="searchRecipes">Search</button>
    </div>

    <!-- Фильтр по ингредиентам -->
    <div>
      <label for="ingredient">Ingredient:</label>
      <input
        type="text"
        v-model="ingredientQuery"
        placeholder="Type an ingredient..."
        @input="fetchIngredientSuggestions"
        @focus="showSuggestions = true"
      />
      <ul
        v-if="showSuggestions && filteredIngredients.length"
        class="suggestions"
      >
        <li
          v-for="ingredient in filteredIngredients"
          :key="ingredient"
          @click="selectIngredient(ingredient)"
        >
          {{ ingredient }}
        </li>
      </ul>
    </div>

    <!-- Список рецептов -->
    <ul v-if="recipes.length">
      <li v-for="recipe in recipes" :key="recipe.id">
        <router-link :to="`/recipe/${recipe.id}`">
          <img
            :src="
              recipe.image_url && recipe.image_url.trim()
                ? recipe.image_url.trim()
                : 'https://via.placeholder.com/300x200'
            "
            alt="Recipe image"
            @error="imageError($event)"
          />
        </router-link>
        <h3>{{ recipe.title }}</h3>
      </li>
    </ul>

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
        let url = `http://localhost:5000/recipes`;
        const params = new URLSearchParams();

        if (this.searchQuery) {
          params.append("search", this.searchQuery);
        }
        if (this.ingredientQuery) {
          params.append("ingredient", this.ingredientQuery);
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
        const response = await fetch(`http://localhost:5000/ingredients`);
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
      event.target.src = "https://via.placeholder.com/300x200";
    },
  },
};
</script>

<style scoped>
/* Стили для автозаполнения */
.suggestions {
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  max-height: 200px;
  overflow-y: auto;
  list-style: none;
  padding: 5px;
  margin: 0;
}

.suggestions li {
  padding: 8px;
  cursor: pointer;
}

.suggestions li:hover {
  background: #f0f0f0;
}
</style>
