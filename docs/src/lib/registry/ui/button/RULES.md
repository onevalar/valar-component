# Button 设计规范

- 一个区域（卡片、弹窗底部、表单）最多一个 `variant="default"` 实心主按钮；其余操作用 `outline`、`secondary` 或 `ghost`。
- 不可撤销的危险操作用 `variant="destructive"`，并先用 Alert Dialog 确认。
- 尺寸只用 `size` 属性（`xs`、`sm`、`default`、`lg`，图标按钮用 `icon`、`icon-sm` 等）；不要用 `class` 写高度、内边距或圆角（检查规则 `valar/button-size-via-prop`）。
- 只有图标的按钮必须有 `aria-label`（检查规则 `valar/icon-button-label`）。
- 紧凑工具栏的图标按钮使用 `size="icon-sm"`。按钮为 28 × 28 px，图标默认 14 × 14 px。边框色、底色、文字色和透明度使用 150 ms 过渡，系统启用减少动态效果时即时切换。
- 常规工作区操作采用 32 px 高、13 px／500 字重和 12 px 横向内边距，Issue 底部紧凑按钮采用 28 px 高、12 px／500 字重和 10 px 横向内边距。独立文字按钮在各视觉变体中默认使用胶囊形。深色工作区按钮即时切换颜色。键盘焦点使用内侧提示。
- `disabled` 用于不可用操作。异步操作设置 `loading`，以保留键盘焦点、阻止重复触发并传达忙碌状态，可搭配带 `data-icon` 的 Spinner 和状态文字。基础预览的等待与完成行为使用本地数据。
- 主按钮和危险按钮使用工作区蓝紫色和实心危险色，描边按钮使用独立表面，幽灵按钮在悬停或选中时显示底色。需要局部主题覆盖时用 `--valar-button-primary`、`--valar-button-primary-hover`、`--valar-button-outline` 等组件变量。
- 跳转用 `href`，不要在按钮里再包一个链接；表单提交用 `type="submit"`。
- 不要用原生 `<button>` 或自己写样式的元素冒充按钮（检查规则 `valar/use-button-component`）。
- 独立文字按钮需要主题圆角矩形时用 `shape="square"`。图标按钮默认使用主题圆角，传入 `shape="pill"` 时为圆形。
- 同心圆角：按钮放进有圆角的容器时，按钮圆角约等于容器圆角减去两者间距；圆形和胶囊按钮不得顶出容器的圆角。在 ButtonGroup 内圆角由按钮组决定，`shape` 不生效。
