import { config } from "dotenv";
import "dotenv/config";
import {drizzle} from "drizzle-orm/postgres-js";
import {migrate} from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
config({ path: '.env' });
const migrationClient=postgres(process.env.DATABASE_URL as string ,{max:1})
const main =async ()=>{
       await migrate(drizzle(migrationClient),{
        migrationsFolder:"./src/migrations",
       })
       await migrationClient.end();
}
main()