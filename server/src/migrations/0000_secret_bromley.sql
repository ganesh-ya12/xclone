CREATE TABLE IF NOT EXISTS "user" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar(225) NOT NULL,
	"password" varchar(100) NOT NULL,
	"dob" date NOT NULL,
	"email" varchar(100) NOT NULL,
	"bio" text,
	"profile_pic_url" varchar(300),
	CONSTRAINT "user_id_unique" UNIQUE("id"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
