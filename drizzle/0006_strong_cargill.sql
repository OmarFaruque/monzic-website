CREATE TABLE "blacklist" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(50) NOT NULL,
	"value" varchar(255) NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"promo_code" varchar(100) NOT NULL,
	"discount" json NOT NULL,
	"min_spent" varchar(50),
	"max_discount" varchar(50),
	"quota_available" varchar(50) NOT NULL,
	"used_quota" varchar(50) DEFAULT '0' NOT NULL,
	"total_usage" varchar(50) DEFAULT '0' NOT NULL,
	"expires" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"restrictions" json,
	"matches" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"message_id" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"policy_number" varchar(255) NOT NULL,
	"user_id" varchar(255),
	"cpw" varchar(255),
	"update_price" varchar DEFAULT false,
	"reg_number" varchar(50),
	"vehicle_make" varchar(100),
	"vehicle_model" varchar(100),
	"engine_cc" varchar(50),
	"start_date" timestamp,
	"end_date" timestamp,
	"date_of_birth" timestamp,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"phone" varchar(50),
	"licence_type" varchar(50),
	"licence_period" varchar(50),
	"vehicle_type" varchar(100),
	"promo_code" varchar(100),
	"payment_status" varchar(50),
	"intent_id" varchar(255),
	"spayment_id" varchar(255),
	"name_title" varchar(20),
	"post_code" varchar(20),
	"address" text,
	"town" varchar(100),
	"occupation" varchar(100),
	"cover_reason" varchar(255),
	"mail_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"quote_data" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"payment_intent_id" varchar(255),
	"payment_method" varchar(50),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" varchar(100) NOT NULL,
	"policy_number" varchar(100),
	"unread" boolean DEFAULT true NOT NULL,
	"is_closed" boolean DEFAULT false NOT NULL,
	"subject" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'open' NOT NULL,
	"priority" varchar(50) DEFAULT 'normal' NOT NULL,
	"assigned_to" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email_verified_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "verification_code_expires_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;