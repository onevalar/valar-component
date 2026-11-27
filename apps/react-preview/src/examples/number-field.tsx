import { Button } from "@valar/react-ui/button";
import { Label } from "@valar/react-ui/label";
import { NumberField } from "@valar/react-ui/number-field";
import { useId, useState } from "react";

export default function NumberFieldExample() {
	const id = useId();
	const [value, setValue] = useState<number | undefined>(1.25);
	const [saved, setSaved] = useState("");
	return (
		<form
			aria-label="Allocation"
			className="grid max-w-xs gap-3 p-6 text-sm"
			onReset={() => setSaved("")}
			onSubmit={(event) => {
				event.preventDefault();
				setSaved(String(new FormData(event.currentTarget).get("hours")));
			}}
		>
			<Label htmlFor={id}>Estimated hours</Label>
			<NumberField
				id={id}
				name="hours"
				value={value}
				onValueChange={setValue}
				locale="de-DE"
				min={-0.75}
				max={7.25}
				step={0.5}
				required
				decrementLabel="Decrease hours"
				incrementLabel="Increase hours"
				invalidMessage="Enter a number in range."
			/>
			<div className="flex gap-2">
				<Button type="submit">Save estimate</Button>
				<Button type="reset" variant="outline">
					Reset
				</Button>
			</div>
			<p role="status">{saved && `Submitted: ${saved}`}</p>
		</form>
	);
}
