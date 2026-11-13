<script lang="ts">
	import ChevronDown from "@lucide/svelte/icons/chevron-down";
	import Copy from "@lucide/svelte/icons/copy";
	import { Button } from "$lib/registry/ui/button/index.js";
	import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
	import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";

	let tool = $state("Editor");
	let status = $state("");
</script>

<div class="grid justify-items-center gap-3">
	<ButtonGroup.Root variant="pill" aria-label="Issue prompt actions">
		<Button
			variant="ghost"
			size="icon-sm"
			aria-label="Prepare issue prompt"
			onclick={() => (status = `Issue prompt prepared for ${tool}.`)}
		>
			<Copy />
		</Button>
		<ButtonGroup.Separator />
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="ghost" size="icon-sm" aria-label="Choose coding tool">
						<ChevronDown />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="min-w-32">
				<DropdownMenu.RadioGroup bind:value={tool}>
					<DropdownMenu.RadioItem value="Editor" closeOnSelect>Editor</DropdownMenu.RadioItem>
					<DropdownMenu.RadioItem value="Terminal" closeOnSelect>Terminal</DropdownMenu.RadioItem>
				</DropdownMenu.RadioGroup>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</ButtonGroup.Root>
	<p role="status" class="text-muted-foreground min-h-5 text-sm">{status}</p>
</div>
