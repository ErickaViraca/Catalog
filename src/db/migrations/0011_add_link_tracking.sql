CREATE TABLE "tracked_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"destination_url" text NOT NULL,
	"label" text NOT NULL,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tracked_links_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "link_clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"link_id" uuid NOT NULL,
	"clicked_at" timestamp DEFAULT now(),
	"ip_address" text,
	"city" text,
	"region" text,
	"country" text,
	"country_code" text,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"user_agent" text,
	"browser" text,
	"os" text,
	"device_type" text,
	"referrer" text
);
--> statement-breakpoint
ALTER TABLE "link_clicks" ADD CONSTRAINT "link_clicks_link_id_tracked_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."tracked_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tracked_links_slug_idx" ON "tracked_links" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "link_clicks_link_id_idx" ON "link_clicks" USING btree ("link_id");--> statement-breakpoint
CREATE INDEX "link_clicks_clicked_at_idx" ON "link_clicks" USING btree ("clicked_at");
