import {  varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import {  pgTable, uuid } from "drizzle-orm/pg-core";

export const userTable=pgTable('user',{
    id:uuid('id').primaryKey(),
    username :varchar('name',{length:225}).notNull(),
    password:varchar('password',{length:100}).notNull(),
    created_at: timestamp('created_at').defaultNow(),
})