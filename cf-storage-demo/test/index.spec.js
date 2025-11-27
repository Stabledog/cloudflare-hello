import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src';

describe('Hello World worker', () => {
	it('Hello World!', async () => {
		const request = new Request('http://example.com/kv');
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);
		expect(await response.text()).toBe("KV says: world");
	});

	it('responds with Hello World! (unit style)', async () => {
		const response = await SELF.fetch('http://example.com/kv');
		expect(await response.text()).toBe("KV says: world");
	});
});
