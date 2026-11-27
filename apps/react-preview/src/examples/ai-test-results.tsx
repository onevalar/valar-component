"use client";

import { Button } from "@valar/react-ui/button";
import { CodeBlock, CodeBlockContent } from "@valar/react-ui/code-block";
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

type Test = {
	name: string;
	zh: string;
} & ({ status: "passed" | "skipped" } | { status: "failed"; error: string });

const suites: { name: string; tests: Test[] }[] = [
	{
		name: "cart.test.ts",
		tests: [
			{ name: "adds an item", zh: "添加商品", status: "passed" },
			{ name: "removes an item", zh: "移除商品", status: "passed" },
		],
	},
	{
		name: "payment.test.ts",
		tests: [
			{ name: "charges the saved card", zh: "向已保存的卡扣款", status: "passed" },
			{
				name: "retries a declined card",
				zh: "重试被拒绝的卡",
				status: "failed",
				error: "Expected 2 charge attempts, received 1\n\n  at src/payment.test.ts:58:22",
			},
			{ name: "accepts an international card", zh: "接受国际信用卡", status: "skipped" },
		],
	},
];

function summarize(tests: Test[], chinese: boolean) {
	const passed = tests.filter((test) => test.status === "passed").length;
	const failed = tests.filter((test) => test.status === "failed").length;
	const skipped = tests.length - passed - failed;
	return {
		failed,
		label: chinese
			? `${tests.length} 项测试，${passed} 通过，${failed} 失败，${skipped} 跳过`
			: `${tests.length} tests, ${passed} passed, ${failed} failed, ${skipped} skipped`,
	};
}

export default function TestResultsExample({ chinese = false }: { chinese?: boolean }) {
	const [running, setRunning] = useState(false);
	const summary = summarize(
		suites.flatMap((suite) => suite.tests),
		chinese
	);
	useEffect(() => {
		if (!running) return;
		const timer = setTimeout(() => setRunning(false), 1000);
		return () => clearTimeout(timer);
	}, [running]);
	return (
		<section
			lang={chinese ? "zh-CN" : "en"}
			className="grid w-full max-w-sm min-w-0 gap-3 p-4 text-sm"
		>
			<Trace>
				{running ? (
					<TraceLine status="running">
						<TraceIcon>◌</TraceIcon>
						<TraceTitle>{chinese ? "正在运行结账测试…" : "Running checkout tests…"}</TraceTitle>
					</TraceLine>
				) : (
					<TraceCollapsible defaultOpen={summary.failed > 0}>
						<TraceCollapsibleTrigger>
							<TraceLine status={summary.failed > 0 ? "error" : undefined}>
								<TraceIcon>≡</TraceIcon>
								<TraceTitle className="whitespace-normal">
									{chinese ? `已运行 ${summary.label}` : `Ran ${summary.label}`}
								</TraceTitle>
							</TraceLine>
						</TraceCollapsibleTrigger>
						<TraceCollapsibleContent>
							<Trace>
								{suites.map((suite) => {
									const counts = summarize(suite.tests, chinese);
									return (
										<TraceCollapsible key={suite.name} defaultOpen={counts.failed > 0}>
											<TraceCollapsibleTrigger>
												<TraceLine status={counts.failed > 0 ? "error" : undefined}>
													<TraceIcon>≡</TraceIcon>
													<TraceTitle className="whitespace-normal">
														{suite.name}
														{chinese ? "，" : ", "}
														{counts.label}
													</TraceTitle>
												</TraceLine>
											</TraceCollapsibleTrigger>
											<TraceCollapsibleContent>
												<Trace>
													{suite.tests.map((test) => {
														const label = chinese ? test.zh : test.name;
														if (test.status === "failed")
															return (
																<TraceCollapsible key={test.name} defaultOpen>
																	<TraceCollapsibleTrigger>
																		<TraceLine status="error">
																			<TraceIcon>×</TraceIcon>
																			<TraceTitle>
																				{chinese ? `失败：${label}` : `Failed: ${label}`}
																			</TraceTitle>
																		</TraceLine>
																	</TraceCollapsibleTrigger>
																	<TraceCollapsibleContent>
																		<CodeBlock size="sm">
																			<CodeBlockContent wrap code={test.error} />
																		</CodeBlock>
																	</TraceCollapsibleContent>
																</TraceCollapsible>
															);
														return (
															<TraceLine key={test.name}>
																<TraceIcon>{test.status === "passed" ? "✓" : "–"}</TraceIcon>
																<TraceTitle>
																	{test.status === "passed"
																		? chinese
																			? `通过：${label}`
																			: `Passed: ${label}`
																		: chinese
																			? `跳过：${label}`
																			: `Skipped: ${label}`}
																</TraceTitle>
															</TraceLine>
														);
													})}
												</Trace>
											</TraceCollapsibleContent>
										</TraceCollapsible>
									);
								})}
							</Trace>
						</TraceCollapsibleContent>
					</TraceCollapsible>
				)}
			</Trace>
			<Button
				variant="outline"
				size="sm"
				className="justify-self-start"
				aria-disabled={running}
				onClick={() => !running && setRunning(true)}
			>
				{chinese ? "重播" : "Replay"}
			</Button>
			<span role="status" className="sr-only">
				{running ? (chinese ? "正在运行结账测试" : "Running checkout tests") : summary.label}
			</span>
		</section>
	);
}
