<template>
  <div>
    <h2>Add New Recipe</h2>
    <form @submit.prevent="submitForm">
      <div>
        <label>Title:</label>
        <input v-model="title" required />
      </div>

      <div>
        <label>Description:</label>
        <textarea v-model="description" required></textarea>
      </div>

      <div>
        <label>Ingredients (comma separated):</label>
        <input v-model="ingredients" required />
      </div>
      <div>
        <label>Category:</label>
        <input v-model="category" />
      </div>
      <div>
        <label>Instructions:</label>
        <textarea v-model="instructions" required></textarea>
      </div>

      <div>
        <label>Image URL (optional):</label>
        <input v-model="image_url" />
      </div>


      <button type="submit">Add Recipe</button>
      <p v-if="successMessage" style="color: green">{{ successMessage }}</p>
      <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      title: "",
      description: "",
      category: "",
      ingredients: "",
      instructions: "",
      image_url: "",
      successMessage: "",
      errorMessage: "",
    };
  },
  methods: {
    async submitForm() {
      try {
        const token = localStorage.getItem("token");
        console.log("Sending token:", token);

        const response = await axios.post(
          "https://my-recipe-project-backend.onrender.com",
          {
            title: this.title,
            description: this.description,
            category: this.category,
            ingredients: this.ingredients,
            instructions: this.instructions,
            image_url: this.image_url,

          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },

          }
        );
        this.successMessage = "Recipe added!";
        this.errorMessage = "";
        this.clearForm();
      } catch (error) {
        this.errorMessage = "Failed to add recipe.";
        this.successMessage = "";
        console.error(error);
      }
    },
    clearForm() {
      this.title = "";
      this.description = "";
      this.category = "";
      this.ingredients = "";
      this.instructions = "";
      this.image_url = "";
    },
  },
};
</script>