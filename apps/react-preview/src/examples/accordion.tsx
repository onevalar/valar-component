import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@valar/react-ui/accordion";
import { Badge } from "@valar/react-ui/badge";

export default function AccordionExample() {
	return (
		<section aria-label="Accordion examples" className="w-full max-w-md p-6">
			<Accordion type="single" defaultValue="access" collapsible>
				<AccordionItem value="access">
					<AccordionTrigger level={2}>Workspace access</AccordionTrigger>
					<AccordionContent className="flex flex-wrap items-center gap-2">
						<span>Only invited members can join this workspace.</span>
						<Badge variant="outline">Invite only</Badge>
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="notifications">
					<AccordionTrigger level={2}>Notifications</AccordionTrigger>
					<AccordionContent>
						Get notified when someone assigns you an issue or mentions you in a comment.
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="billing" disabled>
					<AccordionTrigger level={2}>Billing</AccordionTrigger>
					<AccordionContent>Only workspace owners can manage billing.</AccordionContent>
				</AccordionItem>
			</Accordion>
		</section>
	);
}
