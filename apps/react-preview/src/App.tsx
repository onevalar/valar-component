import * as React from "react";
import { Button } from "@valar/react-ui/button";
import { Calendar } from "@valar/react-ui/calendar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@valar/react-ui/chart";
import { Checkbox } from "@valar/react-ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@valar/react-ui/dialog";
import { Input } from "@valar/react-ui/input";
import { RangeCalendar } from "@valar/react-ui/range-calendar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@valar/react-ui/select";
import { Slider } from "@valar/react-ui/slider";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { fixture } from "../../../standards/comparisons/frameworks/fixtures.ts";
import { reportReady } from "../../../standards/comparisons/frameworks/ready.ts";

// Local constructors avoid UTC parsing shifting the shared calendar dates.
function date(value: string) {
	const [year, month, day] = value.split("-").map(Number);
	return new Date(year, month - 1, day);
}
function format(value: Date | undefined) {
	return value
		? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
		: "";
}

function FirstBatch({ disabled, reset }: { disabled: boolean; reset: () => void }) {
	const [ready, setReady] = React.useState(false);
	const [count, setCount] = React.useState(0);
	const [name, setName] = React.useState("");
	const [agree, setAgree] = React.useState(false);
	const [provider, setProvider] = React.useState("claude");
	const [selected, setSelected] = React.useState<Date | undefined>(date(fixture.date));
	const [month, setMonth] = React.useState(date(fixture.month));
	const [rangeMonth, setRangeMonth] = React.useState(date(fixture.month));
	const [range, setRange] = React.useState<{ from: Date | undefined; to?: Date } | undefined>({
		from: date(fixture.range.start),
		to: date(fixture.range.end),
	});
	const [quota, setQuota] = React.useState(fixture.slider.initial);
	const [formResult, setFormResult] = React.useState("{}");
	const [reducedMotion, setReducedMotion] = React.useState(
		() => window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);

	React.useEffect(() => {
		setReady(true);
		reportReady("react");
		const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => setReducedMotion(preference.matches);
		preference.addEventListener("change", update);
		return () => preference.removeEventListener("change", update);
	}, []);

	return (
		<form
			className="first-batch-demo"
			data-framework="react"
			data-ready={ready ? "true" : "false"}
			onSubmit={(event) => {
				event.preventDefault();
				setFormResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
			}}
			onReset={() => {
				// Allow the browser's actual reset default action first, then restore
				// controlled values and primitive state through a fresh fixture mount.
				queueMicrotask(reset);
			}}
		>
			<h1>Valar First Batch</h1>

			<section className="demo-section" data-demo="button">
				<h2>Button</h2>
				<div className="demo-row">
					<Button disabled={disabled} onClick={() => setCount((value) => value + 1)}>
						保存
					</Button>
					<Button variant="outline" disabled={disabled}>
						次要操作
					</Button>
					<Button size="icon" aria-label="添加" disabled={disabled}>
						＋
					</Button>
					<Button variant="secondary" shape="pill" disabled={disabled}>
						胶囊按钮
					</Button>
				</div>
				<output className="demo-result" data-result="button">
					{count}
				</output>
			</section>

			<section className="demo-section" data-demo="input">
				<h2>Input</h2>
				<label className="demo-field">
					名称
					<Input
						name="name"
						value={name}
						onChange={(event) => setName(event.target.value)}
						disabled={disabled}
					/>
				</label>
			</section>

			<section className="demo-section" data-demo="checkbox">
				<h2>Checkbox</h2>
				<div className="demo-row">
					<Checkbox
						id="agree"
						name="agree"
						checked={agree}
						onCheckedChange={(checked) => setAgree(checked === true)}
						disabled={disabled}
					/>
					<label htmlFor="agree">同意</label>
				</div>
			</section>

			<section className="demo-section" data-demo="select">
				<h2>Select</h2>
				<div className="demo-field">
					<label htmlFor="provider">服务商</label>
					<Select name="provider" value={provider} onValueChange={setProvider} disabled={disabled}>
						<SelectTrigger id="provider">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{fixture.options.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<output className="demo-result" data-result="select">
					{provider}
				</output>
			</section>

			<section className="demo-section" data-demo="dialog">
				<h2>Dialog</h2>
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="outline" disabled={disabled}>
							打开弹窗
						</Button>
					</DialogTrigger>
					<DialogContent closeLabel="关闭">
						<DialogHeader>
							<DialogTitle>编辑设置</DialogTitle>
							<DialogDescription>更新名称。</DialogDescription>
						</DialogHeader>
						<label className="demo-field">
							名称
							<Input name="dialog-name" disabled={disabled} />
						</label>
					</DialogContent>
				</Dialog>
			</section>

			<section className="demo-section" data-demo="calendar">
				<h2>Calendar</h2>
				<Calendar
					mode="single"
					captionLayout="dropdown"
					month={month}
					onMonthChange={setMonth}
					selected={selected}
					onSelect={setSelected}
					today={date(fixture.date)}
					disabled={disabled}
					disableNavigation={disabled}
				/>
				<output className="demo-result" data-result="calendar">
					{format(selected)}
				</output>
			</section>

			<section className="demo-section" data-demo="range-calendar">
				<h2>RangeCalendar</h2>
				<RangeCalendar
					captionLayout="dropdown"
					month={rangeMonth}
					onMonthChange={setRangeMonth}
					selected={range}
					onSelect={setRange}
					today={date(fixture.date)}
					disabled={disabled}
					disableNavigation={disabled}
				/>
				<output className="demo-result" data-result="range-calendar">
					{format(range?.from)} – {format(range?.to)}
				</output>
			</section>

			<section className="demo-section" data-demo="slider">
				<h2>Slider</h2>
				<div className="demo-field">
					<label id="quota-label">额度</label>
					<Slider
						type="single"
						name="quota"
						value={quota}
						onValueChange={setQuota}
						min={fixture.slider.min}
						max={fixture.slider.max}
						step={fixture.slider.step}
						largeStep={fixture.slider.largeStep}
						aria-labelledby="quota-label"
						thumbLabels={["额度"]}
						disabled={disabled}
					/>
				</div>
				<output className="demo-result" data-result="slider">
					{quota}
				</output>
			</section>

			<section className="demo-section" data-demo="chart">
				<h2>Chart</h2>
				<ChartContainer
					config={{ value: { label: "用量", color: "var(--chart-2)" } }}
					className="demo-chart"
					aria-label="每日用量"
				>
					<LineChart
						accessibilityLayer
						data={fixture.chart}
						margin={{ top: 4, right: 15, bottom: 0, left: 0 }}
					>
						<CartesianGrid vertical={false} />
						<XAxis dataKey="label" tickLine={false} axisLine={false} height={20} tickMargin={0} />
						<YAxis
							domain={[0, 40]}
							tickLine={false}
							tickSize={0}
							axisLine={false}
							width={20}
							tickMargin={4}
						/>
						<ChartTooltip content={<ChartTooltipContent hideLabel />} />
						<Line
							type="linear"
							dataKey="value"
							stroke="var(--color-value)"
							strokeWidth={2}
							dot={{ r: 3, fill: "var(--color-value)", stroke: "none" }}
							connectNulls={false}
							isAnimationActive={!reducedMotion}
						/>
					</LineChart>
				</ChartContainer>
			</section>

			<div className="demo-section">
				<div className="demo-form-actions">
					<Button type="submit" disabled={disabled}>
						提交
					</Button>
					<Button type="reset" variant="outline">
						重置
					</Button>
				</div>
				<output className="demo-result" data-result="form">
					{formResult}
				</output>
			</div>
		</form>
	);
}

export function App({ disabled }: { disabled: boolean }) {
	const [generation, setGeneration] = React.useState(0);
	return (
		<FirstBatch
			key={generation}
			disabled={disabled}
			reset={() => setGeneration((value) => value + 1)}
		/>
	);
}
