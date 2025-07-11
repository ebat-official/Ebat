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
CREATE TABLE "Account" (
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
CREATE TABLE "ResetToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "ResetToken_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "VerificationToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "VerificationToken_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "Bookmark" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"postId" varchar(21) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ChallengeSubmission" (
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
CREATE TABLE "ChallengeTemplate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postId" varchar(21) NOT NULL,
	"framework" "template_framework" NOT NULL,
	"questionTemplate" json NOT NULL,
	"answerTemplate" json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "CommentMention" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"commentId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "CommentVote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"commentId" uuid NOT NULL,
	"type" "vote_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"authorId" uuid NOT NULL,
	"postId" varchar(21) NOT NULL,
	"parentId" uuid
);
--> statement-breakpoint
CREATE TABLE "CompletionStatus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"postId" varchar(21) NOT NULL,
	"completedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Follow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"followerId" uuid NOT NULL,
	"followedId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "UserProfile" (
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
	CONSTRAINT "UserProfile_userId_unique" UNIQUE("userId"),
	CONSTRAINT "UserProfile_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "User" (
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
	CONSTRAINT "User_email_unique" UNIQUE("email"),
	CONSTRAINT "User_userName_unique" UNIQUE("userName")
);
--> statement-breakpoint
CREATE TABLE "PostCollaborators" (
	"postId" varchar(21) NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PostEdit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postId" varchar(21) NOT NULL,
	"authorId" uuid NOT NULL,
	"content" text,
	"approvalStatus" "post_approval_status" NOT NULL,
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
CREATE TABLE "PostViews" (
	"postId" varchar(21) PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Post" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"title" varchar(500),
	"slug" varchar(255),
	"thumbnail" varchar(500),
	"content" text,
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
	"status" "post_status" NOT NULL,
	"approvalStatus" "post_approval_status" NOT NULL,
	"approvalLogs" json
);
--> statement-breakpoint
CREATE TABLE "Vote" (
	"userId" uuid NOT NULL,
	"postId" varchar(21) NOT NULL,
	"type" "vote_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Notification" (
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
CREATE TABLE "Report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporterId" uuid NOT NULL,
	"postId" varchar(21),
	"commentId" uuid,
	"reason" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "Account_provider_providerAccountId_idx" ON "Account" USING btree ("provider","providerAccountId");--> statement-breakpoint
CREATE UNIQUE INDEX "Bookmark_userId_postId_idx" ON "Bookmark" USING btree ("userId","postId");--> statement-breakpoint
CREATE INDEX "ChallengeSubmission_postId_userId_idx" ON "ChallengeSubmission" USING btree ("postId","userId");--> statement-breakpoint
CREATE INDEX "ChallengeSubmission_userId_idx" ON "ChallengeSubmission" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "ChallengeSubmission_postId_idx" ON "ChallengeSubmission" USING btree ("postId");--> statement-breakpoint
CREATE UNIQUE INDEX "ChallengeTemplate_postId_framework_idx" ON "ChallengeTemplate" USING btree ("postId","framework");--> statement-breakpoint
CREATE INDEX "ChallengeTemplate_postId_idx" ON "ChallengeTemplate" USING btree ("postId");--> statement-breakpoint
CREATE UNIQUE INDEX "CommentMention_userId_commentId_idx" ON "CommentMention" USING btree ("userId","commentId");--> statement-breakpoint
CREATE INDEX "CommentMention_commentId_idx" ON "CommentMention" USING btree ("commentId");--> statement-breakpoint
CREATE UNIQUE INDEX "CommentVote_userId_commentId_idx" ON "CommentVote" USING btree ("userId","commentId");--> statement-breakpoint
CREATE INDEX "CommentVote_commentId_type_idx" ON "CommentVote" USING btree ("commentId","type");--> statement-breakpoint
CREATE INDEX "Comment_postId_parentId_idx" ON "Comment" USING btree ("postId","parentId");--> statement-breakpoint
CREATE INDEX "Comment_createdAt_idx" ON "Comment" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "Comment_parentId_idx" ON "Comment" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "Comment_authorId_idx" ON "Comment" USING btree ("authorId");--> statement-breakpoint
CREATE UNIQUE INDEX "CompletionStatus_userId_postId_idx" ON "CompletionStatus" USING btree ("userId","postId");--> statement-breakpoint
CREATE UNIQUE INDEX "Follow_followerId_followedId_idx" ON "Follow" USING btree ("followerId","followedId");--> statement-breakpoint
CREATE INDEX "Follow_followerId_idx" ON "Follow" USING btree ("followerId");--> statement-breakpoint
CREATE INDEX "Follow_followedId_idx" ON "Follow" USING btree ("followedId");--> statement-breakpoint
CREATE INDEX "UserProfile_userId_idx" ON "UserProfile" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "UserProfile_email_idx" ON "UserProfile" USING btree ("email");--> statement-breakpoint
CREATE INDEX "User_email_idx" ON "User" USING btree ("email");--> statement-breakpoint
CREATE INDEX "User_userName_idx" ON "User" USING btree ("userName");--> statement-breakpoint
CREATE UNIQUE INDEX "PostCollaborators_postId_userId_idx" ON "PostCollaborators" USING btree ("postId","userId");--> statement-breakpoint
CREATE INDEX "PostCollaborators_postId_idx" ON "PostCollaborators" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "PostCollaborators_userId_idx" ON "PostCollaborators" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "PostEdit_postId_idx" ON "PostEdit" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "PostEdit_authorId_idx" ON "PostEdit" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "PostEdit_approvalStatus_idx" ON "PostEdit" USING btree ("approvalStatus");--> statement-breakpoint
CREATE UNIQUE INDEX "postId_authorId" ON "PostEdit" USING btree ("postId","authorId");--> statement-breakpoint
CREATE INDEX "Post_authorId_idx" ON "Post" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "Post_slug_idx" ON "Post" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "Post_type_idx" ON "Post" USING btree ("type");--> statement-breakpoint
CREATE INDEX "Post_category_idx" ON "Post" USING btree ("category");--> statement-breakpoint
CREATE INDEX "Post_subCategory_idx" ON "Post" USING btree ("subCategory");--> statement-breakpoint
CREATE INDEX "Post_status_idx" ON "Post" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Post_approvalStatus_idx" ON "Post" USING btree ("approvalStatus");--> statement-breakpoint
CREATE INDEX "Post_createdAt_idx" ON "Post" USING btree ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "PostIdSlug" ON "Post" USING btree ("id","slug");--> statement-breakpoint
CREATE INDEX "Vote_postId_type_idx" ON "Vote" USING btree ("postId","type");--> statement-breakpoint
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification" USING btree ("userId","isRead");