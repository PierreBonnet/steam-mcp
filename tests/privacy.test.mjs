import assert from 'node:assert/strict';
import { test } from 'node:test';
import { storeApiRequest, SteamApiError } from '../dist/api/client.js';

test('network errors do not expose request credentials', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('https://example.test/?key=private-fixture'); };
  try {
    await assert.rejects(storeApiRequest('api/test'), error => {
      assert.ok(error instanceof SteamApiError);
      assert.ok(!String(error).includes('private-fixture'));
      assert.equal(error.cause, undefined);
      return true;
    });
  } finally { globalThis.fetch = original; }
});

test('HTTP errors do not expose server-provided status text', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response('', { status: 403, statusText: 'private-fixture' });
  try {
    await assert.rejects(storeApiRequest('api/test'), error => {
      assert.equal(error.statusCode, 403);
      assert.ok(!String(error).includes('private-fixture'));
      return true;
    });
  } finally { globalThis.fetch = original; }
});
