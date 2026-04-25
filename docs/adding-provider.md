# Adding a Provider

Add a provider by creating a directory under `src/providers`.

```txt
src/providers/<provider>/
  index.ts
  preset.ts
  routes.ts
```

## 1. Add Provider Type

Add the provider id to `Provider` in `src/core/scenario/types.ts` and to `providerSchema` in `src/config/schema.ts`.

## 2. Add Preset

```ts
export const examplePreset = {
  provider: "example",
  displayName: "Example Provider",
  groups: ["chinese", "openai-compatible"],
  defaultModels: ["example-chat"],
  modelPatterns: [/^example-/],
  routes: [
    {
      method: "POST",
      path: "/example/v1/chat/completions",
      protocol: "openai-compatible",
      endpoint: "/example/v1/chat/completions"
    }
  ]
};
```

## 3. Add Routes

```ts
export async function registerExampleRoutes(app, context) {
  await registerProviderRoutes(app, context, exampleProvider);
}
```

## 4. Add Index

```ts
export const exampleProvider = defineProvider({
  ...examplePreset,
  registerRoutes: registerExampleRoutes
});
```

## 5. Register Provider

Add the provider export to `src/providers/registry.ts`.

## 6. Add Tests and Docs

Add integration tests for native routes, error responses, and streaming if supported.
