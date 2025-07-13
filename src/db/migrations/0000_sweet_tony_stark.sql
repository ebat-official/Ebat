CREATE TYPE "public"."account_status" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('EASY', 'MEDIUM', 'HARD');--> statement-breakpoint
CREATE TYPE "public"."post_approval_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."post_category" AS ENUM('FRONTEND', 'BACKEND', 'ANDROID');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('DRAFT', 'PUBLISHED');--> statement-breakpoint
CREATE TYPE "public"."post_type" AS ENUM('BLOGS', 'QUESTION', 'CHALLENGE', 'SYSTEMDESIGN');--> statement-breakpoint
CREATE TYPE "public"."sub_category" AS ENUM('JAVASCRIPT', 'HTML', 'CSS', 'REACT', 'BLOGS', 'SYSTEMDESIGN', 'VUE', 'ANGULAR', 'SVELTEKIT', 'VANILLAJS', 'NEXTJS');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('ACCEPTED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('BASIC', 'PREMIUM');--> statement-breakpoint
CREATE TYPE "public"."template_framework" AS ENUM('REACT', 'NEXTJS', 'ANGULAR', 'VUE', 'SVELTEKIT', 'VANILLAJS', 'JAVASCRIPT');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'USER');--> statement-breakpoint
CREATE TYPE "public"."vote_type" AS ENUM('UP', 'DOWN');--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_name" text NOT NULL,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"account_status" "account_status" DEFAULT 'ACTIVE' NOT NULL,
	"karma_points" integer DEFAULT 0 NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"job_title" text,
	"description" text,
	"company_name" text,
	"cover_image" text,
	"location" text,
	"subscription_plan" "subscription_plan" DEFAULT 'BASIC' NOT NULL,
	"external_links" json,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_user_name_unique" UNIQUE("user_name")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "bookmark" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"post_id" varchar(21) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challengeSubmission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"post_id" varchar(21) NOT NULL,
	"framework" "template_framework" NOT NULL,
	"answer_template" json NOT NULL,
	"run_time" integer DEFAULT 0 NOT NULL,
	"status" "submission_status" DEFAULT 'REJECTED' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challengeTemplate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" varchar(21) NOT NULL,
	"framework" "template_framework" NOT NULL,
	"question_template" json NOT NULL,
	"answer_template" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commentMention" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"comment_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commentVote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"comment_id" uuid NOT NULL,
	"type" "vote_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" "bytea",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"author_id" uuid NOT NULL,
	"post_id" varchar(21) NOT NULL,
	"parent_id" uuid
);
--> statement-breakpoint
CREATE TABLE "completionStatus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"post_id" varchar(21) NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" uuid NOT NULL,
	"followed_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "postCollaborators" (
	"post_id" varchar(21) NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "postEdit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" varchar(21) NOT NULL,
	"author_id" uuid NOT NULL,
	"content" "bytea",
	"approval_status" "post_approval_status" DEFAULT 'PENDING' NOT NULL,
	"approval_logs" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"title" varchar(500),
	"type" "post_type" NOT NULL,
	"difficulty" "difficulty",
	"companies" varchar(255)[] DEFAULT '{}',
	"completion_duration" integer,
	"topics" varchar(255)[] DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "postViews" (
	"post_id" varchar(21) PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"title" varchar(500),
	"slug" varchar(255),
	"thumbnail" varchar(500),
	"content" "bytea",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"author_id" uuid NOT NULL,
	"type" "post_type" NOT NULL,
	"difficulty" "difficulty",
	"companies" varchar(255)[] DEFAULT '{}',
	"completion_duration" integer,
	"coins" integer DEFAULT 0,
	"topics" varchar(255)[] DEFAULT '{}',
	"category" "post_category" NOT NULL,
	"sub_category" "sub_category" NOT NULL,
	"status" "post_status" DEFAULT 'DRAFT' NOT NULL,
	"approval_status" "post_approval_status" DEFAULT 'PENDING' NOT NULL,
	"approval_logs" json
);
--> statement-breakpoint
CREATE TABLE "vote" (
	"user_id" uuid NOT NULL,
	"post_id" varchar(21) NOT NULL,
	"type" "vote_type" NOT NULL,
	CONSTRAINT "vote_user_id_post_id_pk" PRIMARY KEY("user_id","post_id")
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(100) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"link" varchar(500),
	"related_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid NOT NULL,
	"post_id" varchar(21),
	"comment_id" uuid,
	"reason" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challengeSubmission" ADD CONSTRAINT "challengeSubmission_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challengeSubmission" ADD CONSTRAINT "challengeSubmission_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challengeTemplate" ADD CONSTRAINT "challengeTemplate_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commentMention" ADD CONSTRAINT "commentMention_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commentMention" ADD CONSTRAINT "commentMention_comment_id_comment_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commentVote" ADD CONSTRAINT "commentVote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commentVote" ADD CONSTRAINT "commentVote_comment_id_comment_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_parent_id_comment_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completionStatus" ADD CONSTRAINT "completionStatus_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completionStatus" ADD CONSTRAINT "completionStatus_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow" ADD CONSTRAINT "follow_follower_id_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow" ADD CONSTRAINT "follow_followed_id_user_id_fk" FOREIGN KEY ("followed_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postCollaborators" ADD CONSTRAINT "postCollaborators_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postCollaborators" ADD CONSTRAINT "postCollaborators_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postEdit" ADD CONSTRAINT "postEdit_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postEdit" ADD CONSTRAINT "postEdit_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postViews" ADD CONSTRAINT "postViews_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_comment_id_comment_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_accountId_idx" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bookmark_userId_postId_idx" ON "bookmark" USING btree ("user_id","post_id");--> statement-breakpoint
CREATE INDEX "challengeSubmission_postId_userId_idx" ON "challengeSubmission" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "challengeSubmission_userId_idx" ON "challengeSubmission" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "challengeSubmission_postId_idx" ON "challengeSubmission" USING btree ("post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "challengeTemplate_postId_framework_idx" ON "challengeTemplate" USING btree ("post_id","framework");--> statement-breakpoint
CREATE INDEX "challengeTemplate_postId_idx" ON "challengeTemplate" USING btree ("post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "commentMention_userId_commentId_idx" ON "commentMention" USING btree ("user_id","comment_id");--> statement-breakpoint
CREATE INDEX "commentMention_commentId_idx" ON "commentMention" USING btree ("comment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "commentVote_userId_commentId_idx" ON "commentVote" USING btree ("user_id","comment_id");--> statement-breakpoint
CREATE INDEX "commentVote_commentId_type_idx" ON "commentVote" USING btree ("comment_id","type");--> statement-breakpoint
CREATE INDEX "comment_postId_parentId_idx" ON "comment" USING btree ("post_id","parent_id");--> statement-breakpoint
CREATE INDEX "comment_createdAt_idx" ON "comment" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "comment_parentId_idx" ON "comment" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "comment_authorId_idx" ON "comment" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "comment_post_parent_created_idx" ON "comment" USING btree ("post_id","parent_id","created_at" desc);--> statement-breakpoint
CREATE INDEX "comment_post_parent_covering_idx" ON "comment" USING btree ("post_id","parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "completionStatus_userId_postId_idx" ON "completionStatus" USING btree ("user_id","post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "follow_followerId_followedId_idx" ON "follow" USING btree ("follower_id","followed_id");--> statement-breakpoint
CREATE INDEX "follow_followerId_idx" ON "follow" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "follow_followedId_idx" ON "follow" USING btree ("followed_id");--> statement-breakpoint
CREATE UNIQUE INDEX "postCollaborators_postId_userId_idx" ON "postCollaborators" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "postCollaborators_postId_idx" ON "postCollaborators" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "postCollaborators_userId_idx" ON "postCollaborators" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "postEdit_postId_idx" ON "postEdit" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "postEdit_authorId_idx" ON "postEdit" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "postEdit_approvalStatus_idx" ON "postEdit" USING btree ("approval_status");--> statement-breakpoint
CREATE UNIQUE INDEX "postEdit_postId_authorId" ON "postEdit" USING btree ("post_id","author_id");--> statement-breakpoint
CREATE INDEX "post_authorId_idx" ON "post" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "post_slug_idx" ON "post" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "post_type_idx" ON "post" USING btree ("type");--> statement-breakpoint
CREATE INDEX "post_category_idx" ON "post" USING btree ("category");--> statement-breakpoint
CREATE INDEX "post_subCategory_idx" ON "post" USING btree ("sub_category");--> statement-breakpoint
CREATE INDEX "post_status_idx" ON "post" USING btree ("status");--> statement-breakpoint
CREATE INDEX "post_approvalStatus_idx" ON "post" USING btree ("approval_status");--> statement-breakpoint
CREATE INDEX "post_createdAt_idx" ON "post" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "postIdSlug" ON "post" USING btree ("id","slug");--> statement-breakpoint
CREATE INDEX "vote_postId_type_idx" ON "vote" USING btree ("post_id","type");--> statement-breakpoint
CREATE INDEX "notification_userId_isRead_idx" ON "notification" USING btree ("user_id","is_read");