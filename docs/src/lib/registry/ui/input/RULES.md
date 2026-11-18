# Input 设计规范

- 每个 Input 都要有可见标签：放在 `Field.Field` 中，用 `Field.Label for={id}` 关联 Input 的 `id`；`placeholder` 只写示例，不能代替标签（检查规则 `valar/input-label`）。
- 默认高度 32 px，圆角使用 `md` 档（默认主题为 8 px），水平留白 12 px。Linear Profile 实测浅色底白色、边框 `lch(86.5% 0 282)`，深色底 `lch(9.232% .85 272)`、边框 `lch(30.833% 1.93 272)`。浅深主题的声明描边均为 0.5 px。桌面正文为 13 px，窄屏为 16 px。
- 点击或用 Tab 聚焦时，沿边框内侧绘制 1 px 蓝紫描边。边框用同主题的聚焦色阶，焦点即时出现。用 `readonly` 允许聚焦、选择、复制及表单提交，用 `disabled` 禁止编辑并跳过 Tab 和表单提交。
- 使用原生 `required`、`maxlength` 和类型约束。错误状态用 `aria-invalid="true"` 加 `Field.Error`，用 `aria-describedby` 关联错误文字。普通错误有危险色边框，焦点进入时以内侧描边区分。值修正后移除错误状态和对应的引用（检查规则 `valar/invalid-via-aria`）。
- Linear 新建团队用 32 px 高的标识符输入框搭配左侧标题和说明。上限 7 字符、转为大写并更新示例前缀是该表单的规则，由调用方实现。
- 按内容设置 `type`、`inputmode` 和 `autocomplete`（如 `type="email"`、`autocomplete="email"`），移动端才会弹出正确的键盘并允许自动填充。
- 有范围、步长或需要按地区格式化的数字用 Number Field，不要用 `type="number"`；多行文本用 Textarea；从固定选项中选择用 Select。
- 选择文件用 `<Input type="file" bind:files />`，不要自己写原生 `<input>`（检查规则 `valar/use-form-component`）。
- 高度、圆角、内边距跟随组件样式和组件参数（与 Button 同一套尺寸、圆角档位）；不要用 `class` 改 `rounded-*`、`px-*`。必须与同一行的小号按钮对齐时，只用与该按钮相同的高度档位类，不写像素值。
- 前后要加图标、文字或按钮时用 Input Group，不要用绝对定位把图标压在 Input 上。
