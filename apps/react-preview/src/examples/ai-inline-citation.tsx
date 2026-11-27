"use client";

import { Button } from "@valar/react-ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@valar/react-ui/hover-card";

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
];

export default function InlineCitationExample({ chinese = false }: { chinese?: boolean }) {
	const language = chinese ? 1 : 0;
	const lang = chinese ? "zh-CN" : "en";
	const newTab = chinese ? "（在新标签页打开）" : " (opens in a new tab)";
	return (
		<section lang={lang} className="grid w-full max-w-sm min-w-0 gap-3 p-4 text-sm leading-relaxed">
			{citations.map((citation) => {
				const hostname = new URL(citation.url).hostname;
				return (
					<p key={citation.url}>
						{citation.text[language]}{" "}
						<HoverCard openDelay={10} closeDelay={100}>
							<HoverCardTrigger asChild>
								<Button
									href={citation.url}
									target="_blank"
									rel="noreferrer"
									variant="secondary"
									size="xs"
									className="align-baseline"
								>
									{hostname}
									<span className="sr-only">{` — ${citation.title[language]}${newTab}`}</span>
								</Button>
							</HoverCardTrigger>
							<HoverCardContent lang={lang} className="flex w-64 flex-col gap-1">
								<p className="font-medium">{citation.title[language]}</p>
								<p className="text-muted-foreground">{citation.description[language]}</p>
								<a
									href={citation.url}
									target="_blank"
									rel="noreferrer"
									className="self-start rounded-sm text-xs underline underline-offset-4 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
								>
									{hostname}
									<span className="sr-only">{newTab}</span>
								</a>
							</HoverCardContent>
						</HoverCard>
					</p>
				);
			})}
		</section>
	);
}
