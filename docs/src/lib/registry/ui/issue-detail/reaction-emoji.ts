const emoji = [
	["👍", "赞", "Thumbs up", "+1 thumbsup"],
	["👎", "踩", "Thumbs down", "-1 thumbsdown"],
	["❤️", "爱心", "Heart", "love"],
	["🎉", "庆祝", "Party popper", "tada celebrate"],
	["🙌", "举手庆祝", "Raised hands", "hooray"],
	["🚀", "火箭", "Rocket", "launch ship"],
	["👀", "关注", "Eyes", "look watching"],
	["✅", "完成", "Check mark", "done check"],
	["🔥", "火焰", "Fire", "lit"],
	["🙏", "感谢", "Folded hands", "thanks pray"],
	["👏", "鼓掌", "Clapping hands", "clap"],
	["💯", "一百分", "Hundred points", "100 perfect"],
	["💡", "点子", "Light bulb", "idea"],
	["✨", "闪光", "Sparkles", "magic"],
	["🎯", "命中", "Bullseye", "target"],
	["💪", "加油", "Flexed biceps", "strong muscle"],
	["😀", "开心", "Grinning face", "grin"],
	["😄", "大笑", "Smiling face", "smile"],
	["😂", "笑哭", "Face with tears of joy", "joy laugh"],
	["🙂", "微笑", "Slightly smiling face", "smile"],
	["😉", "眨眼", "Winking face", "wink"],
	["🤔", "思考", "Thinking face", "think"],
	["😅", "苦笑", "Grinning face with sweat", "sweat"],
	["😮", "惊讶", "Face with open mouth", "surprise"],
	["😎", "墨镜", "Smiling face with sunglasses", "cool"],
	["😍", "喜欢", "Smiling face with heart eyes", "heart eyes"],
	["👋", "挥手", "Waving hand", "wave hello"],
	["👌", "好的", "OK hand", "okay"],
	["🤝", "握手", "Handshake", "agreement"],
	["💬", "讨论", "Speech balloon", "comment"],
	["⚠️", "警告", "Warning", "caution"],
	["❌", "叉号", "Cross mark", "no"],
] as const;

export function emojiName(value: string, chinese: boolean) {
	const entry = emoji.find(([glyph]) => glyph === value);
	return entry ? entry[chinese ? 1 : 2] : value;
}

export function emojiMatches(query: string) {
	const search = query.trim().toLowerCase().replaceAll("_", " ");
	const matches = emoji.filter((entry) =>
		entry.some((value) => value.toLowerCase().includes(search))
	);
	if (matches.length) return matches.map(([glyph]) => glyph);
	const graphemes = new Intl.Segmenter().segment(search);
	const isEmoji =
		/\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F|[0-9#*]\uFE0F?\u20E3/u.test(search) &&
		[...graphemes].length === 1;
	return isEmoji ? [search] : [];
}
