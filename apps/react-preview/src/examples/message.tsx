import { Bubble, BubbleContent } from "@valar/react-ui/bubble";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "@valar/react-ui/message";

export default function MessageExample() {
	return (
		<MessageGroup>
			<Message align="end">
				<MessageContent><MessageHeader>You</MessageHeader><Bubble variant="muted" align="end"><BubbleContent>Can you summarize the release?</BubbleContent></Bubble><MessageFooter><time dateTime="10:42">10:42</time></MessageFooter></MessageContent>
			</Message>
			<Message>
				<MessageAvatar aria-hidden="true">✦</MessageAvatar>
				<MessageContent><MessageHeader>Assistant</MessageHeader><Bubble variant="ghost"><BubbleContent>Two fixes passed validation. The release still needs review.</BubbleContent></Bubble><MessageFooter><time dateTime="10:43">10:43</time></MessageFooter></MessageContent>
			</Message>
		</MessageGroup>
	);
}
