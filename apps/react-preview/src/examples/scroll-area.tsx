import { ScrollArea } from "@valar/react-ui/scroll-area";
import { Separator } from "@valar/react-ui/separator";

const updates = [
	"Mina updated the project description",
	"Sam closed VLR-33",
	"Jane added a design review milestone",
	"Mina shared feedback on the issue list",
	"Sam moved VLR-42 to In progress",
	"Jane assigned VLR-42 to Sam",
	"Mina created the Workspace refresh project",
];
const weeks = ["Nov 02–08", "Nov 09–15", "Nov 16–22", "Nov 23–29", "Nov 30–Dec 06"];

export default function ScrollAreaExample() {
	return (
		<section aria-label="Scroll Area examples" className="grid w-full max-w-md gap-2 p-6 text-sm">
			<h2 className="font-medium">Recent activity</h2>
			<ScrollArea
				appearance="settings"
				viewportLabel="Recent activity"
				overscroll="contain"
				className="h-40 rounded-lg border-[0.5px] border-border bg-card"
			>
				<ul className="px-3">
					{updates.map((update, index) => (
						<li key={update}>
							{index > 0 && <Separator decorative />}
							<p className="py-2.5 pe-2">{update}</p>
						</li>
					))}
				</ul>
			</ScrollArea>
			<ScrollArea
				orientation="horizontal"
				type="auto"
				viewportLabel="Project weeks"
				className="rounded-lg border-[0.5px] border-border bg-card"
			>
				<ul className="flex w-max gap-2 p-2 pb-3 text-xs tabular-nums">
					{weeks.map((week) => (
						<li key={week} className="rounded-md bg-muted px-3 py-1">
							{week}
						</li>
					))}
				</ul>
			</ScrollArea>
		</section>
	);
}
