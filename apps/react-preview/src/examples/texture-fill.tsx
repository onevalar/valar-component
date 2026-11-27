import { Button } from "@valar/react-ui/button";
import { TextureFill } from "@valar/react-ui/texture-fill";
import { useState } from "react";

export default function TextureFillExample() {
	const [usage, setUsage] = useState(37);
	return (
		<section aria-label="Build minutes" className="grid w-full max-w-sm gap-3 p-6 text-sm">
			<div
				role="meter"
				aria-label="Build quota"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.min(usage, 100)}
				aria-valuetext={`${usage} percent used`}
			>
				<p className="mb-2">{usage}% of build minutes</p>
				<TextureFill
					value={usage}
					texture="hatch"
					className="h-10 w-full rounded-md text-primary"
				/>
			</div>
			<div className="flex flex-wrap gap-2">
				{[0, 37, 132].map((value) => (
					<Button
						key={value}
						type="button"
						size="sm"
						variant="outline"
						onClick={() => setUsage(value)}
					>
						{value}%
					</Button>
				))}
			</div>
		</section>
	);
}
