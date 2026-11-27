<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Checkbox, CheckboxGroup } from "$lib/registry/ui/checkbox/index.js";
</script>

<form onsubmit={(event) => event.preventDefault()}>
	<Field.Set>
		<Field.Legend id="finder-pref-options" variant="label"
			>Show these items on the desktop:</Field.Legend
		>
		<Field.Description>Select the items you want to show on the desktop.</Field.Description>
		<CheckboxGroup
			aria-labelledby="finder-pref-options"
			name="desktop-items"
			defaultValue={["hard-disks", "external-disks"]}
			required
			class="flex flex-col gap-3"
		>
			<Field.Field orientation="horizontal">
				<Checkbox id="finder-pref-9k2-hard-disks-ljj-checkbox" value="hard-disks" />
				<Field.Label for="finder-pref-9k2-hard-disks-ljj-checkbox" class="font-normal">
					Hard disks
				</Field.Label>
			</Field.Field>
			<Field.Field orientation="horizontal">
				<Checkbox id="finder-pref-9k2-external-disks-1yg-checkbox" value="external-disks" />
				<Field.Label for="finder-pref-9k2-external-disks-1yg-checkbox" class="font-normal">
					External disks
				</Field.Label>
			</Field.Field>
			<Field.Field orientation="horizontal">
				<Checkbox id="finder-pref-9k2-cds-dvds-fzt-checkbox" value="discs" />
				<Field.Label for="finder-pref-9k2-cds-dvds-fzt-checkbox" class="font-normal">
					CDs, DVDs, and iPods
				</Field.Label>
			</Field.Field>
			<Field.Field orientation="horizontal">
				<Checkbox id="finder-pref-9k2-connected-servers-6l2-checkbox" value="servers" />
				<Field.Label for="finder-pref-9k2-connected-servers-6l2-checkbox" class="font-normal">
					Connected servers
				</Field.Label>
			</Field.Field>
		</CheckboxGroup>
		<Button type="reset" variant="outline" size="sm" class="self-start"
			>Reset desktop options</Button
		>
	</Field.Set>
</form>
