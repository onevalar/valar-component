"use client";

import { Button } from "@valar/react-ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@valar/react-ui/hover-card";
import { Progress } from "@valar/react-ui/progress";
import { useId, useState } from "react";

const limit = 128_000;
const usage = [
	{ en: "Input", zh: "输入", value: 8420 },
	{ en: "Output", zh: "输出", value: 1260 },
	{ en: "Reasoning", zh: "推理", value: 980 },
];
const used = usage.reduce((total, row) => total + row.value, 0);
const percent = Math.round((used / limit) * 100);

export default function ContextExample({ chinese = false }: { chinese?: boolean }) {
	const [open, setOpen] = useState(false);
	const [pinned, setPinned] = useState(false);
	const panelId = useId();
	const triggerId = `${panelId}-trigger`;
	const lang = chinese ? "zh-CN" : "en";
	const number = new Intl.NumberFormat(lang);
	const label = chinese ? "上下文" : "Context";
	function dismiss() {
		setPinned(false);
		setOpen(false);
	}

	return (
		<div lang={lang} className="flex w-full min-w-0 justify-center py-12">
			<HoverCard
				open={open}
				onOpenChange={(next) => !pinned && setOpen(next)}
				openDelay={10}
				closeDelay={100}
			>
				<HoverCardTrigger asChild>
					<Button
						id={triggerId}
						variant="outline"
						size="sm"
						aria-expanded={open}
						aria-controls={open ? panelId : undefined}
						onClick={() => {
							if (pinned) dismiss();
							else {
								setOpen(true);
								setPinned(true);
							}
						}}
					>
						{chinese ? `已用 ${percent}% 上下文` : `${percent}% context`}
					</Button>
				</HoverCardTrigger>
				<HoverCardContent
					id={panelId}
					lang={lang}
					className="grid w-64 gap-3"
					onEscapeKeyDown={dismiss}
					onPointerDownOutside={(event) => {
						const target = event.detail.originalEvent.target;
						if (target instanceof Element && target.closest("button")?.id === triggerId) {
							event.preventDefault();
						} else {
							dismiss();
						}
					}}
				>
					<div className="flex justify-between gap-3">
						<span className="font-medium">{label}</span>
						<span className="text-muted-foreground tabular-nums">
							{number.format(used)} / {number.format(limit)}
						</span>
					</div>
					<Progress value={percent} aria-label={chinese ? "已用上下文" : "Context used"} />
					<dl className="grid gap-1">
						{usage.map((row) => (
							<div key={row.en} className="flex justify-between gap-3">
								<dt className="text-muted-foreground">{chinese ? row.zh : row.en}</dt>
								<dd className="tabular-nums">{number.format(row.value)}</dd>
							</div>
						))}
					</dl>
				</HoverCardContent>
			</HoverCard>
		</div>
	);
}
