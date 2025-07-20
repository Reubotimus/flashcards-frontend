import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
config({ path: ".env.local" });

export default defineConfig({
    dialect: "postgresql",           // or "mysql"/"sqlite"
    schema: "./src/lib/db/auth-schema.ts",       // your Drizzle schema
    dbCredentials: {
        url: process.env.DATABASE_URL!, // your connection string
    },
});
