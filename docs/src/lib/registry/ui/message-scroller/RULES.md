# Message Scroller 设计规范

- 结构为 `MessageScroller.Provider` > `MessageScroller.Root` > `MessageScroller.Viewport` > `MessageScroller.Content`，`MessageScroller.Button` 放在 Root 内；不要自己写聊天滚动逻辑。
- 它会填满父元素：放在高度受限的容器中（如 `flex h-screen flex-col` 里设 `flex-1`），否则无法滚动。
- `MessageScroller.Content` 的每个直接子元素都包一层 `MessageScroller.Item`，并设稳定的 `messageId`（消息 id，不要用数组下标）。
- 用 `scrollAnchor` 标记开启新一轮对话的行（通常是用户的消息），新一轮会停在视口上方并保留上一轮的一部分；输入提示、加载更多等行不要设为锚点。
- 不要自动滚到底部打断阅读；跳到指定消息用 `useMessageScroller` 提供的方法。
- 默认视口复用悬浮 Scroll Area。只有内容溢出时才在悬停显示滑块，出现和消失时内容宽度一致。
- 回看 Agent 记录时，末尾按钮设 `appearance="latest"`，高度 28 px，离滚动框底部 12 px。跳到末尾后隐藏，键盘触发时焦点回滚动视口。减少动态效果时直接到达末尾。
