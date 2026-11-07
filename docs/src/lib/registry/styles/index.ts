import Valar from "./icons/valar.svelte";

export const STYLES = [
	{
		name: "valar",
		title: "Valar",
		description: "The Valar style. Compact spacing, restrained corners.",
		icon: Valar,
	},
] as const;

export type Style = (typeof STYLES)[number];
