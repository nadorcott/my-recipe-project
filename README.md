# Flavor Groove: Your Personal Recipe Hub

## Project Overview

Flavor Groove is a full-stack web application designed to be your ultimate recipe management and discovery platform. It allows users to explore a wide variety of recipes, search and filter them based on various criteria, and for authenticated users, to contribute their own culinary creations, complete with images.

This project serves as a demonstration of modern web development practices, utilizing a robust backend API with a PostgreSQL database and a dynamic frontend built with Vue.js.

## Features

### Public Access
*   **Browse Recipes:** View a comprehensive list of all available recipes.
*   **Search & Filter:** Easily find recipes by title, description, ingredients, or category.
*   **Recipe Details:** Access detailed information for each recipe, including ingredients, instructions, category, author, and publication date.
*   **User Authentication:** Register for a new account or log in to an existing one.

### Authenticated User Features
*   **Add New Recipes:** Contribute your own recipes to the platform.
*   **Image Uploads:** Attach images to your recipes for a richer visual experience (powered by Cloudinary).
*   **My Recipes:** View and manage a personalized list of recipes you have created.
*   **Secure Access:** Protected routes ensure only authenticated users can perform certain actions.

## Technologies Used

### Frontend
*   **Vue.js 3:** Progressive JavaScript framework for building user interfaces.
*   **Vite:** Next-generation frontend tooling for fast development.
*   **Vue Router:** Official routing library for Vue.js.
*   **Axios:** Promise-based HTTP client for making API requests.
*   **HTML/CSS:** Standard web technologies for structure and styling.

### Backend
*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Fast, unopinionated, minimalist web framework for Node.js.
*   **PostgreSQL:** Powerful, open-source relational database.
*   **pg-promise:** PostgreSQL client for Node.js.
*   **JSON Web Tokens (JWT):** For secure user authentication and authorization.
*   **Bcrypt.js:** For secure password hashing.
*   **Multer:** Node.js middleware for handling `multipart/form-data`, primarily for file uploads.
*   **Cloudinary:** Cloud-based image and video management solution for storing and serving recipe images.
*   **dotenv:** For managing environment variables.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   Node.js (v14 or higher recommended)
*   npm (Node Package Manager)
*   PostgreSQL database server

### 1. Backend Setup (`flavor-groove-api/`)

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd flavor-groove-api
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment Variables:**
    Create a `.env` file in the `flavor-groove-api/` directory with the following content:
    ```env
    PORT=5000
    DATABASE_URL="postgresql://user:password@host:port/database_name"
    JWT_SECRET="your_super_secret_jwt_key"
    CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
    CLOUDINARY_API_KEY="your_cloudinary_api_key"
    CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
    ```
    *   Replace `user`, `password`, `host`, `port`, and `database_name` with your PostgreSQL database credentials.
    *   Generate a strong, random string for `JWT_SECRET`.
    *   Sign up for a free [Cloudinary account](https://cloudinary.com/users/register/free) and get your `CLOUD_NAME`, `API_KEY`, and `API_SECRET` from your dashboard.
4.  **Initialize Database:**
    The `db.js` script will automatically create the necessary `users` and `recipes` tables and seed a demo user and recipe if the database is empty when the server starts.
5.  **Run the Backend Server:**
    ```bash
    npm start
    ```
    The backend API will be running on `http://localhost:5000`.

### 2. Frontend Setup (`my-recipe-site/`)

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../my-recipe-site # If you are in flavor-groove-api
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment Variables:**
    Create a `.env` file in the `my-recipe-site/` directory with the following content:
    ```env
    VITE_API_URL="http://localhost:5000"
    ```
    This points your frontend to your local backend.
4.  **Run the Frontend Development Server:**
    ```bash
    npm run dev
    ```
    The frontend application will be accessible, typically at `http://localhost:5173` (or another port Vite assigns).

## Deployment

This project is designed to be deployed on platforms like [Render.com](https://render.com/).

*   **Backend Deployment:**
    *   Ensure your `DATABASE_URL` in Render's environment variables points to a persistent PostgreSQL database (e.g., Render's managed PostgreSQL).
    *   Set `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` as environment variables in Render.
    *   The `multer` local storage has been replaced with Cloudinary integration to handle image persistence across deploys and server restarts.
*   **Frontend Deployment:**
    *   Set `VITE_API_URL` in Render's environment variables for the frontend to point to your deployed backend API URL.

## Future Enhancements

*   **User Profiles:** Allow users to manage their profile information.
*   **Recipe Editing/Deletion:** Enable users to modify or remove their own recipes.
*   **Rating/Comments:** Implement a system for users to rate and comment on recipes.
*   **Advanced Search:** More sophisticated filtering options (e.g., by cuisine, dietary restrictions).
*   **Pagination:** Implement pagination for recipe listings to improve performance with large datasets.
*   **Testing:** Add unit and integration tests for both frontend and backend.

## License

This project is open-sourced under the MIT License.

---
