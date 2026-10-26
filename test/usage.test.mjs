import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.mjs";
import { clientKind, usagePoint } from "../src/modules/usage.mjs";

test("usage point keeps the route, never the query string", () => {
  const request = new Request("https://api.oiyo.net/v1/labor/kr/net-salary?annualSalary=52000000", { headers: { "user-agent": "python-requests/2.32" } });
  const point = usagePoint(request, new Response("{}", { status: 200 }), 12.4);
  assert.deepEqual(point.indexes, ["/v1/labor/kr/net-salary"]);
  assert.deepEqual(point.blobs, ["/v1/labor/kr/net-salary", "GET", "rest", "2xx", "XX", "client"]);
  assert.deepEqual(point.doubles, [200, 12]);
  assert.ok(!JSON.stringify(point).includes("52000000"));
});

test("unknown paths collapse to one bucket", () => {
  const point = usagePoint(new Request("https://api.oiyo.net/wp-login.php"), new Response("", { status: 404 }), 1);
  assert.equal(point.indexes[0], "(not-found)");
});

test("client kinds", () => {
  assert.equal(clientKind("Googlebot/2.1"), "bot");
  assert.equal(clientKind("Mozilla/5.0 (Macintosh)"), "browser");
  assert.equal(clientKind("curl/8"), "client");
  assert.equal(clientKind(null), "none");
});

test("worker writes one point per request and tolerates a missing or broken binding", async () => {
  const points = [];
  const env = { API_USAGE: { writeDataPoint: (p) => points.push(p) } };
  const response = await worker.fetch(new Request("https://api.oiyo.net/health"), env);
  assert.equal(response.status, 200);
  assert.equal(points.length, 1);
  assert.equal(points[0].blobs[2], "rest");
  assert.equal((await worker.fetch(new Request("https://api.oiyo.net/health"))).status, 200);
  const broken = { API_USAGE: { writeDataPoint: () => { throw new Error("quota"); } } };
  assert.equal((await worker.fetch(new Request("https://api.oiyo.net/health"), broken)).status, 200);
});
