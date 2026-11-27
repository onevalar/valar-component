# Radio Group 设计规范

- 用于 2–5 个互斥选项且需要一眼看全的场景；选项更多时用 Select，可以多选用 Checkbox，切换视图或模式用 Tabs 或 Toggle Group。
- 整组要有名称：放在 `Field.Set` 中并用 `Field.Legend` 写组名，或给 `RadioGroup.Root` 设 `aria-label`。
- 每个 `RadioGroup.Item` 设 `id` 和 `value`，并用 `Field.Label for={id}` 关联可点击的标签（检查规则 `valar/input-label`）；每项放在 `<Field.Field orientation="horizontal">` 中。
- React 用 `defaultValue` 或 `value`／`onValueChange`；Vue 用 `default-value` 或 `v-model`；Svelte 用 `defaultValue` 或 `bind:value`。选项值使用唯一的非空字符串；Svelte 用 `""` 表示未选中。
- `name` 必须非空才参与原生提交和 `required` 校验。未选中、选中项被禁用或整组被禁用，不产生表单条目；不再用文本代理提交空字符串。默认值可作为表单重置目标；受控值不设默认值时由宿主处理重置。`form` 可关联外部表单。
- 用组件的值绑定或回调订阅选择变化，不要依赖表单代理触发原生 `input`／`change`。如果必填项必须提交可用值，禁用当前选中项时清空选中值：原生校验可能通过，但不会提交该选项。
- 方向用 `orientation` 属性；方向键沿对应轴移动，跳过禁用项，横向遵从元素或祖先的 `dir`。不要给每个选项单独加 Tab 停留。Space 可选择，Enter 不会提交表单；只读组可以移焦但不更改选中项。UI SDK 不提供 Home／End 跳转。
- 用原生 `<label for>` 关联默认按钮；标签包裹整张卡片时，用 `aria-labelledby` 关联标题、`aria-describedby` 关联说明。自定义非按钮选项不要依赖原生标签激活。旧 Vue `asChild`、可取消的 `select` 事件及 Vue／Svelte `autocomplete` 文本代理接口不再提供。依赖 React／Vue 旧方向 Provider 的用法改为设置 `dir`。
