<template>                                                                                                                                                                                     
  <div>                                                                                                                                                                                        
    <h1>Add New Recipe</h1>                                                                                                                                                                    
    <form @submit.prevent="submitForm">                                                                                                                                                        
      <div>                                                                                                                                                                                    
        <label for="title">Title:</label>                                                                                                                                                      
        <input type="text" id="title" v-model="title" required />                                                                                                                              
      </div>                                                                                                                                                                                   
      <div>                                                                                                                                                                                    
        <label for="description">Description:</label>                                                                                                                                          
        <textarea id="description" v-model="description" required></textarea>                                                                                                                  
      </div>                                                                                                                                                                                   
      <div>                                                                                                                                                                                    
        <label for="category">Category:</label>                                                                                                                                                
        <input type="text" id="category" v-model="category" />                                                                                                                                 
      </div>                                                                                                                                                                                   
      <div>                                                                                                                                                                                    
        <label for="ingredients">Ingredients (comma-separated):</label>                                                                                                                        
        <textarea id="ingredients" v-model="ingredients" required></textarea>                                                                                                                  
      </div>                                                                                                                                                                                   
      <div>                                                                                                                                                                                    
        <label for="instructions">Instructions:</label>                                                                                                                                        
        <textarea id="instructions" v-model="instructions" required></textarea>                                                                                                                
      </div>                                                                                                                                                                                   
      <div>                                                                                                                                                                                    
        <label for="image">Upload Image:</label>                                                                                                                                               
        <input type="file" id="image" @change="handleImageUpload" accept="image/*" />                                                                                                          
      </div>                                                                                                                                                                                   
      <button type="submit">Add Recipe</button>                                                                                                                                                
    </form>                                                                                                                                                                                    
                                                                                                                                                                                               
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>                                                                                                                  
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>                                                                                                                        
  </div>                                                                                                                                                                                       
</template>                                                                                                                                                                                    
                                                                                                                                                                                               
<!-- Your existing <script> block should go here, after the template -->                                                                                                                       
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
    handleImageUpload(event) {                                                                                                                                                                 
      this.imageFile = event.target.files[0];                                                                                                                                                  
      // ADD THIS LOG:                                                                                                                                                                         
      console.log("Frontend: Selected image file:", this.imageFile);                                                                                                                           
    },                                                                                                                                                                                         
    async submitForm() {                                                                                                                                                                       
      // ADD THIS LOG:                                                                                                                                                                         
      console.log("Frontend: Submitting form. Image file before FormData:", this.imageFile);                                                                                                   
                                                                                                                                                                                               
      try {                                                                                                                                                                                    
        const token = localStorage.getItem("token");                                                                                                                                           
        if (!token) {                                                                                                                                                                          
          this.errorMessage = "You must be logged in to add a recipe.";                                                                                                                        
          return;                                                                                                                                                                              
        }                                                                                                                                                                                      
                                                                                                                                                                                               
        const formData = new FormData();                                                                                                                                                       
        formData.append("title", this.title);                                                                                                                                                  
        formData.append("description", this.description);                                                                                                                                      
        formData.append("category", this.category);                                                                                                                                            
        formData.append("ingredients", this.ingredients);                                                                                                                                      
        formData.append("instructions", this.instructions);                                                                                                                                    
        if (this.imageFile) {                                                                                                                                                                  
          formData.append("image", this.imageFile);                                                                                                                                            
        }                                                                                                                                                                                      
                                                                                                                                                                                               
        const response = await axios.post("http://localhost:5000/recipes", formData, {                                                                                                         
          headers: {                                                                                                                                                                           
            Authorization: `Bearer ${token}`,                                                                                                                                                  
            // "Content-Type": "multipart/form-data", // Axios sets this automatically for FormData                                                                                            
          },                                                                                                                                                                                   
        });                                                                                                                                                                                    
                                                                                                                                                                                               
        if (response.status === 201) {                                                                                                                                                         
          this.successMessage = "Recipe added successfully!";                                                                                                                                  
          this.errorMessage = "";                                                                                                                                                              
          this.clearForm();                                                                                                                                                                    
          this.$router.push(`/recipe/${response.data.id}`);                                                                                                                                    
        } else {                                                                                                                                                                               
          this.errorMessage = response.data.error || "Failed to add recipe.";                                                                                                                  
          this.successMessage = "";                                                                                                                                                            
        }                                                                                                                                                                                      
                                                                                                                                                                                               
      } catch (error) {                                                                                                                                                                        
        console.error("Frontend: Error adding recipe:", error);                                                                                                                                
        if (error.response) {                                                                                                                                                                  
          this.errorMessage = error.response.data.error || "Failed to add recipe. Server error.";                                                                                              
        } else if (error.request) {                                                                                                                                                            
          this.errorMessage = "Failed to add recipe. No response from server.";                                                                                                                
        } else {                                                                                                                                                                               
          this.errorMessage = "Failed to add recipe. Network error or client-side issue.";                                                                                                     
        }                                                                                                                                                                                      
        this.successMessage = "";                                                                                                                                                              
      }                                                                                                                                                                                        
    },                                                                                                                                                                                         
    clearForm() {                                                                                                                                                                              
      this.title = "";                                                                                                                                                                         
      this.description = "";                                                                                                                                                                   
      this.category = "";                                                                                                                                                                      
      this.ingredients = "";                                                                                                                                                                   
      this.instructions = "";                                                                                                                                                                  
      this.imageFile = null;                                                                                                                                                                   
      const fileInput = document.getElementById('image');                                                                                                                                      
      if (fileInput) {                                                                                                                                                                         
        fileInput.value = '';                                                                                                                                                                  
      }                                                                                                                                                                                        
    },                                                                                                                                                                                         
  },                                                                                                                                                                                           
};                                                                                                                                                                                             
</script>                                                                                                                                                                                      
                                                           	
