---
title: Installation
description: 安装和使用 Valar Svelte 的本地源码。
---

## 准备仓库

```sh
git clone https://github.com/onevalar/valar-svelte.git
cd valar-svelte
nvm use
pnpm install --frozen-lockfile
pnpm dev
```

这些命令适用于仓库已同步后的环境。本地源码在当前 valar-svelte 目录中。CLI 包名为 `@valar/svelte-cli`，尚未发布到 npm。

## 在目标项目安装组件

目标项目需已安装 Svelte 5 和 Tailwind CSS 4。先启动本地文档站与 registry（当前地址 `http://127.0.0.1:5186`），在 Valar 仓库根目录运行：

```sh
pnpm --filter @valar/svelte-cli start init --cwd /absolute/path/to/your-app
pnpm --filter @valar/svelte-cli start add button --cwd /absolute/path/to/your-app
```

初始化时可以使用 `--no-deps-install` 先写入配置。CLI 注入的 `@valar/svelte-cli/tailwind.css` 也由本仓库提供；在包正式发布前，先运行 `pnpm --filter @valar/svelte-cli pack` 生成本地 tarball，并在目标项目安装该文件，不能从 npm 下载同名包。

## 依赖补丁与严格类型检查

pnpm 消费者除了组件源码，还需显式带入仓库的依赖补丁。Bits UI 补丁修复 Avatar 运行时换源，因此即使启用 `skipLibCheck` 也需要它。当前验收组合为 Svelte 5.57.2、TypeScript 5.9.3、Bits UI 2.20.0 和 svelte-toolbelt 0.10.6：

1. 将仓库 `patches/bits-ui@2.20.0.patch` 和 `patches/svelte-toolbelt@0.10.6.patch` 复制到目标项目的同名路径。
2. 将 `docs/e2e/fixtures/pnpm-workspace.yaml` 中的 `overrides`、`patchedDependencies` 和 `packageExtensions` 合并到目标项目的 `pnpm-workspace.yaml`。不要覆盖项目已有的其他配置。
3. 声明 `bits-ui: "2.20.0"` 依赖，执行 `pnpm install` 和项目的 check／build。需要严格检查第三方类型时，另安装 `@types/node`，并在 tsconfig 的 `compilerOptions` 中设置 `strict: true`、`skipLibCheck: false`、`types: ["node"]`。

补丁修复两处生成声明的类型复杂度问题、一个遗漏的类型导入，以及 Avatar 换源后仍保留 `loaded` 的运行时问题；不移除属性或放宽公共类型。`packageExtensions` 补齐声明引用但原包没有声明的 csstype 3.1.3。CLI 不会自动改写包管理器配置或应用这些补丁，仅执行 `init`／`add` 不足以带入修复。`test:consumer` 从工作区外通过本地 tarball 验证完整安装路径，包括不重建 Root／Image 的 Avatar 图片失败与恢复。

已有消费者也需更新复制的补丁文件，再执行 `pnpm install` 更新锁文件。升级第三方包后应重新验证并移除已由上游修复的补丁，不应把补丁套用到未验证的版本。这里不代表所有第三方依赖、所有版本和整个文档工具链都已通过 `skipLibCheck: false`。

## 注册表

默认只连接本地 Valar registry。其他地址可通过 `REGISTRY_URL` 环境变量设置，或在目标项目 components.json 的 registry 字段配置。请勿填写上游 registry，否则会安装上游版本。
