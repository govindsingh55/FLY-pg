import { mdsvex } from 'mdsvex';
import adapterNode from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Use Cloudflare adapter when CF_PAGES env is set (during Cloudflare build)
// This allows local development to work without wrangler installed
const isCloudflare = process.env.CF_PAGES === '1' || process.env.CLOUDFLARE === '1';

// Dynamically load Cloudflare adapter only when needed
// This avoids requiring wrangler on ARM64 Windows
let adapter;
if (isCloudflare) {
	const adapterCloudflare = (await import('@sveltejs/adapter-cloudflare')).default;
	adapter = adapterCloudflare({ routes: { include: ['/*'], exclude: ['<all>'] } });
} else {
	adapter = adapterNode();
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],
	kit: {
		adapter,
		experimental: { remoteFunctions: true }
	},
	extensions: ['.svelte', '.svx'],
	compilerOptions: {
		experimental: { async: true }
	}
};

export default config;
