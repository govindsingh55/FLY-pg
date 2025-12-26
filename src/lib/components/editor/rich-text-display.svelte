<script lang="ts">
	import { generateHTML } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import HardBreak from '@tiptap/extension-hard-break';
	import { Table } from '@tiptap/extension-table';
	import TableRow from '@tiptap/extension-table-row';
	import TableHeader from '@tiptap/extension-table-header';
	import TableCell from '@tiptap/extension-table-cell';

	let {
		content,
		fallback = 'No description available.'
	}: {
		content: string | null;
		fallback?: string;
	} = $props();

	// Generate HTML from TipTap JSON
	const htmlContent = $derived.by(() => {
		if (!content) return null;

		try {
			// Try to parse as JSON
			const json = JSON.parse(content);

			// Generate HTML from JSON using TipTap
			const html = generateHTML(json, [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3, 4, 5, 6]
					},
					hardBreak: false // Use dedicated extension
				}),
				HardBreak,
				Table.configure({
					resizable: true
				}),
				TableRow,
				TableHeader,
				TableCell,
				Link.configure({
					HTMLAttributes: {
						class: 'text-primary hover:underline',
						target: '_blank',
						rel: 'noopener noreferrer'
					}
				})
			]);

			return html;
		} catch (error) {
			// If not valid JSON, treat as plain text (backward compatibility)
			return `<p>${escapeHtml(content)}</p>`;
		}
	});

	// Escape HTML to prevent XSS
	function escapeHtml(unsafe: string): string {
		return unsafe
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}
</script>

<svelte:boundary>
	{#if htmlContent}
		<div
			class="prose prose-sm max-w-none dark:prose-invert
				[&_h1]:text-foreground [&_h1]:font-bold [&_h1]:text-3xl [&_h1]:mt-8 [&_h1]:mb-4
				[&_h2]:text-foreground [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:mt-6 [&_h2]:mb-4
				[&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:text-xl [&_h3]:mt-4 [&_h3]:mb-3
				[&_h4]:text-foreground [&_h4]:font-semibold [&_h4]:text-lg [&_h4]:mt-4 [&_h4]:mb-2
				[&_h5]:text-foreground [&_h5]:font-medium [&_h5]:text-base [&_h5]:mt-3 [&_h5]:mb-2
				[&_h6]:text-foreground [&_h6]:font-medium [&_h6]:text-sm [&_h6]:mt-3 [&_h6]:mb-2
				[&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-4
				[&_strong]:text-foreground [&_strong]:font-semibold
				[&_em]:italic
				[&_ul]:list-disc [&_ul]:list-inside [&_ul]:mb-4 [&_ul]:space-y-2
				[&_ol]:list-decimal [&_ol]:list-inside [&_ol]:mb-4 [&_ol]:space-y-2
				[&_li]:text-muted-foreground
				[&_a]:text-primary [&_a]:hover:underline
				[&_table]:w-full [&_table]:border-collapse [&_table]:my-4
				[&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold
				[&_td]:border [&_td]:border-border [&_td]:px-4 [&_td]:py-2 [&_td]:text-muted-foreground
				[&_tr]:border-b [&_tr]:border-border"
		>
			{@html htmlContent}
		</div>
	{:else}
		<p class="text-muted-foreground italic">{fallback}</p>
	{/if}

	{#snippet failed(error: any, reset)}
		<div class="text-muted-foreground">
			{#if content && typeof content === 'string'}
				<!-- Fallback: display as plain text -->
				<p>{content}</p>
			{:else}
				<p class="italic">{fallback}</p>
			{/if}
		</div>
	{/snippet}
</svelte:boundary>
