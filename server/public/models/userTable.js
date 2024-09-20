"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const pg_core_2 = require("drizzle-orm/pg-core");
exports.userTable = (0, pg_core_2.pgTable)('user', {
    userId: (0, pg_core_1.varchar)('id').primaryKey().unique(), // Renamed to userId
    username: (0, pg_core_1.varchar)('name', { length: 225 }).notNull(),
    password: (0, pg_core_1.varchar)('password', { length: 100 }).notNull(), // Consider hashing
    dob: (0, pg_core_1.date)('dob').notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 100 }).notNull().unique(),
    bio: (0, pg_core_1.text)('bio'),
    profileImageUrl: (0, pg_core_1.varchar)('profile_pic_url', { length: 300 }), // Renamed for clarity
});
