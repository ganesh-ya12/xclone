import { pgTable, varchar, integer, timestamp, date, text, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// User Table
export const userTable = pgTable('user', {
  userId: varchar('id').primaryKey().unique(),
  username: varchar('name', { length: 225 }).notNull(),
  password: varchar('password', { length: 100 }).notNull(),
  dob: date('dob').notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  bio: text('bio'),
  profileImageUrl: varchar('profile_pic_url', { length: 300 }),
});

// Post Table
export const postTable = pgTable('post', {
  postId: serial('id').primaryKey(),
  userId: varchar('user_id')
    .notNull()
    .references(() => userTable.userId, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Comment Table
export const commentTable = pgTable('comment', {
  commentId: serial('id').primaryKey(),
  postId: integer('post_id')
    .notNull()
    .references(() => postTable.postId, { onDelete: 'cascade' }),
  userId: varchar('user_id')
    .notNull()
    .references(() => userTable.userId, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

//otp Table
export const otpTable=pgTable('otp',{
      id:serial('id').primaryKey(),
      userId:varchar('user_id')
         .notNull()
         .references(()=>userTable.userId,{onDelete:'cascade'}),
      otp:varchar('otp',{length:6}).notNull(),
      createdAt:timestamp('created_At').defaultNow(),
      expiresAt:timestamp('expires_At').notNull()
})
// Relationships
export const userRelations = relations(userTable, ({ many }) => ({
  posts: many(postTable),
  comments: many(commentTable),
}));

export const postRelations = relations(postTable, ({ one, many }) => ({
  author: one(userTable, {
    fields: [postTable.userId],
    references: [userTable.userId],
  }),
  comments: many(commentTable),
}));

export const commentRelations = relations(commentTable, ({ one }) => ({
  post: one(postTable, {
    fields: [commentTable.postId],
    references: [postTable.postId],
  }),
  author: one(userTable, {
    fields: [commentTable.userId],
    references: [userTable.userId],
  }),
}));