<template>
  <div class="search-bar">
    <input
      type="text"
      v-model="searchQuery"
      placeholder="Find a recipe or ingredient..."
      @keyup.enter="search"
    />
    <button @click="search">🔍</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: "",
    };
  },
  methods: {
    search() {
      const query = this.searchQuery.trim();
      this.$router.push({
        path: "/recipes",
        query: query ? { search: query } : {},
      });
    },
  },
};
</script>

<style>
.search-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  padding: 10px;
  border-bottom: 2px solid #ddd;
}

.search-bar input {
  padding: 8px;
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.search-bar button {
  background: #ff5722;
  border: none;
  padding: 8px 12px;
  margin-left: 5px;
  color: white;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
}
</style>
