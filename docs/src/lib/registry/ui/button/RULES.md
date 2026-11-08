# Button 设计规范

- 一个区域（卡片、弹窗底部、表单）最多一个 `variant="default"` 实心主按钮；其余操作用 `outline`、`secondary` 或 `ghost`。
- 不可撤销的危险操作用 `variant="destructive"`，并先用 Alert Dialog 确认。
- 尺寸只用 `size` 属性（`xs`、`sm`、`default`、`lg`，图标按钮用 `icon`、`icon-sm` 等）；不要用 `class` 写高度、内边距或圆角（检查规则 `valar/button-size-via-prop`）。
- 只有图标的按钮必须有 `aria-label`（检查规则 `valar/icon-button-label`）。
- 跳转用 `href`，不要在按钮里再包一个链接；表单提交用 `type="submit"`。
- 默认显式 `tabindex=0`，保证 macOS WebKit 在系统默认键盘偏好下可通过 Tab 和指针获得焦点；尊重调用方 `tabindex`，禁用时为 -1 且保持原生 disabled／链接禁用语义。
- 不要用原生 `<button>` 或自己写样式的元素冒充按钮（检查规则 `valar/use-button-component`）。
- 形状用 `shape` 属性：只有图标的按钮默认是圆形；需要胶囊（如输入框里的模型、思考强度选择）设 `shape="pill"`；要保持圆角方块设 `shape="square"`。文字按钮、图标加文字按钮保持默认圆角，不要全部做成胶囊。
- 同心圆角：按钮放进有圆角的容器时，按钮圆角约等于容器圆角减去两者间距；圆形和胶囊按钮不得顶出容器的圆角。在 ButtonGroup 内圆角由按钮组决定，`shape` 不生效。
