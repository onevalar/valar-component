<script setup lang="ts">
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@valar/vue-ui/navigation-menu";
import { useId } from "vue";

const id = useId();
</script>

<template>
	<section
		aria-label="Navigation Menu examples"
		class="grid w-full max-w-sm justify-items-start gap-3 p-6 text-sm"
	>
		<NavigationMenu aria-label="Workspace navigation">
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuLink active :href="`#${id}-overview`">Overview</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Projects</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul>
							<li>
								<NavigationMenuLink :href="`#${id}-projects`">All projects</NavigationMenuLink>
							</li>
							<li><NavigationMenuLink :href="`#${id}-launch`">Launch plan</NavigationMenuLink></li>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
		<div class="grid w-full gap-3 rounded-lg border-[0.5px] border-border bg-card p-3">
			<div>
				<h2 :id="`${id}-overview`" class="font-medium">Workspace overview</h2>
				<p class="text-muted-foreground">Design Systems team</p>
			</div>
			<div>
				<h2 :id="`${id}-projects`" class="font-medium">All projects</h2>
				<p class="text-muted-foreground">One active project</p>
			</div>
			<div>
				<h2 :id="`${id}-launch`" class="font-medium">Launch plan</h2>
				<p class="text-muted-foreground">Review the release checklist.</p>
			</div>
		</div>
	</section>
</template>
