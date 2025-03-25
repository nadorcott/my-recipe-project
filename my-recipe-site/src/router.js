import { createRouter, createWebHistory } from "vue-router";
import Home from "./components/Home.vue";
import Recipes from "./components/Recipes.vue";
import RecipeDetail from "./components/RecipeDetail.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/home", component: Home }, // ✅ Добавляем этот маршрут
  { path: "/recipes", component: Recipes },
  { path: "/recipe/:id", component: RecipeDetail },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
