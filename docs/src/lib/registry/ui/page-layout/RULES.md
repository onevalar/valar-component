# Page Layout 设计规范

- 用于固化页面级排版结构，避免在业务页面中手写参差不齐的页头、工具栏、区块留白和设置行。
- 宽度档位：`PageLayout.Root` 默认 `width="full"`（列表、表格、看板、工作台）；设置页、独立表单、详情阅读和分步向导设为 `width="narrow"`（收窄居中）。
- 页头结构：`PageLayout.Header` 保持单行紧凑，左侧放 `PageLayout.Title`（默认中性标题，不加冗余副标题），右侧放 `PageLayout.Actions` 且最多只放 1 个主色强调按钮（`variant="default"`）。
- 分组克制：`PageLayout.Section` 默认 `surface="plain"`，优先靠留白间距表达分组；只有明确需要成组承载（如系统设置分组）时才设为 `surface="card"`，严禁在 `surface="card"` 内部再嵌套 `Card` 或另一层卡片区块。
- 属性与设置行：`PageLayout.PropertyList` + `PageLayout.PropertyRow` 支持 `layout="settings"`（左标题 + 右控件，配合 `surface="card"` 与 0.5px 细分隔线）和 `layout="detail"`（左属性名 + 右等宽数值或控件，默认启用 `tabular-nums`）。`description` 仅在用户不看就会填错或有不可逆影响时填写。
