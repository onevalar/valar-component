import { Field, FieldLabel } from "@valar/react-ui/field";
import { NativeSelect, NativeSelectOption } from "@valar/react-ui/native-select";
import { useId } from "react";

export default function NativeSelectExample() {
	const id = useId();

	return (
		<section aria-label="Native Select examples" className="grid max-w-sm gap-4 p-6 text-sm">
			<Field>
				<FieldLabel htmlFor={id}>Time zone</FieldLabel>
				<NativeSelect id={id} name="timeZone" defaultValue="utc">
					<NativeSelectOption value="utc">UTC</NativeSelectOption>
					<NativeSelectOption value="local">Local time</NativeSelectOption>
				</NativeSelect>
			</Field>
			<Field data-disabled="true">
				<FieldLabel htmlFor={`${id}-workspace`}>Workspace default</FieldLabel>
				<NativeSelect id={`${id}-workspace`} size="sm" defaultValue="utc" disabled>
					<NativeSelectOption value="utc">UTC</NativeSelectOption>
				</NativeSelect>
			</Field>
		</section>
	);
}
