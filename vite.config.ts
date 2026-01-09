import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  optimizeDeps: {
    include: [
      "bcryptjs",
      "drizzle-orm",
      "@fortawesome/react-fontawesome",
      "@fortawesome/fontawesome-svg-core",
      "@fortawesome/free-regular-svg-icons",
      "@fortawesome/free-solid-svg-icons",
      "@fortawesome/free-brands-svg-icons",
      "drizzle-orm/pg-core",
      "drizzle-orm/node-postgres",
      "pg",
      "recharts",
      "google-auth-library",
    ],
  },
});
