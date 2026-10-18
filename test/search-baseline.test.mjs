import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import { Script } from 'node:vm';

test('user-provided API Naver file is served for GET/HEAD without changing the old route', async () => {
  const name = 'naver30ca6024e3afe9efab466a8203cc4f7c.html';
  for (const method of ['GET', 'HEAD']) {
    const response = await worker.fetch(new Request(`https://api.oiyo.net/${name}`, {method}));
    assert.equal(response.status, 200);
    assert.equal(await response.text(), method === 'HEAD' ? '' : `naver-site-verification: ${name}`);
  }
  assert.equal((await worker.fetch(new Request('https://api.oiyo.net/naverfeb1d8514db116d06b5d11e882ee9d1c.html'))).status, 200);
});

test('only human canonical docs receive browser analytics and manual ads', async () => {
  const docs = await worker.fetch(new Request('https://api.oiyo.net/docs'));
  const html = await docs.text();
  assert.match(html, /<h1>OIYO API 사용 안내/);
  assert.match(html, /2768903568/);
  assert.match(html, /G-915L6V38X6/);
  assert.doesNotMatch(html, /e1043bad/);
  for (const [, javascript] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    new Script(javascript); // Parse actual rendered inline code without sending events or requesting ads.
  }
  for (const path of ['/', '/openapi.json', '/tools.json', '/health']) {
    const response = await worker.fetch(new Request(`https://api.oiyo.net${path}`));
    assert.doesNotMatch(await response.text(), /adsbygoogle|G-915L6V38X6/);
  }
  const alias = await worker.fetch(new Request('https://api.oiyo.net/', {headers:{accept:'text/html'}}));
  assert.equal(alias.headers.get('X-Robots-Tag'), 'noindex');
  assert.doesNotMatch(await alias.text(), /adsbygoogle|G-915L6V38X6/);
  const slash = await worker.fetch(new Request('https://api.oiyo.net/docs/'));
  assert.equal(slash.status, 301);
  assert.equal(slash.headers.get('location'), 'https://api.oiyo.net/docs');
});

test('agent docs describe actual limitations and implemented parameter names', async () => {
  const response = await worker.fetch(new Request('https://api.oiyo.net/llms-full.txt'));
  const text = await response.text();
  assert.match(text, /simplified model/);
  assert.match(text, /"p2"/);
  assert.match(text, /"freelance"/);
  assert.doesNotMatch(text, /Zero hallucinations|income33|fourMajor|and solar terms/);
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
  const spec = await (await worker.fetch(new Request('https://api.oiyo.net/openapi.json'))).json();
  assert.doesNotMatch(spec.paths['/v1/kr/calendar/holidays'].get.description, /and solar terms/);
});
