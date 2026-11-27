import { Field, FieldDescription, FieldLabel } from "@valar/react-ui/field";
import { Textarea } from "@valar/react-ui/textarea";
import { useId, useState } from "react";

const maxDescriptionLength = 255;

export default function TextareaExample() {
	const id = useId();
	const [description, setDescription] = useState("");

	return (
		<section aria-label="Textarea examples" className="grid max-w-sm gap-4 p-6 text-sm">
			<Field>
				<FieldLabel htmlFor={`${id}-description`}>Description</FieldLabel>
				<Textarea
					id={`${id}-description`}
					name="description"
					appearance="settings"
					placeholder="Describe your team"
					value={description}
					onChange={(event) => setDescription(event.currentTarget.value)}
					maxLength={maxDescriptionLength}
					aria-describedby={`${id}-description-length`}
				/>
				<FieldDescription id={`${id}-description-length`} className="tabular-nums">
					{description.length} / {maxDescriptionLength} characters
				</FieldDescription>
			</Field>
			<Field>
				<FieldLabel htmlFor={`${id}-notes`}>Notes</FieldLabel>
				<Textarea id={`${id}-notes`} name="notes" placeholder="Add a note" />
			</Field>
			<Field>
				<FieldLabel htmlFor={`${id}-template`}>Default template</FieldLabel>
				<Textarea id={`${id}-template`} defaultValue="Summary and next steps" readOnly />
			</Field>
		</section>
	);
}