<style scoped>                                                                                                                                                                                 
/* You might want to add some basic styling here */                                                                                                                                            
form div {                                                                                                                                                                                     
  margin-bottom: 15px;                                                                                                                                                                         
}                                                                                                                                                                                              
                                                                                                                                                                                               
label {                                                                                                                                                                                        
  display: block;                                                                                                                                                                              
  margin-bottom: 5px;                                                                                                                                                                          
  font-weight: bold;                                                                                                                                                                           
}                                                                                                                                                                                              
                                                                                                                                                                                               
input[type="text"],                                                                                                                                                                            
textarea {                                                                                                                                                                                     
  width: 100%;                                                                                                                                                                                 
  padding: 8px;                                                                                                                                                                                
  border: 1px solid #ccc;                                                                                                                                                                      
  border-radius: 4px;                                                                                                                                                                          
  box-sizing: border-box; /* Ensures padding doesn't increase width */                                                                                                                         
}                                                                                                                                                                                              
                                                                                                                                                                                               
button {                                                                                                                                                                                       
  background-color: #4CAF50;                                                                                                                                                                   
  color: white;                                                                                                                                                                                
  padding: 10px 15px;                                                                                                                                                                          
  border: none;                                                                                                                                                                                
  border-radius: 4px;                                                                                                                                                                          
  cursor: pointer;                                                                                                                                                                             
  font-size: 16px;                                                                                                                                                                             
}                                                                                                                                                                                              
                                                                                                                                                                                               
button:hover {                                                                                                                                                                                 
  background-color: #45a049;                                                                                                                                                                   
}                                                                                                                                                                                              
                                                                                                                                                                                               
.success-message {                                                                                                                                                                             
  color: green;                                                                                                                                                                                
  margin-top: 10px;                                                                                                                                                                            
}                                                                                                                                                                                              
                                                                                                                                                                                               
.error-message {                                                                                                                                                                               
  color: red;                                                                                                                                                                                  
  margin-top: 10px;                                                                                                                                                                            
}                                                                                                                                                                                              
</style>                 
