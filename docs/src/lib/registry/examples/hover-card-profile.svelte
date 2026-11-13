<script lang="ts">
	import CircleIcon from "@lucide/svelte/icons/circle";
	import ClockIcon from "@lucide/svelte/icons/clock";
	import UsersIcon from "@lucide/svelte/icons/users";
	import * as Avatar from "$lib/registry/ui/avatar/index.js";
	import * as HoverCard from "$lib/registry/ui/hover-card/index.js";

	const profileId = $props.id();
</script>

{#snippet profileDetails()}
	<ul class="grid gap-2 text-[12px]/[18px]">
		<li class="flex items-center gap-2">
			<CircleIcon class="size-4 shrink-0 fill-current text-emerald-500" aria-hidden="true" />
			<span>Online</span>
		</li>
		<li class="flex items-center gap-2">
			<ClockIcon class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
			<span>Local time: 10:30 AM</span>
		</li>
		<li class="flex items-center gap-2">
			<UsersIcon class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
			<span>Design team</span>
		</li>
		<li class="flex items-center gap-2">
			<UsersIcon class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
			<span>Workspace member</span>
		</li>
	</ul>
{/snippet}

<div class="grid gap-2">
	<HoverCard.Root>
		<HoverCard.Trigger>
			{#snippet child({ props })}
				{@const { role: _role, ...linkProps } = props}
				<a
					{...linkProps}
					href={`#${profileId}`}
					class="w-fit rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
					>Jordan Lee</a
				>
			{/snippet}
		</HoverCard.Trigger>
		<HoverCard.Content appearance="profile" align="start">
			<div class="grid gap-1.5">
				<div class="flex items-center gap-2.5 px-1 py-1">
					<Avatar.Root class="size-8" aria-hidden="true">
						<Avatar.Fallback>JL</Avatar.Fallback>
					</Avatar.Root>
					<div class="min-w-0">
						<div
							class="truncate text-[13px]/[18px] font-medium text-[color:lch(10%_0_282)] dark:text-white"
						>
							Jordan Lee
						</div>
						<div
							class="truncate text-xs/4 text-muted-foreground dark:text-[color:lch(64.714%_1.425_272)]"
						>
							@jordan.lee
						</div>
					</div>
				</div>
				<div class="border-t px-1 pt-3 pb-1.5">{@render profileDetails()}</div>
			</div>
		</HoverCard.Content>
	</HoverCard.Root>
	<section
		id={profileId}
		tabindex="-1"
		aria-label="Jordan Lee profile"
		class="hidden text-sm target:block"
	>
		{@render profileDetails()}
	</section>
</div>
