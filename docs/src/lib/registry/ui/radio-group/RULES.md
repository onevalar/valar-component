# Radio Group 设计规范

- 用于 2–5 个互斥选项且需要一眼看全的场景；选项更多时用 Select，可以多选用 Checkbox，切换视图或模式用 Tabs 或 Toggle Group。
- 整组要有名称：用 `aria-labelledby` 指向 `Field.Legend`，或给 `RadioGroup.Root` 设 `aria-label`。
- 每个 `RadioGroup.Item` 设 `id` 和 `value`，并用 `Field.Label for={id}` 关联可点击的标签（检查规则 `valar/input-label`）；每项放在 `<Field.Field orientation="horizontal">` 中。
- 用 `aria-describedby` 关联各选项的说明或错误。可点击卡片的名称引用标题，说明单独关联。示例或列表中重复挂载时用 `$props.id()` 生成每组的 ID 前缀。
- 用 `bind:value` 绑定选中值；需要默认选中时给出初始值，不要让必选组初始为空又不提示。
- 方向用 `orientation` 属性；方向键在选项间移动，不要给每个选项单独加 Tab 停留。保留横排且窄屏需要滚动时用悬浮 Scroll Area。
- Valar 的默认圆形单选框直径 16 px，未选为透明底和 1 px 描边，选中后用主题强调色填充与 4 px 浅色圆点。键盘以 1 px 内描边提示焦点。
- 类似 Jira 导入的连续设置选项可用 `appearance="settings"`，组内行间距 16 px。13 px 标签放在控件右侧，相隔 12 px；允许长标签换行，控件保持 16 px。
