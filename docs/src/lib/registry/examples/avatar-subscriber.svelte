<script lang="ts">
	import * as Avatar from "$lib/registry/ui/avatar/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	let showPhoto = $state(true);
</script>

<div class="flex flex-wrap items-center justify-center gap-3">
	<div class="flex min-w-0 items-center gap-2 text-xs">
		<Avatar.Root appearance="subscriber" aria-hidden="true">
			<Avatar.Image src={showPhoto ? "/avatars/01.png" : ""} alt="" />
			<Avatar.Fallback>AC</Avatar.Fallback>
		</Avatar.Root>
		<span class="wrap-anywhere">Avery Chen</span>
	</div>
	<div class="flex min-w-0 items-center gap-2 text-[13px]">
		<Avatar.Root appearance="member" aria-hidden="true">
			<Avatar.Fallback>JL</Avatar.Fallback>
		</Avatar.Root>
		<span class="wrap-anywhere">Jordan Lee</span>
	</div>
	<Button variant="outline" size="sm" onclick={() => (showPhoto = !showPhoto)}>
		{showPhoto ? "Use initials" : "Restore photo"}
	</Button>
</div>
