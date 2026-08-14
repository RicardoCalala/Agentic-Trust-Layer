import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Trust Lab experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Trust Lab — Agentic Trust Layer<\/title>/i);
  assert.match(html, /See how accountable AI decisions should work\./);
  assert.match(html, /synthetic data only/i);
  assert.match(html, /MCP GATEWAY \/ FICTIONAL TOOLS/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site|codex-preview/i);
});

test("server-renders the Trust Operations Console", async () => {
  const response = await render("/console");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Trust Operations Console/);
  assert.match(html, /Generate fictional mission cycle/);
  assert.match(html, /Fictional national demo/);
  assert.match(html, /This is a simulated interface/i);
});
