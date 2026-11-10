import SegmentedControl from "@source/components/arc/segmented-control/segmented-control";
import { Button } from "@source/components/arc/button/button";
import { Gauge, GaugeArc } from "@source/components/arc/gauge/gauge";
import { RulerSlider } from "@source/components/arc/ruler-slider/ruler-slider";
import { StaticSparkline } from "@source/components/arc/sparkline/static-sparkline";
import { StaticDonut } from "@source/components/arc/static-donut/static-donut";
import { WaffleChart } from "@source/components/arc/waffle-chart/waffle-chart";
import { DitherFill } from "@source/DitherFill";
import { MotionConfig } from "motion/react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "@source/components/arc/foundation.css";
import "./original.css";
import { seed, ruler, missing, disabled, parts, values, options, log } from "./fixtures";

function App() {
	const [value, setValue] = useState(seed);
	const [choice, setChoice] = useState("tokens");
	useEffect(() => {
		document.body.dataset.ready = "ready";
	}, []);
	return (
		<MotionConfig
			reducedMotion={
				new URLSearchParams(location.search).get("motion") === "reduce" ? "always" : "never"
			}
		>
			<p>Unchanged source imports, pinned revision c588b28. No Pro source imported.</p>
			<label>
				External Value{" "}
				<input
					type="number"
					value={value}
					onChange={(event) => setValue(Number(event.target.value))}
				/>
			</label>
			<button
				type="button"
				onClick={() => {
					log("reset", 600);
					setValue(600);
				}}
			>
				Reset Reference To 600
			</button>
			<section tabIndex={-1} aria-label="Focus Start">
				Disclosure
			</section>
			<Button>Close Fixture</Button>
			<Button tabIndex={-1}>Skip Fixture</Button>
			<Button disabled>Disabled Fixture</Button>
			<Button>Next Fixture</Button>
			<h3>Gauge / GaugeArc</h3>
			<div className="visual">
				<Gauge value={value} label="Quota" valueText={`${value}%`} />
			</div>
			<svg viewBox="0 0 100 90" width="60" aria-hidden="true">
				<GaugeArc value={missing ? null : value} radius={28} />
			</svg>
			<h3>WaffleChart</h3>
			<div className="visual">
				<WaffleChart data={missing ? [] : parts} label="A 65, B 35" />
			</div>
			<h3>StaticDonut</h3>
			<div className="visual">
				<StaticDonut parts={parts} total={100} />
			</div>
			<h3>StaticSparkline</h3>
			<StaticSparkline values={values} />
			<h3>RulerSlider</h3>
			<RulerSlider
				label="Reference"
				value={Math.min(ruler.max, value)}
				{...ruler}
				animateReadout={false}
				disabled={disabled}
				onValueChange={(next) => {
					setValue(next);
					log("value", next);
				}}
				onValueCommit={(next) => log("commit", next)}
			/>
			<h3>SegmentedControl</h3>
			<SegmentedControl
				label="Measure"
				value={choice}
				options={options}
				onValueChange={(next) => {
					setChoice(next);
					log("selection", next);
				}}
			/>
			<h3>Texture Fill</h3>
			{(["dither", "lines", "halftone", "hatch", "solid"] as const).map((texture) => (
				<DitherFill key={texture} value={value} texture={texture} className="texture" intro />
			))}
		</MotionConfig>
	);
}
createRoot(document.getElementById("app")!).render(<App />);
