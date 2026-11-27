<script setup lang="ts">
import { Avatar, AvatarFallback } from "@valar/vue-ui/avatar";
import { Button } from "@valar/vue-ui/button";
import { Card, CardContent } from "@valar/vue-ui/card";
import { Skeleton } from "@valar/vue-ui/skeleton";
import { ref } from "vue";

const loading = ref(true);
</script>

<template>
	<section aria-label="Skeleton examples" class="grid w-full max-w-sm gap-3 p-6 text-sm">
		<Button
			size="sm"
			variant="outline"
			class="justify-self-start"
			:aria-pressed="loading"
			@click="loading = !loading"
		>
			Show loading state
		</Button>
		<Card size="sm" :aria-busy="loading">
			<CardContent class="flex min-h-10 items-center gap-3">
				<template v-if="loading">
					<Skeleton class="size-8 shrink-0 rounded-full" />
					<div class="grid min-w-0 flex-1 gap-2">
						<Skeleton class="h-3 w-2/5" />
						<Skeleton class="h-3 w-3/5" />
					</div>
				</template>
				<template v-else>
					<Avatar><AvatarFallback aria-hidden="true">JD</AvatarFallback></Avatar>
					<div>
						<p class="font-medium">Jordan Davis</p>
						<p class="text-xs text-muted-foreground">Workspace administrator</p>
					</div>
				</template>
			</CardContent>
		</Card>
		<span class="sr-only" role="status">{{ loading ? "Loading member" : "Member loaded" }}</span>
	</section>
</template>
