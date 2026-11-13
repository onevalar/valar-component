# Textarea 设计规范

- 默认表面和边缘色参考 Linear 团队设置的描述字段。通用外观使用 1 px 边框，正文和占位字沿用主题色。用 `--valar-textarea-surface` 和 `--valar-textarea-border` 可覆盖表面和边缘色。
- 团队描述等设置字段使用 `appearance="settings"`。其 120 px 固定高度、16 px 留白、13 px 字号、400 字重、10 px 圆角和 0.5 px 描边对应 Linear 设置卡片。内容超出时在框内滚动。聚焦时使用蓝紫色 1 px 内描边，错误状态保留错误边缘。
- 默认最小高度为 64 px，高度随内容增长。聚焦改变现有边框颜色。可能输入很长内容时，可加 `max-h-*` 限制高度，超出部分在框内滚动。

- 与 Input 一样需要可见标签：放在 `Field.Field` 中，用 `Field.Label for={id}` 关联 `id`（检查规则 `valar/input-label`）。
- 错误状态用 `aria-invalid="true"` 加 `Field.Error`，用 `aria-describedby` 关联错误文字（检查规则 `valar/invalid-via-aria`）。只读值可以选取和复制，禁用字段不进入 Tab 顺序。
- 有字数上限时设 `maxlength` 并提供可见计数或说明。团队描述用 255 字符限制；计数、禁用、只读和字段内错误样式采用 Valar 的通用规则。
- 一行即可的短文本用 Input；需要格式化的富文本不要用 Textarea 模拟。
- 前后要加按钮或提示文字时用 Input Group 的 `InputGroup.Textarea`。
