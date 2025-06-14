<template>
  <div v-if="recipe">
    <h1>{{ recipe.title }}</h1>
    <img :src="recipe.image_url || 'https://via.placeholder.com/150'" alt="Recipe Image" class="recipe-image" />

    <h3>Description</h3>
    <p>{{ recipe.description }}</p>

    <h3>Ingredients</h3>
    <div class="ingredients-list" v-if="recipe.ingredients && recipe.ingredients.length">
      <span v-for="(ingredient, index) in recipe.ingredients.split(', ')" :key="index" class="ingredient-item">
        {{ ingredient }}
      </span>
    </div>
    <p v-else>No ingredients available.</p>

    <h3>Category</h3>
    <p>{{ recipe.category || "No category specified" }}</p>


    <h3>Instructions</h3>
    <h3>Author</h3>
    <p>{{ recipe.author_name }}</p>

    <h3>Published</h3>
    <p>{{ formattedDate }}</p>

    <div v-if="isAuthor">
      <button @click="deleteRecipe" class="delete-button">Delete Recipe</button>
    </div>

    <p v-if="recipe.instructions">{{ recipe.instructions }}</p>
    <p v-else>No instructions available.</p>
  </div>
  <p v-else>Loading recipe...</p>
</template>

<script>
import axios from 'axios'; // Make sure axios is imported                                                                                                                                   
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode                                                                                                                                 

export default {
  data() {
    return {
      recipe: null,
      userId: null, // New: To store the logged-in user's ID                                                                                                                                
    };
  },

  computed: {
    formattedDate() {
      if (!this.recipe || !this.recipe.created_at) return "";
      return new Date(this.recipe.created_at).toLocaleDateString();
    },
    isAuthor() {
      // New: Check if recipe exists, user is logged in, and user ID matches recipe's user_id                                                                                               
      return this.recipe && this.userId && this.recipe.user_id === this.userId;
    }
  },
  async created() {
    const recipeId = this.$route.params.id;
    try {
      // Use axios for fetching recipe for consistency and error handling                                                                                                                   
      const response = await axios.get(`http://localhost:5000/recipes/${recipeId}`);
      this.recipe = response.data;

      // Decode token to get logged-in user's ID                                                                                                                                            
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          this.userId = decodedToken.userId;
        } catch (decodeError) {
          console.error("Error decoding token:", decodeError);
          this.userId = null; // Clear userId if token is invalid                                                                                                                           
        }
      }

    } catch (error) {
      console.error("Error fetching recipe:", error);
      // Handle 404 or other errors, e.g., redirect to a not-found page                                                                                                                     
      if (error.response && error.response.status === 404) {
        this.$router.push('/recipes'); // Redirect to the general recipes list                                                                                                              
      }
    }
  },
  methods: {
    // This method is for the "Edit" button, which you can add later if you wish.                                                                                                           
    // I'm including it here as a placeholder if you decide to add it.                                                                                                                      
    editRecipe() {
      // This route would need to be defined in your router.js                                                                                                                              
      // this.$router.push(`/recipe/edit/${this.recipe.id}`);                                                                                                                               
      alert("Edit functionality not yet implemented. You can add it later!");
    },
    async deleteRecipe() {
      // Confirmation dialog before deleting                                                                                                                                                
      if (confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            alert("You must be logged in to delete a recipe.");
            return;
          }

          // Send DELETE request to the backend                                                                                                                                             
          await axios.delete(`http://localhost:5000/recipes/${this.recipe.id}`, {
            headers: {
              Authorization: `Bearer ${token}`, // Include the authorization token                                                                                                          
            },
          });

          alert("Recipe deleted successfully!");
          // Redirect to 'My Recipes' or 'Home' page after successful deletion                                                                                                              
          this.$router.push("/my-recipes");
        } catch (error) {
          console.error("Error deleting recipe:", error);
          if (error.response) {
            // Server responded with an error (e.g., 403 Forbidden, 404 Not Found)                                                                                                          
            alert(`Failed to delete recipe: ${error.response.data.error || error.response.statusText}`);
          } else if (error.request) {
            // Request was made but no response was received                                                                                                                                
            alert("Failed to delete recipe. No response from server.");
          } else {
            // Something else happened in setting up the request                                                                                                                            
            alert("Failed to delete recipe. Network error or client-side issue.");
          }
        }
      }
    }
  }
};
</script>

<style>
/* Your existing styles */

.delete-button {
  background-color: #f44336;
  /* Red color for delete */
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
  /* Add some spacing from content above */
}

.delete-button:hover {
  background-color: #d32f2f;
  /* Darker red on hover */
}
</style>
