import { createRouter, createWebHistory } from "vue-router";
import Home from "./components/Home.vue";
import Recipes from "./components/Recipes.vue";
import RecipeDetail from "./components/RecipeDetail.vue";
import AddRecipe from "./components/AddRecipe.vue";
import Register from "./components/Register.vue";
import Login from "./components/Login.vue";
import MyRecipes from "./components/MyRecipes.vue";

const routes = [
  { path: "/register", component: Register },
  // другие маршруты
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/add-recipe", component: AddRecipe },
  { path: "/home", component: Home }, // ✅ Добавляем этот маршрут
  { path: "/recipes", component: Recipes },
  { path: "/recipe/:id", component: RecipeDetail },
  { path: "/my-recipes", component: MyRecipes },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
// Защита маршрутов
router.beforeEach((to, from, next) => {
  const publicPaths = ["/login", "/register", "/", "/home", "/recipes"];
const isPublic = publicPaths.includes(to.path) || to.path.startsWith("/recipe/");
const authRequired = !isPublic;

   const token = localStorage.getItem("token");

  if (authRequired && !token) {
    return next("/login");
  }

  next();
});


export default router;
