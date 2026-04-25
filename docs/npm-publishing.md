# npm Publishing

MockMind is published as a Node.js package with a CLI entry named `mockmind`.

## Preconditions

- Node.js 20 or newer.
- npm account with publish permission for the package name.
- Clean working tree and all checks passing.

## Local Verification

```bash
npm ci
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

## Versioning

Use npm version commands so `package.json` and `package-lock.json` stay in sync:

```bash
npm version patch
# or
npm version minor
# or
npm version major
```

## Publish

```bash
npm publish --access public
```

For a prerelease:

```bash
npm version prerelease --preid beta
npm publish --tag beta --access public
```

## Post-publish Smoke Test

```bash
npx mockmind --help
npx mockmind init --output mockmind.yaml
npx mockmind start --config mockmind.yaml --port 4000
```

In another terminal:

```bash
curl http://127.0.0.1:4000/health
```
