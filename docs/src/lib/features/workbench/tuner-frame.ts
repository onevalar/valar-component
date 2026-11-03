import { z } from "zod";

/** Read-only inherited tokens; never accept arbitrary declarations or parent stylesheets. */
export const FRAME_TOKENS = [
	"--spacing",
	"--radius",
	"--background",
	"--foreground",
	"--card",
	"--card-foreground",
	"--popover",
	"--popover-foreground",
	"--border",
	"--muted",
	"--muted-foreground",
	"--accent",
	"--accent-foreground",
	"--sidebar",
	"--sidebar-foreground",
	"--sidebar-primary",
	"--sidebar-primary-foreground",
	"--sidebar-accent",
	"--sidebar-accent-foreground",
	"--sidebar-border",
	"--sidebar-ring",
] as const;

export const frameTokensSchema = z.partialRecord(
	z.enum(FRAME_TOKENS),
	z
		.string()
		.max(512)
		.regex(/^[^;{}]*$/)
);
