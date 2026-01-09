<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { Editor } from '@tiptap/core';
	import {
		Bold,
		Italic,
		LinkIcon,
		List,
		ListOrdered,
		Pilcrow,
		Redo,
		Table as TableIcon,
		Undo,
		WrapText
	} from '@lucide/svelte';

	let {
		value = $bindable(''),
		onchange,
		placeholder = 'Enter description...',
		maxLength
	}: {
		value?: string;
		onchange?: (content: string) => void;
		placeholder?: string;
		maxLength?: number;
	} = $props();

	let editorElement = $state<HTMLDivElement | undefined>(undefined);
	let isLoading = $state(true);
	// Use object pattern for Svelte 5 reactivity (official TipTap pattern)
	let editorState = $state<{ editor: Editor | null }>({ editor: null });

	// Initialize editor with $effect
	$effect(() => {
		// Skip if element not ready yet
		if (!editorElement) {
			isLoading = true;
			return;
		}

		// Wait for next tick to ensure element is fully mounted
		const timeoutId = setTimeout(async () => {
			try {
				const [
					{ Editor },
					{ default: StarterKit },
					{ default: CharacterCount },
					{ default: HardBreak },
					{ default: Link },
					{ default: Placeholder },
					{ Table },
					{ default: TableCell },
					{ default: TableHeader },
					{ default: TableRow }
				] = await Promise.all([
					import('@tiptap/core'),
					import('@tiptap/starter-kit'),
					import('@tiptap/extension-character-count'),
					import('@tiptap/extension-hard-break'),
					import('@tiptap/extension-link'),
					import('@tiptap/extension-placeholder'),
					import('@tiptap/extension-table'),
					import('@tiptap/extension-table-cell'),
					import('@tiptap/extension-table-header'),
					import('@tiptap/extension-table-row')
				]);

				// Initialize TipTap editor
				editorState.editor = new Editor({
					element: editorElement,
					extensions: [
						StarterKit.configure({
							heading: {
								levels: [1, 2, 3, 4, 5, 6]
							},
							hardBreak: false, // We'll use the dedicated extension
							link: false // Exclude link from StarterKit, configure separately below
						}),
						HardBreak,
						Table.configure({
							resizable: true
						}),
						TableRow,
						TableHeader,
						TableCell,
						Link.configure({
							openOnClick: false,
							HTMLAttributes: {
								class: 'text-primary underline'
							}
						}),
						Placeholder.configure({
							placeholder
						}),
						...(maxLength ? [CharacterCount.configure({ limit: maxLength })] : [CharacterCount])
					],
					content: value ? tryParseJSON(value) : '',
					editorProps: {
						attributes: {
							class:
								'prose prose-sm max-w-none focus:outline-none min-h-[150px] px-3 py-2 text-sm text-foreground [&_*]:text-foreground'
						}
					},
					onUpdate: ({ editor }) => {
						const json = JSON.stringify(editor.getJSON());
						value = json;
						onchange?.(json);
					},
					onTransaction: ({ editor }) => {
						// Replace entire state object to force re-render (official TipTap pattern)
						editorState = { editor };
					}
				});

				// Editor initialized successfully
				isLoading = false;
			} catch (error) {
				console.error('Failed to initialize TipTap editor:', error);
				isLoading = false;
			}
		}, 50); // Slightly longer delay to ensure DOM is ready

		// Cleanup function - runs when effect is destroyed
		return () => {
			clearTimeout(timeoutId);
			if (editorState.editor && !editorState.editor.isDestroyed) {
				editorState.editor.destroy();
			}
			editorState = { editor: null };
		};
	});

	// Try to parse JSON, fallback to plain text
	function tryParseJSON(content: string) {
		try {
			return JSON.parse(content);
		} catch {
			// If not valid JSON, wrap plain text in paragraph
			return {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [{ type: 'text', text: content }]
					}
				]
			};
		}
	}

	function toggleBold() {
		editorState.editor?.chain().focus().toggleBold().run();
	}

	function toggleItalic() {
		editorState.editor?.chain().focus().toggleItalic().run();
	}

	function setParagraph() {
		editorState.editor?.chain().focus().setParagraph().run();
	}

	function toggleHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
		editorState.editor?.chain().focus().toggleHeading({ level }).run();
	}

	function insertHardBreak() {
		editorState.editor?.chain().focus().setHardBreak().run();
	}

	function toggleBulletList() {
		editorState.editor?.chain().focus().toggleBulletList().run();
	}

	function toggleOrderedList() {
		editorState.editor?.chain().focus().toggleOrderedList().run();
	}

	function insertTable() {
		editorState.editor
			?.chain()
			.focus()
			.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
			.run();
	}

	function addColumnBefore() {
		editorState.editor?.chain().focus().addColumnBefore().run();
	}

	function addColumnAfter() {
		editorState.editor?.chain().focus().addColumnAfter().run();
	}

	function deleteColumn() {
		editorState.editor?.chain().focus().deleteColumn().run();
	}

	function addRowBefore() {
		editorState.editor?.chain().focus().addRowBefore().run();
	}

	function addRowAfter() {
		editorState.editor?.chain().focus().addRowAfter().run();
	}

	function deleteRow() {
		editorState.editor?.chain().focus().deleteRow().run();
	}

	function deleteTable() {
		editorState.editor?.chain().focus().deleteTable().run();
	}

	function addLink() {
		const url = prompt('Enter URL:');
		if (url) {
			editorState.editor?.chain().focus().setLink({ href: url }).run();
		}
	}

	function undo() {
		editorState.editor?.chain().focus().undo().run();
	}

	function redo() {
		editorState.editor?.chain().focus().redo().run();
	}

	// Computed character count
	const characterCount = $derived.by(() => {
		if (!editorState.editor) return value.length;
		const storage = (editorState.editor as any).storage?.characterCount;
		return storage?.characters?.() ?? value.length;
	});
