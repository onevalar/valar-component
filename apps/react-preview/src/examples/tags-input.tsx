import { Label } from "@valar/react-ui/label";
import { TagsInput } from "@valar/react-ui/tags-input";
import { useId } from "react";

export default function TagsInputExample() {
	const id = useId();
	return (
		<section aria-label="Issue labels" className="grid w-full max-w-md gap-3 p-6 text-sm">
			<Label htmlFor={id}>Labels</Label>
			<TagsInput
				id={id}
				name="label"
				defaultValue={["Design"]}
				max={3}
				tagsLabel="Applied labels"
				removeLabel={(tag) => `Remove ${tag}`}
				messages={{
					duplicate: "This label already exists.",
					max: (max) => `Add up to ${max} labels.`,
				}}
				placeholder="Add a label…"
				aria-describedby={`${id}-hint`}
			/>
			<p id={`${id}-hint`} className="text-muted-foreground">
				Separate labels with commas, or press Enter.
			</p>
		</section>
	);
}
