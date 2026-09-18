CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`total` integer NOT NULL,
	`items` text NOT NULL,
	`token` text NOT NULL,
	`last4` text NOT NULL,
	`expiry` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`price` integer NOT NULL,
	`image` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
