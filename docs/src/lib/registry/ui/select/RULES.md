# Select 设计规范

- 用于从一组固定选项中选值：2–5 个且需要一眼看全的选项用 Radio Group，需要搜索大量选项用 Popover + Command，触发操作而不是选值用 Dropdown Menu；需要原生行为（移动端系统选择器）时用 Native Select。
- `Select.Root` 必须设 `type="single"` 或 `type="multiple"`；值是字符串（多选为字符串数组），用 `bind:value` 绑定。
- 把选项数组传给 `Select.Root` 的 `items`，触发器里用 `<Select.Value placeholder="…" />` 显示选中项的文字；表单提交时设 `name`。
- `Select.Trigger` 设 `id` 并用 `Field.Label for={id}` 关联（检查规则 `valar/input-label`）。错误用 `aria-invalid="true"`，说明用 `aria-describedby` 关联。焦点提示绘制在边界内。
- 尺寸用 `Select.Trigger` 的 `size` 属性（`sm`、`default`、`settings`），宽度用 `w-*` 档位；不要用 `class` 改高度或圆角。
- 常规和设置触发器同为 30 px 高，两者共用尺寸档位。小尺寸高 28 px，默认主题圆角为 8 px。浮层圆角 12 px，选项最小高度 32 px。设置区有独立主题时，用 `appearance="settings"` 的内容，并让 Portal 挂在该主题容器内。
- 选项多时用 `Select.Group` 与 `Select.GroupHeading` 分组，组间用装饰性的 `Select.Separator`。每个 `Select.Item` 同时设 `value` 和 `label`。长选项可在视觉上截断，保留完整可访问名称。
- 方向键移动高亮，Enter 确认，Escape 关闭并归焦。禁用选项会被跳过，单个禁用选项和整项禁用分别设置。多选中的当前选值以勾选标记，多选、禁用和错误样式采用 Valar 规则。
