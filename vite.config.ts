import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	optimizeDeps: {
		include: [
			'@tiptap/core',
			'@tiptap/starter-kit',
			'@tiptap/extension-character-count',
			'@tiptap/extension-hard-break',
			'@tiptap/extension-link',
			'@tiptap/extension-placeholder',
			'@tiptap/extension-table',
			'@tiptap/extension-table-cell',
			'@tiptap/extension-table-header',
			'@tiptap/extension-table-row'
		]
	},
	ssr: {
		noExternal: ['ms']
	}
});
