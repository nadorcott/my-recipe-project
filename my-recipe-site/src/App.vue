<template>
  <div>
    <nav>
      <!-- Логотип -->
      <div class="logo">
        <img src="/logo.png" alt="Site Logo" />
      </div>

      <!-- Навигация -->
      <div class="nav-links">
        <router-link to="/home">Home</router-link>
        <router-link to="/recipes">Recipes</router-link>
        <router-link v-if="isLoggedIn" @click.native="logout" to="#">Logout</router-link>
        <router-link v-else to="/login">Login</router-link>
        <router-link to="/register">Register</router-link>
        <router-link v-if="isLoggedIn" to="/add-recipe">Add Recipe</router-link>
<router-link v-if="isLoggedIn" to="/my-recipes">My Recipes</router-link>

      </div>

      <!-- Строка поиска -->
      <SearchBar @search="updateSearchQuery" />
    </nav>

    <router-view />
  </div>
</template>

<script>
import SearchBar from "./components/SearchBar.vue";

export default {
  components: {
    SearchBar,
  },
  data() {
    return {
      searchQuery: "",
    };
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem("token");
    },
  },
  methods: {
    updateSearchQuery(query) {
      this.searchQuery = query;
    },
    logout() {
      localStorage.removeItem("token");
    },
  },
};
</script>


<style>
nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding: 10px 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.logo img {
  height: 40px;
  width: auto;
  max-width: 150px;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  text-decoration: none;
  color: black;
  font-size: 18px;
  font-weight: bold;
}

@media (max-width: 768px) {
  nav {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .nav-links {
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  .nav-links a {
    font-size: 16px;
  }

  .logo img {
    max-width: 100px;
  }
}

</style>
