import { Button } from "@valar/react-ui/button";
import { Checkbox } from "@valar/react-ui/checkbox";
import { Input } from "@valar/react-ui/input";
import {
	Popover,
	PopoverClose,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@valar/react-ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@valar/react-ui/select";
import { Separator } from "@valar/react-ui/separator";
import { useId, useState } from "react";

const row = "flex min-h-8 items-center justify-between gap-2";

export default function PopoverExample() {
	const id = useId();
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("Valar");
	const [grouping, setGrouping] = useState("none");
	const [showProjects, setShowProjects] = useState(true);
	const [showWeekNumbers, setShowWeekNumbers] = useState(false);
	const changed = grouping !== "none" || !showProjects || showWeekNumbers;

	return (
		<section aria-label="Popover examples" className="grid gap-3 p-6">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button variant="outline">Edit profile</Button>
					</PopoverTrigger>
					<PopoverContent
						align="start"
						aria-labelledby={`${id}-profile`}
						aria-describedby={`${id}-description`}
					>
						<PopoverHeader>
							<PopoverTitle id={`${id}-profile`}>Edit profile</PopoverTitle>
							<PopoverDescription id={`${id}-description`}>
								Set your display name.
							</PopoverDescription>
						</PopoverHeader>
						<form
							className="grid gap-2"
							onSubmit={(event) => {
								event.preventDefault();
								setName(String(new FormData(event.currentTarget).get("name")));
								setOpen(false);
							}}
						>
							<label htmlFor={`${id}-name`}>Display name</label>
							<Input id={`${id}-name`} name="name" defaultValue={name} required />
							<div className="flex justify-end gap-2">
								<PopoverClose asChild>
									<Button variant="ghost">Cancel</Button>
								</PopoverClose>
								<Button type="submit">Save profile</Button>
							</div>
						</form>
					</PopoverContent>
				</Popover>
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline">Display options</Button>
					</PopoverTrigger>
					<PopoverContent appearance="options" align="end" aria-labelledby={`${id}-options`}>
						<div className="grid shrink-0 px-4 py-2">
							<PopoverTitle id={`${id}-options`} className="mb-1">
								Display options
							</PopoverTitle>
							<div className={row}>
								<span id={`${id}-grouping`}>Grouping</span>
								<Select value={grouping} onValueChange={setGrouping}>
									<SelectTrigger size="sm" className="h-6!" aria-labelledby={`${id}-grouping`}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent align="end">
										<SelectItem value="none">No grouping</SelectItem>
										<SelectItem value="lead">Lead</SelectItem>
										<SelectItem value="status">Status</SelectItem>
										<SelectItem value="team">Team</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<Separator decorative />
						<div className="grid shrink-0 px-4 py-2">
							<p className="mb-1 font-medium">Timeline options</p>
							<label className={row} htmlFor={`${id}-projects`}>
								Show project list
								<Checkbox
									id={`${id}-projects`}
									checked={showProjects}
									onCheckedChange={(value) => setShowProjects(value === true)}
								/>
							</label>
							<label className={row} htmlFor={`${id}-weeks`}>
								Show week numbers
								<Checkbox
									id={`${id}-weeks`}
									checked={showWeekNumbers}
									onCheckedChange={(value) => setShowWeekNumbers(value === true)}
								/>
							</label>
						</div>
						<Separator decorative />
						<div className="flex shrink-0 flex-wrap justify-between gap-2 px-4 py-2">
							<Button
								size="sm"
								variant="ghost"
								disabled={!changed}
								onClick={() => {
									setGrouping("none");
									setShowProjects(true);
									setShowWeekNumbers(false);
								}}
							>
								Reset
							</Button>
							<PopoverClose asChild>
								<Button size="sm" variant="outline">
									Done
								</Button>
							</PopoverClose>
						</div>
					</PopoverContent>
				</Popover>
			</div>
			<output aria-label="Saved display name" className="text-sm text-muted-foreground">
				{name}
			</output>
		</section>
	);
}
