import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

test('stdio works from an unrelated directory without account credentials', { timeout: 20000 }, async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(new URL('../dist/index.js', import.meta.url))],
    cwd: tmpdir(),
    env: { STEAM_API_KEY: '', STEAM_ID: '' },
    stderr: 'pipe',
  });
  transport.stderr?.resume();
  const client = new Client({ name: 'compatibility-test', version: '1.0.0' });
  try {
    await client.connect(transport);
    assert.ok(client.getInstructions()?.includes('read-only'));
    const { tools } = await client.listTools();
    assert.ok(tools.some(tool => tool.name === 'get_owned_games'));
    assert.ok(tools.every(tool => tool.annotations?.readOnlyHint === true));
    const result = await client.callTool({ name: 'get_owned_games', arguments: {} });
    assert.equal(result.isError, true);
  } finally { await client.close(); }
});
