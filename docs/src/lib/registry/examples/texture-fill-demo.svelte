<script lang="ts">
	import { TextureFill, textures } from "$lib/registry/ui/texture-fill/index.js";
</script>

<div class="grid w-full max-w-md gap-3">
	{#each textures as texture}
		<div class="grid gap-1 text-sm">
			<span>{texture} · 65%</span><TextureFill
				value={65}
				{texture}
				intro
				class="h-12 w-full rounded-lg"
			/>
		</div>
	{/each}
</div>
