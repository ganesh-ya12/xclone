import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load environment variables from .env file
config({ path: '.env' });

export default defineConfig({
  schema: "./src/models", // Adjust this path if your schema files are elsewhere
  out: "./src/migrations", // Adjust this path if needed
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
