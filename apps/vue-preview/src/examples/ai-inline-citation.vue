<script setup lang="ts">
import { Button } from "@valar/vue-ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@valar/vue-ui/hover-card";
import { computed } from "vue";

const props = defineProps<{ chinese?: boolean }>();
const language = computed(() => (props.chinese ? 1 : 0));
const lang = computed(() => (props.chinese ? "zh-CN" : "en"));
const newTab = computed(() => (props.chinese ? "（在新标签页打开）" : " (opens in a new tab)"));

const citations = [
	{
		url: "https://nextjs.org/docs/app/getting-started/linking-and-navigating#streaming",
		text: [
			"Next.js streams a route in chunks so the page can appear before every request finishes.",
			"Next.js 分块流式传输路由，不必等所有请求完成就能显示页面。",
		],
		title: ["Linking and Navigating", "链接与导航"],
		description: [
			"How the App Router streams a route to the browser.",
			"了解 App Router 如何将路由流式传输到浏览器。",
		],
	},
	{
		url: "https://react.dev/reference/react/Suspense",
		text: [
			"Use Suspense to show a fallback while a slow part of the page loads.",
			"使用 Suspense 在加载较慢的页面区域时显示后备内容。",
		],
		title: ["<Suspense>", "<Suspense>"],
		description: [
			"Display a fallback until the children have finished loading.",
			"在子组件加载完毕前显示后备内容。",
		],
	},
].map((citation) => ({ ...citation, hostname: new URL(citation.url).hostname }));
</script>

<template>
	<section :lang="lang" class="grid w-full max-w-sm min-w-0 gap-3 p-4 text-sm leading-relaxed">
		<p v-for="citation in citations" :key="citation.url">
			{{ citation.text[language] }}{{ " " }}
			<HoverCard :open-delay="10" :close-delay="100">
				<HoverCardTrigger as-child>
					<Button
						:href="citation.url"
						target="_blank"
						rel="noreferrer"
						variant="secondary"
						size="xs"
						class="align-baseline"
					>
						{{ citation.hostname
						}}<span class="sr-only">{{ ` — ${citation.title[language]}${newTab}` }}</span>
					</Button>
				</HoverCardTrigger>
				<HoverCardContent :lang="lang" class="flex w-64 flex-col gap-1">
					<p class="font-medium">{{ citation.title[language] }}</p>
					<p class="text-muted-foreground">{{ citation.description[language] }}</p>
					<a
						:href="citation.url"
						target="_blank"
						rel="noreferrer"
						class="self-start rounded-sm text-xs underline underline-offset-4 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
					>
						{{ citation.hostname }}<span class="sr-only">{{ newTab }}</span>
					</a>
				</HoverCardContent>
			</HoverCard>
		</p>
	</section>
</template>
