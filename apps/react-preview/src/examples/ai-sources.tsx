"use client";

import { Button } from "@valar/react-ui/button";
import {
	Trace,
	TraceCollapsible,
	TraceCollapsibleContent,
	TraceCollapsibleTrigger,
	TraceIcon,
	TraceLine,
	TraceTitle,
} from "@valar/react-ui/trace";
import { useEffect, useState } from "react";

const parts = [
	{ type: "text", text: "Run pnpm create astro@latest and follow the prompts." },
	{
		type: "source-url",
		url: "https://docs.astro.build/en/install-and-setup/",
		title: "Install Astro",
	},
	{ type: "source-url", url: "https://www.npmjs.com/package/create-astro", title: "create-astro" },
	{
		type: "source-url",
		url: "https://docs.astro.build/en/install-and-setup/",
		title: "Astro setup",
	},
	{ type: "source-url", url: "https://pnpm.io/cli/create" },
] as const;

const sources = parts
	.filter((part) => part.type === "source-url")
	.filter((part, index, all) => all.findIndex((source) => source.url === part.url) === index);

export default function SourcesExample({ chinese = false }: { chinese?: boolean }) {
	const [replaying, setReplaying] = useState(false);

	useEffect(() => {
		if (!replaying) return;
		const timer = setTimeout(() => setReplaying(false), 600);
		return () => clearTimeout(timer);
	}, [replaying]);

	return (
		<section
			lang={chinese ? "zh-CN" : "en"}
			className="grid w-full max-w-sm min-w-0 gap-3 p-4 text-sm"
		>
			<p className="justify-self-end rounded-xl bg-muted px-3 py-2">
				{chinese ? "如何使用 pnpm 创建 Astro 项目？" : "How do I start an Astro project with pnpm?"}
			</p>
			<div role="status">
				{replaying
					? chinese
						? "正在查找来源…"
						: "Finding sources…"
					: chinese
						? "运行 pnpm create astro@latest 并按提示操作。"
						: parts[0].text}
			</div>
			{!replaying && (
				<Trace>
					<TraceCollapsible defaultOpen>
						<TraceCollapsibleTrigger>
							<TraceLine>
								<TraceIcon>
									<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25">
										<circle cx="8" cy="8" r="6" />
										<ellipse cx="8" cy="8" rx="2.5" ry="6" />
										<path d="M2 8h12" />
									</svg>
								</TraceIcon>
								<TraceTitle>
									{chinese ? `使用了 ${sources.length} 个来源` : `Used ${sources.length} sources`}
								</TraceTitle>
							</TraceLine>
						</TraceCollapsibleTrigger>
						<TraceCollapsibleContent>
							<ul className="grid min-w-0 gap-1">
								{sources.map((source) => (
									<li key={source.url} className="min-w-0">
										<a
											href={source.url}
											target="_blank"
											rel="noreferrer"
											className="inline-flex max-w-full rounded-md focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
										>
											<TraceLine>
												<TraceTitle>
													{"title" in source ? source.title : new URL(source.url).hostname}
													<span className="sr-only">
														{chinese ? "（在新标签页打开）" : " (opens in a new tab)"}
													</span>
												</TraceTitle>
												<TraceIcon>↗</TraceIcon>
											</TraceLine>
										</a>
									</li>
								))}
							</ul>
						</TraceCollapsibleContent>
					</TraceCollapsible>
				</Trace>
			)}
			<Button
				variant="outline"
				size="sm"
				className="justify-self-start"
				aria-disabled={replaying}
				onClick={() => !replaying && setReplaying(true)}
			>
				{chinese ? "重播" : "Replay"}
			</Button>
		</section>
	);
}
