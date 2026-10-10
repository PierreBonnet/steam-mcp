# steam-mcp

Community derivative of [matheusslg/steam-mcp](https://github.com/matheusslg/steam-mcp), prepared for public source distribution. The upstream MIT license and required attribution are retained. This repository starts with a fresh Git history.

## Install and run

Requires Node.js 20 or later.

```sh
npm ci
npm run build
npm test
```

Set `STEAM_API_KEY` in your MCP client environment. Optionally set `STEAM_ID` to your own Steam ID. Configure the client command as `node` with the absolute path to `dist/index.js` as its argument. Keep these values in your local client configuration.

## Privacy

No account configuration, OAuth sessions, personal exports, or local Git history are distributed. Examples and tests use fixtures. Never commit your local credentials or session files. Runtime tools can return information from the account you connect; review outputs before sharing them.

## Changes in this derivative

Network errors omit URLs and untrusted HTTP status text. The clean/build command works on Windows, macOS and Linux. Dependencies were refreshed and regression tests cover credential-safe errors.

Only GitHub source distribution is configured; this derivative is not published to npm or PyPI.
