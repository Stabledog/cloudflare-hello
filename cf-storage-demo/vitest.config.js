import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
	test: {
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.toml' },
				miniflare: {
					// Enable source maps for debugging
					compatibilityFlags: ['nodejs_compat'],
				},
			},
		},
	},
});
