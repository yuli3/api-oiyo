import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('branch previews have explicit isolated settings without changing production routing', () => {
  const config = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  assert.deepEqual(config.previews, {});
  assert.equal(config.preview_urls, true);
  assert.equal(config.workers_dev, false);
  assert.deepEqual(config.routes, [{ pattern: 'api.oiyo.net', custom_domain: true }]);
});
