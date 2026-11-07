# Input Group 设计规范

- 输入框前后需要图标、文字、按钮或快捷键提示时，用 `InputGroup.Root` 组合，不要用绝对定位把元素压在 Input 上。
- 框内的输入控件必须用 `InputGroup.Input` 或 `InputGroup.Textarea`，不要放普通 Input；组合的边框、焦点环和错误状态都按这两个控件计算。
- 输入控件同样需要标签：设 `id` 并用 `Field.Label for={id}` 关联，或提供 `aria-label`；搜索框也不例外（检查规则 `valar/input-label`）。
- 附加内容放进 `InputGroup.Addon`，用 `align`（`inline-start`、`inline-end`、`block-start`、`block-end`）定位；纯文字用 `InputGroup.Text`。
- 框内按钮用 `InputGroup.Button`，尺寸只用它的 `size`（`xs`、`sm`、`icon-xs`、`icon-sm`）；只有图标的按钮要有 `aria-label`（检查规则 `valar/button-size-via-prop`、`valar/icon-button-label`）。
- 错误状态设在输入控件上（`aria-invalid="true"`），整个组合会显示错误边框。
- `InputGroup.Button` 的 `outline`、`ghost` 样式文字用正常文字色，不会继承附加区的弱化色；不要为了“更淡”再给它加弱化色的 class，否则像不可点击。
- 框内只有输入控件本身被禁用时整组才会变淡；发送按钮等其他按钮禁用（如消息为空）不会让整组变淡。
- 框内图标按钮默认是圆形，需要胶囊用 `shape="pill"`；文字按钮保持默认圆角。上下两侧有附加栏（`block-start`、`block-end`）的多行输入框（如提示词输入框）会自动加大外框圆角，栏内按钮成为圆形或胶囊，与外框保持同心；不要自己用 class 改外框或按钮圆角。