</script>

<svelte:boundary>
	<div class="space-y-2">
		<!-- Loading State -->
		{#if isLoading}
			<div
				class="h-10 w-full rounded-md border border-input bg-muted animate-pulse flex items-center px-3 text-sm text-muted-foreground"
			>
				Loading editor...
			</div>
		{/if}

		<!-- Toolbar - shown when editor is ready -->
		{#if editorState.editor && !isLoading}
			<div
				class="flex flex-wrap gap-1 p-2 border rounded-md bg-muted/30"
				role="toolbar"
				aria-label="Text formatting"
			>
				<!-- Text formatting -->
				<Button
					type="button"
					variant="ghost"
					size="sm"
					class={`h-8 w-8 p-0 ${editorState.editor?.isActive('bold') ? 'bg-primary/10' : ''}`}
					onclick={toggleBold}
					aria-label="Bold"
				>
					<Bold class="h-4 w-4" />
				</Button>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					class={`h-8 w-8 p-0 ${editorState.editor?.isActive('italic') ? 'bg-primary/10' : ''}`}
					onclick={toggleItalic}
					aria-label="Italic"
				>
					<Italic class="h-4 w-4" />
				</Button>

				<div class="w-px h-8 bg-border mx-1"></div>

				<!-- Paragraph -->
				<Button
					type="button"
					variant="ghost"
					size="sm"
					class={`h-8 w-8 p-0 ${editorState.editor?.isActive('paragraph') ? 'bg-primary/10' : ''}`}
					onclick={setParagraph}
					aria-label="Paragraph"
				>
					<Pilcrow class="h-4 w-4" />
				</Button>

				<!-- Headings -->
				<Button
					type="button"
					variant="ghost"
					size="sm"
					class={`h-8 px-2 text-xs font-bold ${editorState.editor?.isActive('heading', { level: 1 }) ? 'bg-primary/10' : ''}`}
					onclick={() => toggleHeading(1)}
				>
					H1
				</Button>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					class={`h-8 px-2 text-xs ${editorState.editor?.isActive('heading', { level: 2 }) ? 'bg-primary/10' : ''}`}
					onclick={() => toggleHeading(2)}
				>
					H2
				</Button>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					class={`h-8 px-2 text-xs ${editorState.editor?.isActive('heading', { level: 3 }) ? 'bg-primary/10' : ''}`}
					onclick={() => toggleHeading(3)}
				>
					H3
				</Button>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					class={`h-8 px-2 text-xs ${editorState.editor?.isActive('heading', { level: 4 }) ? 'bg-primary/10' : ''}`}
					onclick={() => toggleHeading(4)}
				>
					H4
				</Button>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					class={`h-8 px-2 text-xs ${editorState.editor?.isActive('heading', { level: 5 }) ? 'bg-primary/10' : ''}`}
					onclick={() => toggleHeading(5)}
				>
					H5
				</Button>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					class={`h-8 px-2 text-xs ${editorState.editor?.isActive('heading', { level: 6 }) ? 'bg-primary/10' : ''}`}
					onclick={() => toggleHeading(6)}
				>
					H6
				</Button>

				<div class="w-px h-8 bg-border mx-1"></div>

				<!-- Lists -->
				<Button
					type="button"
					variant="ghost"
					size="sm"
					class={`h-8 w-8 p-0 ${editorState.editor?.isActive('bulletList') ? 'bg-primary/10' : ''}`}
					onclick={toggleBulletList}
					aria-label="Bullet list"
				>
					<List class="h-4 w-4" />
				</Button>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					class={`h-8 w-8 p-0 ${editorState.editor?.isActive('orderedList') ? 'bg-primary/10' : ''}`}
					onclick={toggleOrderedList}
					aria-label="Numbered list"
				>
					<ListOrdered class="h-4 w-4" />
				</Button>

				<div class="w-px h-8 bg-border mx-1"></div>

				<!-- Hard Break -->
				<Button
					type="button"
					variant="ghost"
					size="sm"
					class="h-8 w-8 p-0"
					onclick={insertHardBreak}
					aria-label="Line break"
				>
					<WrapText class="h-4 w-4" />
				</Button>

				<!-- Link -->
				<Button
					type="button"
					variant="ghost"
					size="sm"
					class={`h-8 w-8 p-0 ${editorState.editor?.isActive('link') ? 'bg-primary/10' : ''}`}
					onclick={addLink}
					aria-label="Insert link"
				>
					<LinkIcon class="h-4 w-4" />
				</Button>

				<div class="w-px h-8 bg-border mx-1"></div>

				<!-- Table -->
				<Button
					type="button"
					variant="ghost"
					size="sm"
					class={`h-8 w-8 p-0 ${editorState.editor?.isActive('table') ? 'bg-primary/10' : ''}`}
					onclick={insertTable}
					aria-label="Insert table"
				>
					<TableIcon class="h-4 w-4" />
				</Button>

				<div class="w-px h-8 bg-border mx-1"></div>

				<!-- Undo/Redo -->
				<Button
					type="button"
					variant="ghost"
					size="sm"
					class="h-8 w-8 p-0"
					onclick={undo}
					aria-label="Undo"
				>
					<Undo class="h-4 w-4" />
				</Button>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					class="h-8 w-8 p-0"
					onclick={redo}
					aria-label="Redo"
				>
					<Redo class="h-4 w-4" />
				</Button>
			</div>
		{/if}

		<!-- Editor - Always rendered for bind:this, but hidden when loading -->
		<div
			class="rounded-md border border-input bg-transparent focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
			class:hidden={isLoading}
			bind:this={editorElement}
		></div>

		<!-- Character Count - shown when editor is ready -->
		{#if editorState.editor && !isLoading}
			{#if maxLength}
				<p class="text-xs text-muted-foreground text-right">
					{characterCount} / {maxLength} characters
				</p>
			{:else}
				<p class="text-xs text-muted-foreground text-right">{characterCount} characters</p>
			{/if}
		{/if}
	</div>

	{#snippet failed(error: any, reset)}
		<div class="space-y-2">
			<Textarea
				{value}
				onchange={(e) => {
					value = e.currentTarget.value;
					onchange?.(e.currentTarget.value);
				}}
				{placeholder}
				class="min-h-[200px]"
			/>
			<p class="text-xs text-destructive">
				Rich text editor unavailable. Using plain text mode. {error.message}
			</p>
		</div>
	{/snippet}
</svelte:boundary>
