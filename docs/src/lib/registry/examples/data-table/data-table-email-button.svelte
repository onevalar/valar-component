<script lang="ts">
	import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";
	import { Button } from "$lib/registry/ui/button/index.js";
	import type { ComponentProps } from "svelte";

	let { variant = "ghost", ...restProps }: ComponentProps<typeof Button> = $props();
</script>

<Button {variant} size="sm" shape="square" class="-ms-2.5 h-7 px-2.5 text-[13px]" {...restProps}>
	Email
	<ArrowUpDownIcon />
</Button>
