# Bubble 设计规范

- 用于聊天中带框的消息内容；一条消息的整行布局（头像、对齐、发送者）交给 Message，左右对齐写在 `Message.Root` 的 `align` 上，而不是 Bubble。
- 通用样式使用 `variant`，助手的长文本可用 `ghost` 占满整行。Agent 用户和助手消息使用对应的 `appearance`，同一气泡只选择一种外观。用文字说明 `destructive` 气泡的错误原因。
- Agent 用户气泡用 `Bubble.Actions` 放置复制和编辑。操作使用带 `aria-label` 的 Button，并设置 `data-slot="bubble-action"` 取得 24 px 尺寸；编辑结束应把焦点交回触发编辑的按钮。
- Agent 正文内的原生链接沿用 15 px／24 px 行高，浅深主题分别使用对应强调色。键盘焦点用下划线，长链接可在窄处换行。
- 同一发送者连续的气泡放进 `Bubble.Group`。
- Agent 连续提问使用 `Bubble.Group appearance="agent"`，相邻气泡表面间距 16 px。
- 表情回应用 `Bubble.Reactions`（`side`、`align` 定位），只展示时给它设 `role="img"` 和概括全部回应的 `aria-label`；可点击时改用带 `aria-label` 的图标按钮。回应会压在气泡边缘，行间要留出间距。
- 评论回应使用 `Bubble.Reactions appearance="comment"` 放在正文下方 8 px。单项使用 28 px 高的 `Bubble.Reaction`，用 `pressed` 和计数表达当前用户的选择，键盘焦点使用内描边。
- 整个气泡需要可点击时，用 `Bubble.Content` 的 `child` snippet 渲染为 Button 或链接，不要给 div 加 `onclick`。
