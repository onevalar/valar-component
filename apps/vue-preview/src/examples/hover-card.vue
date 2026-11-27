<script setup lang="ts">
import { Avatar, AvatarFallback } from "@valar/vue-ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@valar/vue-ui/hover-card";
import { Separator } from "@valar/vue-ui/separator";
import { useId } from "vue";

const profileId = useId();
</script>

<template>
	<section aria-label="Hover Card examples" class="grid w-full max-w-sm gap-4 p-6 text-sm">
		<p>
			<HoverCard :open-delay="300" :close-delay="150">
				<HoverCardTrigger
					:href="`#${profileId}`"
					class="rounded-sm font-medium underline underline-offset-2"
				>
					Jordan Davis
				</HoverCardTrigger>
				<HoverCardContent appearance="profile" align="start">
					<div class="flex items-center gap-2 py-1">
						<Avatar aria-hidden="true"><AvatarFallback>JD</AvatarFallback></Avatar>
						<div>
							<p class="text-[13px] font-medium">Jordan Davis</p>
							<p class="text-muted-foreground">@jordan</p>
						</div>
					</div>
					<Separator class="my-1" />
					<p>Design Systems · Project lead</p>
				</HoverCardContent>
			</HoverCard>
			updated the launch checklist.
		</p>
		<article :id="profileId" class="grid gap-1 rounded-lg border-[0.5px] border-border bg-card p-3">
			<h2 class="font-medium">Jordan Davis profile</h2>
			<p class="text-muted-foreground">@jordan · Design Systems · Project lead</p>
			<p>Owns release readiness and the launch checklist.</p>
		</article>
	</section>
</template>
