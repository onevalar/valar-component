# Toggle、Toggle Group、Tabs：旧原语 → UI SDK

规范 1.0 · 2026-11-27 · 部分完成，未独立审阅。来源为 Valar `6b6fe09` 的三端同名公开入口（Bits UI／Radix／Reka）；目标为仓库锁定的 UI SDK `0.1.0-beta.17` Core 和三端官方适配器，沿用原 Valar 主题与许可。基础 Linear 样式判定不变。

| 组件 | 来源合同 | SDK 兼容边界 | 状态 |
| --- | --- | --- | --- |
| Toggle | 支持双态、属性和元素引用、键盘 Enter／Space、禁用和自定义触发器，保留 `data-state=on/off` | SDK 提供双态和 `aria-pressed`，Valar 映射旧插槽、样式属性及 Vue 命名表单代理 | 已切换默认入口；定向键盘、样式与独立安装通过 |
| Toggle Group | 单选空字符串／多选数组、可重选清空；单选角色、方向键、禁用、RTL、外观与紧凑间距 | SDK 使用数组和 `aria-pressed`；显式允许方向键聚焦禁用项，且没有 `rovingFocus=false` 开关。不能直接导入替换 | 仍为旧实现；预览回归现有工具栏 |
| Tabs | 可控及默认选值、手动／自动激活、循环边界、保持面板状态、禁用、RTL 和窄屏曝光 | SDK 管理选值和键盘；映射空选择、旧 `activationMode`、循环、面板挂载规则，以及 Vue 的数字和字符串值。旧原生禁用项不加入 SDK 的方向键集合 | 已切换默认入口；定向布局、键盘与独立安装通过 |

## 验收

- `docs/e2e/tabs-alignment.spec.ts` 在浅深主题 2/2 通过。浏览器检查手动和自动激活、跳过禁用 Billing、竖直方向键、内描边以及 390 px 宽下的列表内滚动。胶囊在 900／390 px 窗口实测宽 320／292 px、高 32 px；截图已查看，无外溢或遮挡。
- `apps/framework-comparison/tests/form-primitives.spec.ts -g 'manual tabs|toggle and toolbar'` 8/8，覆盖 React/Vue 浅色 900 px 与深色 320 px、独立 Toggle、原生禁用标签、手动激活和旧工具栏独立多选。
- 三端现有 `@valar/<framework>-ui/tabs`、`/toggle` 及 Svelte registry `tabs`、`toggle` 入口保留。三个新打包的 tarball 在独立生产构建中通过：从 General 跳过锁定项，Space 激活 Notifications，Enter 切换面板内 Toggle。Vue 同时检查表单中 `mute=true`。
- 自定义节点、事件、绑定和 refs 已按原入口保留，但并未穷举自定义渲染、动态禁用、所有 SSR/hydration、实机触屏或读屏。无远程业务动作；本批未修改设计等级或发布范围。
