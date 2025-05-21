<template>
    <div>
      <h1>Login</h1>
      <input v-model="email" placeholder="Email" />
      <input v-model="password" placeholder="Password" type="password" />
      <button @click="login">Login</button>
      <p v-if="message">{{ message }}</p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        email: "",
        password: "",
        message: "",
      };
    },
    methods: {
      async login() {
        try {
          const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: this.email,
              password: this.password,
            }),
          });
  
          const result = await response.json();
  
          if (response.ok) {
  localStorage.setItem("token", result.token); // Сохраняем токен
  this.message = "Login successful!";
  this.email = "";
  this.password = "";
} else {
  this.message = result.error || "Login failed";
}


        } catch (error) {
          console.error("Error:", error);
          this.message = "Something went wrong";
        }
      },
    },
  };
  </script>
  