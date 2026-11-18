<script lang="ts">
	import { TextureFill, textures } from "$lib/registry/ui/texture-fill/index.js";
</script>

<div class="grid w-full max-w-md gap-3">
	{#each textures as texture}
		<div class="grid gap-1.5">
			<div class="flex items-center justify-between">
				<span class="text-[13px] font-medium text-foreground capitalize">{texture}</span>
				<span class="text-xs text-muted-foreground tabular-nums">65%</span>
			</div>
			<TextureFill
				value={65}
				{texture}
				intro
				class="h-9 w-full rounded-[8px] border-[0.5px] border-border bg-muted/40 p-0.5"
			/>
		</div>
	{/each}
</div>
