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
  <label>Upload Image:</label>
  <input type="file" @change="handleImageUpload" />
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
      imageFile: null,
      successMessage: "",
      errorMessage: "",
    };
  },
  methods: {
    async submitForm() {
  try {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("title", this.title);
    formData.append("description", this.description);
    formData.append("category", this.category);
    formData.append("ingredients", this.ingredients);
    formData.append("instructions", this.instructions);
    if (this.imageFile) {
      formData.append("image", this.imageFile); 
    }

    await axios.post("http://localhost:5000/recipes", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

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
  this.imageFile = null;
},
  },
};
</script>