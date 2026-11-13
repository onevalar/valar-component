# Input Group 设计规范

- 输入框前后需要图标、文字、按钮或快捷键提示时，用 `InputGroup.Root` 组合，不要用绝对定位把元素压在 Input 上。
- 框内用 `InputGroup.Input` 或 `InputGroup.Textarea`，由组合统一绘制边框、焦点和错误反馈。使用自定义输入时，把 `data-slot="input-group-control"` 设置在实际可聚焦的控件上。
- 输入控件同样需要标签：设 `id` 并用 `Field.Label for={id}` 关联，或提供 `aria-label`；搜索框也不例外（检查规则 `valar/input-label`）。
- 附加内容放进 `InputGroup.Addon`，用 `align`（`inline-start`、`inline-end`、`block-start`、`block-end`）定位，纯文字用 `InputGroup.Text`。点击被动内容会将焦点移到组内输入或多行输入，按钮、链接和标签继续执行各自的动作。
- 设置侧栏的单行搜索使用 `appearance="settings-search"`。外壳高 28 px、圆角 8 px，前导图标 16 px，清除按钮 22 px，内含 12 px 图标。保留末尾空间，让清除按钮的出现和隐藏保持文字对齐。清除和 Escape 重置查询并把焦点留在搜索框，聚焦提示画在组合边界内。
- 新建团队的「图标与名称」使用 `appearance="settings-name"`。组高 32 px、圆角 8 px，起始侧是 32 px 宽的图标按钮和细分隔线。字段与图标按钮各自响应键盘焦点，焦点提示分别留在各自边界内。
- 框内按钮用 `InputGroup.Button`，尺寸只用它的 `size`（`xs`、`sm`、`icon-xs`、`icon-sm`）；只有图标的按钮要有 `aria-label`（检查规则 `valar/button-size-via-prop`、`valar/icon-button-label`）。
- 错误状态设在输入控件上（`aria-invalid="true"`），组合显示错误边框，并用 `aria-describedby` 关联错误说明。禁用输入控件与禁用附加操作是两种状态，后者仍允许编辑。
- 异步检查期间在组合上设置 `aria-busy`，在附加区显示加载图标，使用状态文字说明结果。多行输入的底部附加区可以放字数说明和提交动作。
- 普通单行组合与 Input 使用同档的 32 px 高度和 8 px 圆角。组合内的文字按钮和图标按钮分别按 xs／sm 取 24／28 px 高。需要胶囊按钮时显式设置 `shape="pill"`。
