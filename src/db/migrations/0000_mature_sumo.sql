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
	"userId" uuid NOT NULL,
	"type" varchar(100) NOT NULL,
	"provider" varchar(100) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(100),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resetToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "resetToken_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "bookmark" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"postId" varchar(21) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challengeSubmission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"postId" varchar(21) NOT NULL,
	"framework" "template_framework" NOT NULL,
	"answerTemplate" json NOT NULL,
	"runTime" integer DEFAULT 0 NOT NULL,
	"status" "submission_status" DEFAULT 'REJECTED' NOT NULL,
	"submittedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challengeTemplate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postId" varchar(21) NOT NULL,
	"framework" "template_framework" NOT NULL,
	"questionTemplate" json NOT NULL,
	"answerTemplate" json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commentMention" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"commentId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commentVote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"commentId" uuid NOT NULL,
	"type" "vote_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" "bytea",
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"authorId" uuid NOT NULL,
	"postId" varchar(21) NOT NULL,
	"parentId" uuid
);
--> statement-breakpoint
CREATE TABLE "completionStatus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"postId" varchar(21) NOT NULL,
	"completedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"followerId" uuid NOT NULL,
	"followedId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userProfile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"jobTitle" varchar(255),
	"description" text,
	"companyName" varchar(255),
	"image" varchar(500),
	"coverImage" varchar(500),
	"location" varchar(255),
	"subscriptionPlan" "subscription_plan" DEFAULT 'BASIC' NOT NULL,
	"externalLinks" json,
	CONSTRAINT "userProfile_userId_unique" UNIQUE("userId"),
	CONSTRAINT "userProfile_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"userName" varchar(255),
	"password" varchar(255),
	"emailVerified" timestamp,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"accountStatus" "account_status" DEFAULT 'ACTIVE' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"karmaPoints" integer DEFAULT 0 NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"lastLoginAt" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_userName_unique" UNIQUE("userName")
);
--> statement-breakpoint
CREATE TABLE "postCollaborators" (
	"postId" varchar(21) NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "postEdit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postId" varchar(21) NOT NULL,
	"authorId" uuid NOT NULL,
	"content" "bytea",
	"approvalStatus" "post_approval_status" DEFAULT 'PENDING' NOT NULL,
	"approvalLogs" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"title" varchar(500),
	"type" "post_type" NOT NULL,
	"difficulty" "difficulty",
	"companies" varchar(255)[] DEFAULT '{}',
	"completionDuration" integer,
	"topics" varchar(255)[] DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "postViews" (
	"postId" varchar(21) PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"title" varchar(500),
	"slug" varchar(255),
	"thumbnail" varchar(500),
	"content" "bytea",
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"authorId" uuid NOT NULL,
	"type" "post_type" NOT NULL,
	"difficulty" "difficulty",
	"companies" varchar(255)[] DEFAULT '{}',
	"completionDuration" integer,
	"coins" integer DEFAULT 0,
	"topics" varchar(255)[] DEFAULT '{}',
	"category" "post_category" NOT NULL,
	"subCategory" "sub_category" NOT NULL,
	"status" "post_status" DEFAULT 'DRAFT' NOT NULL,
	"approvalStatus" "post_approval_status" DEFAULT 'PENDING' NOT NULL,
	"approvalLogs" json
);
--> statement-breakpoint
CREATE TABLE "vote" (
	"userId" uuid NOT NULL,
	"postId" varchar(21) NOT NULL,
	"type" "vote_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"type" varchar(100) NOT NULL,
	"message" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"link" varchar(500),
	"relatedId" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporterId" uuid NOT NULL,
	"postId" varchar(21),
	"commentId" uuid,
	"reason" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_providerAccountId_idx" ON "account" USING btree ("provider","providerAccountId");--> statement-breakpoint
CREATE UNIQUE INDEX "bookmark_userId_postId_idx" ON "bookmark" USING btree ("userId","postId");--> statement-breakpoint
CREATE INDEX "challengeSubmission_postId_userId_idx" ON "challengeSubmission" USING btree ("postId","userId");--> statement-breakpoint
CREATE INDEX "challengeSubmission_userId_idx" ON "challengeSubmission" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "challengeSubmission_postId_idx" ON "challengeSubmission" USING btree ("postId");--> statement-breakpoint
CREATE UNIQUE INDEX "challengeTemplate_postId_framework_idx" ON "challengeTemplate" USING btree ("postId","framework");--> statement-breakpoint
CREATE INDEX "challengeTemplate_postId_idx" ON "challengeTemplate" USING btree ("postId");--> statement-breakpoint
CREATE UNIQUE INDEX "commentMention_userId_commentId_idx" ON "commentMention" USING btree ("userId","commentId");--> statement-breakpoint
CREATE INDEX "commentMention_commentId_idx" ON "commentMention" USING btree ("commentId");--> statement-breakpoint
CREATE UNIQUE INDEX "commentVote_userId_commentId_idx" ON "commentVote" USING btree ("userId","commentId");--> statement-breakpoint
CREATE INDEX "commentVote_commentId_type_idx" ON "commentVote" USING btree ("commentId","type");--> statement-breakpoint
CREATE INDEX "comment_postId_parentId_idx" ON "comment" USING btree ("postId","parentId");--> statement-breakpoint
CREATE INDEX "comment_createdAt_idx" ON "comment" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "comment_parentId_idx" ON "comment" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "comment_authorId_idx" ON "comment" USING btree ("authorId");--> statement-breakpoint
CREATE UNIQUE INDEX "completionStatus_userId_postId_idx" ON "completionStatus" USING btree ("userId","postId");--> statement-breakpoint
CREATE UNIQUE INDEX "follow_followerId_followedId_idx" ON "follow" USING btree ("followerId","followedId");--> statement-breakpoint
CREATE INDEX "follow_followerId_idx" ON "follow" USING btree ("followerId");--> statement-breakpoint
CREATE INDEX "follow_followedId_idx" ON "follow" USING btree ("followedId");--> statement-breakpoint
CREATE INDEX "userProfile_userId_idx" ON "userProfile" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "userProfile_email_idx" ON "userProfile" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_userName_idx" ON "user" USING btree ("userName");--> statement-breakpoint
CREATE UNIQUE INDEX "postCollaborators_postId_userId_idx" ON "postCollaborators" USING btree ("postId","userId");--> statement-breakpoint
CREATE INDEX "postCollaborators_postId_idx" ON "postCollaborators" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "postCollaborators_userId_idx" ON "postCollaborators" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "postEdit_postId_idx" ON "postEdit" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "postEdit_authorId_idx" ON "postEdit" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "postEdit_approvalStatus_idx" ON "postEdit" USING btree ("approvalStatus");--> statement-breakpoint
CREATE UNIQUE INDEX "postEdit_postId_authorId" ON "postEdit" USING btree ("postId","authorId");--> statement-breakpoint
CREATE INDEX "post_authorId_idx" ON "post" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "post_slug_idx" ON "post" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "post_type_idx" ON "post" USING btree ("type");--> statement-breakpoint
CREATE INDEX "post_category_idx" ON "post" USING btree ("category");--> statement-breakpoint
CREATE INDEX "post_subCategory_idx" ON "post" USING btree ("subCategory");--> statement-breakpoint
CREATE INDEX "post_status_idx" ON "post" USING btree ("status");--> statement-breakpoint
CREATE INDEX "post_approvalStatus_idx" ON "post" USING btree ("approvalStatus");--> statement-breakpoint
CREATE INDEX "post_createdAt_idx" ON "post" USING btree ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "postIdSlug" ON "post" USING btree ("id","slug");--> statement-breakpoint
CREATE INDEX "vote_postId_type_idx" ON "vote" USING btree ("postId","type");--> statement-breakpoint
CREATE INDEX "notification_userId_isRead_idx" ON "notification" USING btree ("userId","isRead");