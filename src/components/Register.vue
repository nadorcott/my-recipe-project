<template>
    <div>
      <h1>Register</h1>
      <input v-model="name" placeholder="Name" />
      <input v-model="email" placeholder="Email" />
      <input v-model="password" placeholder="Password" type="password" />
      <button @click="register">Register</button>
  
      <p v-if="message">{{ message }}</p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        name: "",
        email: "",
        password: "",
        message: "", // для уведомлений
      };
    },
    methods: {
      async register() {
        try {
          const response = await fetch("https://my-recipe-project-backend.onrender.com:10000/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: this.name,
              email: this.email,
              password: this.password,
            }),
          });
  
          const result = await response.json();
  
          if (response.ok) {
            this.message = "Registration successful!";
            this.name = "";
            this.email = "";
            this.password = "";
          } else {
            this.message = result.error || "Registration failed";
          }
        } catch (error) {
          console.error("Error:", error);
          this.message = "Something went wrong";
        }
      },
    },
  };
  </script>
  