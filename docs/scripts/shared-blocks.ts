export const sharedBlocks = [
	"settings-01",
	"my-issues-01",
	"new-issue-01",
	"projects-01",
	"inbox-01",
	"agent-01",
] as const;

export const sharedBlockDependencies: Readonly<Partial<Record<string, string[]>>> = {
	// Svelte's 0.1.6 wrapper uses a different DOM manager from the 0.1.21 plugins.
	"projects-01": ["@dnd-kit-svelte/svelte@0.1.5", "@dnd-kit/dom@0.1.21"],
};
