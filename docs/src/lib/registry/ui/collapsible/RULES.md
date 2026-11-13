# Collapsible 设计规范

- 用于单块可以展开收起的内容（“显示更多”、高级选项）；多块并列的展开内容用 Accordion。
- `Collapsible.Trigger` 本身就是按钮：要用 Button 样式时通过 `{#snippet child({ props })}` 渲染 Button（检查规则 `valar/trigger-child-snippet`）；只有图标的触发按钮要有 `aria-label`。
- 触发按钮的文字或图标随状态变化（“显示更多”／“收起”），展开状态用 `bind:open` 控制。
- 属性分组用 `appearance="properties"`。触发器直接放在根组件内，使用 28 px 高的透明按钮和 16 px 的装饰箭头。标记为 `data-slot="collapsible-indicator"` 的箭头在 150 ms 内转动。内容即时展开或收起，减少动态效果时箭头也即时更新。
