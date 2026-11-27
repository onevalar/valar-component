# Icon Picker · UI SDK Core → React / Vue / Svelte

2026-11-27 · 约定范围内试点通过（转换规范 1.0，未独立审阅）。用 UI SDK `0.1.0-beta.17`（Apache-2.0）在 React 19、Vue 3.5、Svelte 5 三个私有预览中实现新的项目图标选择器。在正式目录、registry 和共享包中不新增入口；不接入 Agent Bridge 或 WebMCP。

| 合同 | 实现与验收目标 |
| --- | --- |
| 入口与外观 | 参考 Projects 的图标字段和设置行；采用 Valar 表面、描边、密度与内侧焦点。不是 Linear 图标目录的逐项复刻。 |
| 搜索 | 按名称或关键词匹配；无结果时保留输入焦点；IME 确认不提交选择。 |
| 键盘 | 展开聚焦搜索，Down 进入首项，方向键按实际网格移动；选中与焦点分开，结果区只有一个 Tab 停点。 |
| 选择与关闭 | Enter 或指针选中，稳定的状态区域更新已选值；Escape 不改值；选择和 Escape 后返回触发器；点击外部关闭。 |

## 实现与验收

- 已有 Color Picker、Combobox 和 Command 仍可供常规选色与列表搜索使用；本试点需要可按真实二维布局导航的图标按钮。选择、模糊匹配、按键、焦点与状态语义只在 [Core primitive](../../apps/framework-comparison/src/icon-picker.ts) 实现一份。三端通过 `createParts` 渲染原生控件，样式也共用，没有三套事件处理。此次只证明维护面从三份行为实现减为一份，不推算长期工时。
- `?example=icon-picker`（Svelte 使用 `/svelte.html?example=icon-picker`）。[浏览器测试](../../apps/framework-comparison/tests/icon-picker.spec.ts) 在每端各跑浅色 720 px、深色 320 px，共 6 项。验证搜索、空结果、模拟 `isComposing`、单一 Tab 停点、二维焦点、指针及键盘提交、Escape 与归焦、状态区域。触发器为 28 px，面板边距至少 8 px，触发器与面板约 8 px；设置行左侧状态不再被面板遮住。截图另核对内侧焦点、深浅面板及选中、空态和选后状态。
- 固定 12 个预览图标、本地单选；没有通用图标源、受控值、表单序列化或远程数据合同。浏览器只覆盖 Chromium 客户端；未验证 SSR/hydration、实际读屏、系统输入法或实机触摸。若准备纳入组件库，先补这些验证并确定图标源及公共 API。
