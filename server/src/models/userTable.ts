import { pgTable, varchar, integer, timestamp, date, text, primaryKey,serial, PgColumn, PgTableWithColumns } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { table } from 'console';

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
  noOfLikes:integer('likes').default(0),
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
  noofLikes:integer('likes').default(0),
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
//post likes 
export const postLikeTable = pgTable('post_like', {
  userId: varchar('user_id')
    .notNull()
    .references(() => userTable.userId, { onDelete: 'cascade' }),  // PostgreSQL reference
  postId: integer('post_id')
    .notNull()
    .references(() => postTable.postId, { onDelete: 'cascade' }),  // PostgreSQL reference
}, (table) => {
  return {
    pk: primaryKey(table.userId, table.postId),  // PostgreSQL composite primary key definition
  };
});
//comment like table
export const commentLikeTable=pgTable('comment_like',{
  userId:varchar('user_id')
    .notNull()
    .references(()=>userTable.userId,{onDelete:'cascade'}),
  commentId:integer('comment_id')
   .notNull()
   .references(()=>commentTable.commentId,{onDelete:'cascade'}),   
}, (table) => {
  return {
    pk: primaryKey(table.userId, table.commentId),  // PostgreSQL composite primary key definition
  };
});
// Relationships
export const userRelations = relations(userTable, ({ many }) => ({
  posts: many(postTable),
  comments: many(commentTable),
  likes:many(postLikeTable)
}));

export const postRelations = relations(postTable, ({ one, many }) => ({
  author: one(userTable, {
    fields: [postTable.userId],
    references: [userTable.userId],
  }),
  comments: many(commentTable),
  likes:many(postLikeTable)
}));

export const commentRelations = relations(commentTable, ({ one,many }) => ({
  post: one(postTable, {
    fields: [commentTable.postId],
    references: [postTable.postId],
  }),
  author: one(userTable, {
    fields: [commentTable.userId],
    references: [userTable.userId],
  }),
  likes:many(commentLikeTable),
}));
export const postLikeRelations=relations(postLikeTable,({one,many})=>({
  likedBy: one(userTable, {
    fields: [postLikeTable.userId],
    references: [userTable.userId],
  }),
  post: one(postTable, {
    fields: [postLikeTable.postId],
    references: [postTable.postId],
  }),
}))
export const commentLikeRelations=relations(commentLikeTable,({one,many})=>({
  likedBy: one(userTable, {
    fields: [commentLikeTable.userId],
    references: [userTable.userId],
  }),
  comment: one(commentTable, {
    fields: [commentLikeTable.commentId],
    references: [commentTable.commentId],
  }),
}))