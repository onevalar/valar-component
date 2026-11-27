<script setup lang="ts">
import {
	Avatar,
	AvatarBadge,
	AvatarFallback,
	AvatarGroup,
	AvatarGroupCount,
	AvatarImage,
} from "@valar/vue-ui/avatar";

const memberImage = `data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#45437b"/><circle cx="20" cy="15" r="7" fill="#e5dcfa"/><path fill="#e5dcfa" d="M6 40a14 14 0 0 1 28 0"/></svg>'
)}`;
</script>

<template>
	<section aria-label="Avatar examples" class="grid w-full max-w-sm gap-4 p-6 text-sm">
		<div class="flex items-center gap-2">
			<Avatar appearance="member">
				<AvatarFallback aria-hidden="true">JD</AvatarFallback>
			</Avatar>
			<span>Jordan Davis</span>
		</div>
		<div class="flex items-center gap-2">
			<Avatar size="lg">
				<AvatarImage :src="memberImage" alt="" />
				<AvatarFallback aria-hidden="true">SK</AvatarFallback>
				<AvatarBadge aria-hidden="true" />
			</Avatar>
			<span>Sam Kim <span class="text-muted-foreground">· Online</span></span>
		</div>
		<div class="flex flex-wrap items-center gap-3">
			<p>Subscribers</p>
			<AvatarGroup>
				<Avatar appearance="subscriber" size="sm">
					<AvatarFallback class="bg-primary text-primary-foreground">
						<span aria-hidden="true">AL</span><span class="sr-only">Alex Lee</span>
					</AvatarFallback>
				</Avatar>
				<Avatar appearance="subscriber" size="sm">
					<AvatarFallback>
						<span aria-hidden="true">RM</span><span class="sr-only">Rory Morgan</span>
					</AvatarFallback>
				</Avatar>
				<AvatarGroupCount>
					<span aria-hidden="true">+2</span><span class="sr-only">2 more subscribers</span>
				</AvatarGroupCount>
			</AvatarGroup>
		</div>
	</section>
</template>
