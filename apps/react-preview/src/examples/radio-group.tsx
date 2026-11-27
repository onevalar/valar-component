import { Field, FieldLabel } from "@valar/react-ui/field";
import { RadioGroup, RadioGroupItem } from "@valar/react-ui/radio-group";
import { useId } from "react";

export default function RadioGroupExample() {
	const id = useId();

	return (
		<section aria-label="Radio Group examples" className="grid max-w-sm gap-4 p-6 text-sm">
			<p id={id} className="font-medium">
				Delivery method
			</p>
			<RadioGroup aria-labelledby={id} name="delivery" defaultValue="email" required>
				<Field orientation="horizontal">
					<RadioGroupItem id={`${id}-email`} value="email" />
					<FieldLabel htmlFor={`${id}-email`}>Email</FieldLabel>
				</Field>
				<Field orientation="horizontal">
					<RadioGroupItem id={`${id}-digest`} value="digest" />
					<FieldLabel htmlFor={`${id}-digest`}>Digest</FieldLabel>
				</Field>
				<Field orientation="horizontal" data-disabled="true">
					<RadioGroupItem id={`${id}-disabled`} value="disabled" disabled />
					<FieldLabel htmlFor={`${id}-disabled`}>Disabled</FieldLabel>
				</Field>
			</RadioGroup>
		</section>
	);
}
