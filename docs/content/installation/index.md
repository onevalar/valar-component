---
title: Installation
description: Install and use the Valar Svelte source locally.
---

## Prepare the repository

```sh
git clone https://github.com/onevalar/valar-svelte.git
cd valar-svelte
nvm use
pnpm install --frozen-lockfile
pnpm dev
```

These commands assume the repository is already in sync. The source lives in the current `valar-svelte` directory. The CLI package is `@valar/svelte-cli`, which has not been published to npm.

## Install components in your project

Your project needs Svelte 5 and Tailwind CSS 4 installed. Start the local docs site and registry first (currently at `http://127.0.0.1:5186`), then run the following from the root of the Valar repository:

```sh
pnpm --filter @valar/svelte-cli start init --cwd /absolute/path/to/your-app
pnpm --filter @valar/svelte-cli start add button --cwd /absolute/path/to/your-app
```

When initializing, you can pass `--no-deps-install` to write the config first. The `@valar/svelte-cli/tailwind.css` file that the CLI injects also comes from this repository. Until the package is published, run `pnpm --filter @valar/svelte-cli pack` to build a local tarball and install that file in your project. Do not download a package of the same name from npm.

## Dependency patches and strict types

For pnpm consumers, copy the repository's dependency patches as well as the component source. The Bits UI patch fixes Avatar image source changes at runtime, so it is needed even when `skipLibCheck` is enabled. The validated combination is Svelte 5.57.2, TypeScript 5.9.3, Bits UI 2.20.0 and svelte-toolbelt 0.10.6:

1. Copy `patches/bits-ui@2.20.0.patch` and `patches/svelte-toolbelt@0.10.6.patch` from this repository into the same paths in your project.
2. Merge `overrides`, `patchedDependencies` and `packageExtensions` from `docs/e2e/fixtures/pnpm-workspace.yaml` into your project's `pnpm-workspace.yaml`. Preserve its existing configuration.
3. Declare `bits-ui: "2.20.0"`, then run `pnpm install` and your project's check/build. For strict third-party type checking, also install `@types/node` and set `strict: true`, `skipLibCheck: false` and `types: ["node"]` in your tsconfig's `compilerOptions`.

The patches fix two generated declaration complexity errors, a missing type import, and Avatar retaining `loaded` after its image source changes. They do not remove props or widen public types. `packageExtensions` supplies the undeclared `csstype` 3.1.3 type dependency. The CLI does not rewrite package-manager configuration or apply these patches automatically: `init`/`add` alone is not enough. `test:consumer` verifies the full local-tarball installation path outside the workspace, including Avatar source failure/recovery without remounting Root or Image.

Existing consumers must also update their copied patch files and run `pnpm install` to refresh the lockfile. Revalidate the patches when upgrading dependencies and remove fixes incorporated upstream; do not apply them to unverified versions. This does not certify all dependencies, versions or the entire docs toolchain with `skipLibCheck: false`.

## Registry

By default the CLI only connects to the local Valar registry. To use another URL, set the `REGISTRY_URL` environment variable or the `registry` field in your project's `components.json`. Do not point it at the upstream registry, or you will install the upstream versions.
