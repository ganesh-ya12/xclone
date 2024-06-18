"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const pg_core_2 = require("drizzle-orm/pg-core");
exports.userTable = (0, pg_core_2.pgTable)('user', {
    id: (0, pg_core_2.uuid)('id').primaryKey(),
    username: (0, pg_core_1.varchar)('name', { length: 225 }).notNull(),
    password: (0, pg_core_1.varchar)('password', { length: 100 }).notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
